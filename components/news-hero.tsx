'use client';

import Image from 'next/image';
import TweetButton from './tweet-button';
import { useState } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  image: string | null;
  publishedAt: string;
  score: number;
}

export default function NewsHero({ article }: { article: NewsArticle }) {
  const [showTweetDialog, setShowTweetDialog] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 py-6 sm:py-12 lg:py-16">
          {/* Content */}
          <div className="flex flex-col justify-center order-2 md:order-1">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 w-fit">
              <div className="h-2 w-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-accent text-xs sm:text-sm font-semibold tracking-wider">BREAKING</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight text-balance">
              {article.title}
            </h2>
            
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed line-clamp-3">
              {article.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="flex flex-col gap-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Source</p>
                <p className="text-foreground font-semibold text-sm sm:text-base">{article.source}</p>
              </div>
              <div className="flex flex-col gap-1 sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Published</p>
                <p className="text-foreground font-semibold text-sm sm:text-base">{formatDate(article.publishedAt)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-sm sm:text-base"
              >
                Read Full Story
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <button
                onClick={() => setShowTweetDialog(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm sm:text-base"
              >
                Share Tweet
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative h-48 sm:h-64 md:h-full md:min-h-96 rounded-lg overflow-hidden border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 order-1 md:order-2">
            {article.image ? (
              <Image
                src={article.image || "/placeholder.svg?height=400&width=500&query=breaking news"}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 sm:w-20 h-16 sm:h-20 text-muted-foreground/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-muted-foreground/50 text-xs sm:text-sm">Featured News Image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTweetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-6">Customize & Preview Tweet</h3>
            
            <TweetButton 
              title={article.title} 
              url={article.url}
              image={article.image}
              onClose={() => setShowTweetDialog(false)}
              isInModal={true}
            />
          </div>
        </div>
      )}
    </section>
  );
}
