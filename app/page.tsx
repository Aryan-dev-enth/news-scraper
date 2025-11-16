'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import NewsCard from '@/components/news-card';
import NewsHero from '@/components/news-hero';
import NewsFilter from '@/components/news-filter';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  image: string | null;
  publishedAt: string;
  score: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const { data, error, isLoading, mutate } = useSWR('/api/scrape', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000,
    focusThrottleInterval: 3600000,
  });

  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [selectedSource, setSelectedSource] = useState('all');
  const [isScraping, setIsScraping] = useState(false);

  const newsData = data?.data || [];

  // Only update filtered news when data changes
  if (newsData.length > 0 && filteredNews.length === 0) {
    handleSourceFilter('all');
  }

  function handleSourceFilter(source: string) {
    setSelectedSource(source);
    if (source === 'all') {
      setFilteredNews(newsData);
    } else {
      setFilteredNews(newsData.filter(article => article.source.includes(source)));
    }
  }

  const handleRescrape = useCallback(async () => {
    setIsScraping(true);
    try {
      await mutate();
    } finally {
      setIsScraping(false);
    }
  }, [mutate]);

  const sources = ['all', ...new Set(newsData.flatMap(article => article.source.split(', ')))];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 bg-accent rounded-full animate-pulse flex-shrink-0"></div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">HOT NEWS</h1>
              {data && (
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={handleRescrape}
              disabled={isLoading || isScraping}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
            >
              <svg 
                className={`w-4 h-4 flex-shrink-0 transition-transform ${isLoading || isScraping ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{isLoading || isScraping ? 'Rescaping...' : 'Rescrape'}</span>
              <span className="sm:hidden">{isLoading || isScraping ? '...' : 'Refresh'}</span>
            </button>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2">Real-time breaking news (max 1 hour stale)</p>
        </div>
      </header>

      {/* Hero Section */}
      {filteredNews.length > 0 && <NewsHero article={filteredNews[0]} />}

      {/* Filters */}
      <NewsFilter sources={sources} selectedSource={selectedSource} onSourceChange={handleSourceFilter} />

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
        {(isLoading || isScraping) && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading fresh news...</p>
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium">Failed to load news</p>
          </div>
        )}
        {!isLoading && !isScraping && filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredNews.map((article) => (
              <NewsCard key={article.url} article={article} />
            ))}
          </div>
        ) : !isLoading && !isScraping && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No news articles found</p>
          </div>
        )}
      </div>
    </main>
  );
}
