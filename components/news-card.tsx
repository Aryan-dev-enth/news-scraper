'use client';

import Image from 'next/image';
import { useState } from 'react';
import TweetButton from './tweet-button';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  image: string | null;
  publishedAt: string;
  score: number;
}

export default function NewsCard({ article }: { article: NewsArticle }) {
  const [showTweetDialog, setShowTweetDialog] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getScoreBadgeColor = (score: number) => {
    if (score > 50) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (score > 30) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getColorIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 5;
  };

  const colors = [
    'from-orange-500/20 to-red-500/20',
    'from-blue-500/20 to-purple-500/20',
    'from-green-500/20 to-emerald-500/20',
    'from-pink-500/20 to-rose-500/20',
    'from-indigo-500/20 to-blue-500/20',
  ];

  const colorIndex = getColorIndex(article.title);

  return (
    <>
      <div className="group relative block h-full bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
        {/* Image Container */}
        <div className={`relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center flex-shrink-0`}>
          {article.image ? (
            <Image
              src={article.image || "/placeholder.svg?height=300&width=400&query=news"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <>
              <div className="absolute inset-0 backdrop-blur-sm"></div>
              <div className="relative z-10 text-center px-4">
                <svg className="w-10 sm:w-12 h-10 sm:h-12 text-muted-foreground/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-muted-foreground/70">News Image</p>
              </div>
            </>
          )}
          
          {/* Score Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeColor(article.score)}`}>
            {Math.round(article.score)}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="text-foreground font-bold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>

          <p className="text-card-foreground text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
            {article.description}
          </p>

          <div className="space-y-2 text-xs mb-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Source</span>
              <span className="text-foreground font-medium line-clamp-1">{article.source}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="text-accent font-semibold">{formatDate(article.publishedAt)}</span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs bg-accent/10 text-accent px-2 py-1.5 rounded hover:bg-accent/20 transition-colors font-medium"
            >
              Read
            </a>
            <button
              onClick={() => setShowTweetDialog(true)}
              className="flex-1 text-center text-xs bg-secondary text-foreground px-2 py-1.5 rounded hover:bg-secondary/80 transition-colors font-medium"
            >
              Tweet
            </button>
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
    </>
  );
}
