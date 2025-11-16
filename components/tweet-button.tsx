'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

interface TweetButtonProps {
  title: string;
  url: string;
  image?: string | null;
  variant?: 'default' | 'icon' | 'solid';
  onClose?: () => void;
  onConfirm?: (tweetText: string, includeImage: boolean) => void;
  isInModal?: boolean;
}

export default function TweetButton({ 
  title, 
  url, 
  image,
  variant = 'default',
  onClose,
  onConfirm,
  isInModal = false
}: TweetButtonProps) {
  const [tweetText, setTweetText] = React.useState(`Breaking News: ${title}`);
  const [includeImage, setIncludeImage] = React.useState(true);

  const tweetPreview = useMemo(() => {
    const urlLength = 23; // Twitter shortens URLs to 23 chars
    const textWithUrl = `${tweetText} ${url}`;
    const totalLength = tweetText.length + urlLength;
    return {
      text: tweetText,
      totalLength,
      remaining: 280 - totalLength,
      isValid: totalLength <= 280,
    };
  }, [tweetText, url]);

const handleConfirm = () => {
  if (onConfirm) {
    onConfirm(tweetText, includeImage);
  } else {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    // Open in a new tab
    window.open(twitterUrl, '_blank');
  }
  if (onClose) onClose();
};


  if (isInModal) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Tweet Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Customize Tweet</label>
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value.slice(0, 280))}
            className="w-full px-4 py-3 bg-secondary border border-border text-foreground rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent text-sm leading-relaxed"
            rows={4}
            placeholder="Write your tweet..."
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{tweetText.length}/280 characters</p>
            <p className={`text-xs font-semibold ${tweetPreview.remaining >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {tweetPreview.remaining} remaining
            </p>
          </div>
        </div>

        {/* Image Toggle */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
          <input
            type="checkbox"
            checked={includeImage}
            onChange={(e) => setIncludeImage(e.target.checked)}
            className="w-4 h-4 rounded border border-border accent-accent"
          />
          <span className="text-sm text-foreground font-medium">Include image in tweet</span>
        </label>

        {/* Live Tweet Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground">Preview</label>
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            {/* Twitter-like preview */}
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Your Account</p>
                <p className="text-xs text-muted-foreground">@username • now</p>
              </div>
            </div>
            
            {/* Tweet content */}
            <p className="text-sm text-foreground leading-relaxed break-words">{tweetText}</p>
            
            {/* Image preview if included */}
            {includeImage && image && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-secondary">
                <Image
                  src={image || "/placeholder.svg"}
                  alt="Tweet image preview"
                  fill
                  className="object-cover"
                  sizes="100%"
                />
              </div>
            )}

            {/* Link preview */}
            <div className="border border-border rounded-lg p-2 text-xs">
              <p className="text-muted-foreground truncate">🔗 {new URL(url).hostname}</p>
            </div>

            {/* Character count indicator */}
            <div className="flex items-center gap-2 pt-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${tweetPreview.remaining >= 0 ? 'bg-accent' : 'bg-destructive'}`}
                  style={{ width: `${Math.min(100, (tweetPreview.totalLength / 280) * 100)}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${tweetPreview.remaining >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {tweetPreview.totalLength}/280
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col-reverse">
          <button
            onClick={() => onClose?.()}
            className="px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tweetPreview.isValid}
            className="px-4 py-2.5 rounded-lg  bg-blue-500/90 text-white border border-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Post Tweet
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20 hover:border-blue-500/40"
        title="Share on Twitter"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      </a>
    );
  }

  return (
    <a
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-medium hover:bg-blue-500/30 transition-colors border border-blue-500/30 hover:border-blue-500/50 text-sm"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
      Tweet This
    </a>
  );
}
