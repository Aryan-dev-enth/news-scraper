import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const KEYWORDS = [
  // India & local conflicts
  'war', 'attack', 'border', 'terror', 'clash', 'military', 'army', 'navy', 'air force',
  'loc', 'ladakh', 'kashmir', 'drdo', 'naxal', 'manipur', 'insurgency',
  'operation', 'terrorist', 'counter terror', 'bombing', 'IED', 'terror suspect', 'terror cell',
  
  // Regional focus
  'pakistan', 'china', 'bangladesh', 'afghanistan', 'taliban', 'militant', 'cross-border', 
  'ceasefire', 'army clash', 'terror attack', 'terror plot', 'border tension', 'drone strike'
];


const SOURCES = [
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/' },
  { name: 'WION', url: 'https://www.wionews.com/india' },
  { name: 'NDTV', url: 'https://www.ndtv.com/india' },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/india' },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/india-news' },
  { name: 'India Today', url: 'https://www.indiatoday.in/india' },
  { name: 'ANI News', url: 'https://www.aninews.in/news/national/general-news/' },
  { name: 'BBC India', url: 'https://www.bbc.com/news/world/asia/india' },
];

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  image: string | null;
  publishedAt: string;
  score: number;
}

// ================================
//      UTILITY FUNCTIONS
// ================================
function saveJson(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadJson(file: string) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function computeScore(article: Omit<NewsArticle, 'score'>): number {
  let score = 0;
  const text = `${article.title} ${article.description}`.toLowerCase();
  KEYWORDS.forEach(k => {
    if (text.includes(k)) score += 5;
  });
  const ageMinutes = (Date.now() - new Date(article.publishedAt).getTime()) / 60000;
  score += Math.max(0, 60 - ageMinutes);
  return score;
}

function mergeSimilarNews(newsList: (Omit<NewsArticle, 'score'>)[]): NewsArticle[] {
  const merged: NewsArticle[] = [];
  const seen = new Set<string>();

  for (const article of newsList) {
    if (seen.has(article.url)) continue;

   const duplicates = newsList.filter(a =>
  article.title.toLowerCase().replace(/[^a-z ]/g, '').includes(
    a.title.toLowerCase().replace(/[^a-z ]/g, '')
  )
);


    const sources = [...new Set(duplicates.map(d => d.source))].join(', ');
    const description = article.description.length > 250
      ? article.description.substring(0, 247) + '...'
      : article.description;

    const mergedArticle: Omit<NewsArticle, 'score'> = {
      title: article.title,
      description,
      source: sources,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
    };

    merged.push({
      ...mergedArticle,
      score: computeScore(mergedArticle),
    });

    duplicates.forEach(d => seen.add(d.url));
  }

  
  merged.sort((a, b) => {
  const dateDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  if (dateDiff !== 0) return dateDiff;
  return b.score - a.score;
});

  return merged;
}

async function fetchPublishedDate(url: string, sourceName: string): Promise<string> {
  try {
    const res = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(res.data);

    let date: string | undefined;

    if (sourceName === 'The Hindu') {
      date = $('meta[property="article:published_time"]').attr('content') 
          || $('time').attr('datetime');
    } else if (sourceName === 'Indian Express') {
      date = $('meta[property="article:published_time"]').attr('content') 
          || $('meta[name="ptime"]').attr('content');
    } else if (sourceName === 'WION') {
      date = $('meta[itemprop="datePublished"]').attr('content') 
          || $('time').attr('datetime');
    }

    return date ? new Date(date).toISOString() : new Date().toISOString();
  } catch (err) {
    console.log(`⚠️ Could not fetch published date for ${url}:`, err);
    return new Date().toISOString();
  }
}

// ================================
//      SCRAPE NEWS FUNCTION
// ================================
export async function scrapeNews(): Promise<NewsArticle[]> {
  const newsData: (Omit<NewsArticle, 'score'>)[] = [];

  for (const source of SOURCES) {
    try {
      const res = await axios.get(source.url, { timeout: 15000 });
      const $ = cheerio.load(res.data);

      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();

        if (!title || !href) return;
        if (!KEYWORDS.some(k => title.toLowerCase().includes(k))) return;
        if (newsData.find(a => a.url === href)) return;

        const url = href.startsWith('http') ? href : source.url + href;

        newsData.push({
          title,
          description: '',
          source: source.name,
          url,
          image: null,
          publishedAt: '', // will fetch next
        });
      });
    } catch (err) {
      console.error(`⚠️ Error scraping ${source.name}:`, err);
    }
  }

  // Fetch description, image, and authentic publishedAt
  for (const article of newsData) {
    try {
      const res = await axios.get(article.url, { timeout: 15000 });
      const $ = cheerio.load(res.data);

      let desc = $('meta[name="description"]').attr('content');
      if (!desc) desc = $('p').first().text().trim();
      article.description = desc;

      let img = $('meta[property="og:image"]').attr('content');
      if (!img) img = $('img').first().attr('src');
      article.image = img;

      article.publishedAt = await fetchPublishedDate(article.url, article.source);

    } catch (err) {
      console.log(`⚠️ Could not fetch details for ${article.url}:`, err);
      article.publishedAt = new Date().toISOString();
    }
  }

  return mergeSimilarNews(newsData);
}

// ================================
//      FILE SAVE EXAMPLE
// ================================
const NEWS_FILE = path.join(__dirname, 'news.json');
(async () => {
  const news = await scrapeNews();
  saveJson(NEWS_FILE, news);
})();
