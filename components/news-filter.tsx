'use client';

interface NewsFilterProps {
  sources: string[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

export default function NewsFilter({ sources, selectedSource, onSourceChange }: NewsFilterProps) {
  return (
    <div className="border-b border-border bg-background/50 sticky top-16 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4 scrollbar-hide">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => onSourceChange(source)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedSource === source
                  ? 'bg-accent text-accent-foreground border border-accent'
                  : 'bg-secondary text-foreground border border-border hover:border-accent'
              }`}
            >
              {source === 'all' ? '🌍 All News' : source}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
