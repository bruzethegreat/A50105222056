import { ShortUrl, Click } from '../models/types';
import { Log } from '../../logging-middleware';

class Database {
  private shortUrls: Map<string, ShortUrl> = new Map();
  private clicks: Map<string, Click> = new Map();

  async saveShortUrl(shortUrl: ShortUrl): Promise<void> {
    await Log('backend', 'info', 'db', `Saving short URL: ${shortUrl.shortCode}`);
    this.shortUrls.set(shortUrl.shortCode, shortUrl);
    await Log('backend', 'info', 'db', `Short URL saved successfully: ${shortUrl.shortCode}`);
  }

  async getShortUrlByCode(shortCode: string): Promise<ShortUrl | null> {
    await Log('backend', 'info', 'db', `Retrieving short URL by code: ${shortCode}`);
    const shortUrl = this.shortUrls.get(shortCode);
    if (shortUrl) {
      await Log('backend', 'info', 'db', `Short URL found: ${shortCode}`);
    } else {
      await Log('backend', 'warn', 'db', `Short URL not found: ${shortCode}`);
    }
    return shortUrl || null;
  }

  async getAllShortUrls(): Promise<ShortUrl[]> {
    await Log('backend', 'info', 'db', 'Retrieving all short URLs');
    const urls = Array.from(this.shortUrls.values());
    await Log('backend', 'info', 'db', `Retrieved ${urls.length} short URLs`);
    return urls;
  }

  async shortCodeExists(shortCode: string): Promise<boolean> {
    await Log('backend', 'info', 'db', `Checking existence of shortcode: ${shortCode}`);
    const exists = this.shortUrls.has(shortCode);
    await Log('backend', 'info', 'db', `Shortcode ${shortCode} exists: ${exists}`);
    return exists;
  }

  async updateShortUrl(shortUrl: ShortUrl): Promise<void> {
    await Log('backend', 'info', 'db', `Updating short URL: ${shortUrl.shortCode}`);
    this.shortUrls.set(shortUrl.shortCode, shortUrl);
    await Log('backend', 'info', 'db', `Short URL updated: ${shortUrl.shortCode}`);
  }

  async saveClick(click: Click): Promise<void> {
    await Log('backend', 'info', 'db', `Saving click for shortcode: ${click.shortUrlId}`);
    this.clicks.set(click.id, click);
    
    const shortUrl = this.shortUrls.get(click.shortUrlId);
    if (shortUrl) {
      shortUrl.clicks.push(click);
      await this.updateShortUrl(shortUrl);
      await Log('backend', 'info', 'db', `Click saved for ${click.shortUrlId} from ${click.location}`);
    } else {
      await Log('backend', 'warn', 'db', `Short URL not found for click: ${click.shortUrlId}`);
    }
  }

  async getClicksByShortUrlId(shortUrlId: string): Promise<Click[]> {
    await Log('backend', 'info', 'db', `Retrieving clicks for shortcode: ${shortUrlId}`);
    const shortUrl = this.shortUrls.get(shortUrlId);
    const clicks = shortUrl ? shortUrl.clicks : [];
    await Log('backend', 'info', 'db', `Retrieved ${clicks.length} clicks for ${shortUrlId}`);
    return clicks;
  }

  async getActiveShortUrls(): Promise<ShortUrl[]> {
    await Log('backend', 'info', 'db', 'Retrieving active short URLs');
    const now = new Date();
    const activeUrls = Array.from(this.shortUrls.values()).filter(
      url => url.isActive && url.expiresAt > now
    );
    await Log('backend', 'info', 'db', `Retrieved ${activeUrls.length} active short URLs`);
    return activeUrls;
  }
}

export const db = new Database();
export default Database;