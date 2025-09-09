import { UrlStatsResponse, ClickData } from '../models/types';
import { db } from './database';
import { Log } from '../../logging-middleware';

export class StatsService {
  async getUrlStats(shortCode: string): Promise<UrlStatsResponse> {
    try {
      await Log('backend', 'info', 'service', `Fetching stats for shortcode: ${shortCode}`);

      const shortUrl = await db.getShortUrlByCode(shortCode);
      
      if (!shortUrl) {
        await Log('backend', 'warn', 'service', `Stats requested for non-existent shortcode: ${shortCode}`);
        throw new Error('Short URL not found');
      }

      const clicks = await db.getClicksByShortUrlId(shortCode);
      
      const clickData: ClickData[] = clicks.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        location: click.location || 'Unknown'
      }));

      const stats: UrlStatsResponse = {
        shortUrl: shortUrl.shortLink,
        originalUrl: shortUrl.originalUrl,
        shortCode: shortUrl.shortCode,
        createdAt: shortUrl.createdAt.toISOString(),
        expiresAt: shortUrl.expiresAt.toISOString(),
        totalClicks: clicks.length,
        isActive: shortUrl.isActive && new Date() < shortUrl.expiresAt,
        clicks: clickData
      };

      await Log('backend', 'info', 'service', `Stats retrieved successfully for ${shortCode}: ${clicks.length} clicks`);
      
      return stats;
    } catch (error) {
      await Log('backend', 'error', 'service', `Failed to get stats for ${shortCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getAllUrlStats(): Promise<UrlStatsResponse[]> {
    try {
      await Log('backend', 'info', 'service', 'Fetching all URL statistics');

      const allShortUrls = await db.getAllShortUrls();
      const statsPromises = allShortUrls.map(shortUrl => 
        this.getUrlStats(shortUrl.shortCode)
      );

      const allStats = await Promise.all(statsPromises);
      
      await Log('backend', 'info', 'service', `Retrieved stats for ${allStats.length} URLs`);
      
      return allStats;
    } catch (error) {
      await Log('backend', 'error', 'service', `Failed to get all stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

export default StatsService;