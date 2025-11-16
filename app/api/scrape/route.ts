import { scrapeNews } from '@/lib/scraper';

export const maxDuration = 60;

export async function GET() {
  try {
    const news = await scrapeNews();
    return Response.json({ success: true, data: news, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Scraping error:', error);
    return Response.json({ success: false, error: 'Scraping failed' }, { status: 500 });
  }
}
