import axios from 'axios';
import * as cheerio from 'cheerio';

const KEYWORDS = [
  'war', 'attack', 'border', 'terror', 'clash', 'military', 'army', 'navy', 'air force',
  'loc', 'ladakh', 'kashmir', 'pakistan', 'china', 'drdo', 'naxal', 'manipur', 'insurgency',
  'operation', 'terrorist', 'counter terror', 'bombing', 'IED', 'terror suspect', 'terror cell'
];

const SOURCES = [
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/' },
  { name: 'WION', url: 'https://www.wionews.com/india' },
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
      a.title.toLowerCase().replace(/[^a-z ]/g, '') ===
      article.title.toLowerCase().replace(/[^a-z ]/g, '')
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

  merged.sort((a, b) => b.score - a.score);
  return merged;
}

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
          publishedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.error(`Error scraping ${source.name}:`, err);
    }
  }

  // Fetch descriptions and images
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
    } catch (err) {
      console.log(`Could not fetch details for ${article.url}:`, err);
    }
  }

  return mergeSimilarNews(newsData);
}
