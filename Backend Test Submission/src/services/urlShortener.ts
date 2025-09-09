import { v4 as uuidv4 } from 'uuid';
import { ShortUrl, CreateShortUrlRequest, CreateShortUrlResponse, Click } from '../models/types';
import { db } from './database';
import { Log } from '../../logging-middleware';

export class UrlShortenerService {
  private readonly baseUrl: string;
  private readonly defaultValidityMinutes = 30;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createShortUrl(request: CreateShortUrlRequest): Promise<CreateShortUrlResponse> {
    try {
      await Log('backend', 'info', 'service', `Creating short URL for: ${request.url}`);

      if (!this.isValidUrl(request.url)) {
        await Log('backend', 'warn', 'service', 'Invalid URL format provided');
        throw new Error('Invalid URL format');
      }

      const validity = request.validity || this.defaultValidityMinutes;
      
      let shortCode: string;
      if (request.shortcode) {
        if (!this.isValidShortcode(request.shortcode)) {
          await Log('backend', 'warn', 'service', `Invalid shortcode format: ${request.shortcode}`);
          throw new Error('Invalid shortcode format. Only alphanumeric characters allowed.');
        }
        
        if (await db.shortCodeExists(request.shortcode)) {
          await Log('backend', 'warn', 'service', `Shortcode already exists: ${request.shortcode}`);
          throw new Error('Shortcode already exists');
        }
        shortCode = request.shortcode;
      } else {
        shortCode = await this.generateUniqueShortCode();
      }

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + validity * 60 * 1000);

      const shortUrl: ShortUrl = {
        id: uuidv4(),
        originalUrl: request.url,
        shortCode,
        shortLink: `${this.baseUrl}/${shortCode}`,
        createdAt,
        expiresAt,
        validity,
        clicks: [],
        isActive: true
      };

      await db.saveShortUrl(shortUrl);

      await Log('backend', 'info', 'service', `Short URL created successfully: ${shortUrl.shortLink}`);

      return {
        shortLink: shortUrl.shortLink,
        expiry: shortUrl.expiresAt.toISOString()
      };
    } catch (error) {
      await Log('backend', 'error', 'service', `Failed to create short URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async redirectToOriginalUrl(shortCode: string, ipAddress: string, userAgent: string, referrer: string): Promise<string> {
    try {
      await Log('backend', 'info', 'service', `Redirect requested for shortcode: ${shortCode}`);

      const shortUrl = await db.getShortUrlByCode(shortCode);
      
      if (!shortUrl) {
        await Log('backend', 'warn', 'service', `Shortcode not found: ${shortCode}`);
        throw new Error('Short URL not found');
      }

      if (new Date() > shortUrl.expiresAt) {
        await Log('backend', 'warn', 'service', `Expired shortcode accessed: ${shortCode}`);
        throw new Error('Short URL has expired');
      }

      if (!shortUrl.isActive) {
        await Log('backend', 'warn', 'service', `Inactive shortcode accessed: ${shortCode}`);
        throw new Error('Short URL is no longer active');
      }

      await this.recordClick(shortUrl, ipAddress, userAgent, referrer);

      await Log('backend', 'info', 'service', `Successful redirect for ${shortCode} to ${shortUrl.originalUrl}`);

      return shortUrl.originalUrl;
    } catch (error) {
      await Log('backend', 'error', 'service', `Redirect failed for ${shortCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async recordClick(shortUrl: ShortUrl, ipAddress: string, userAgent: string, referrer: string): Promise<void> {
    try {
      const geoip = require('geoip-lite');
      const geo = geoip.lookup(ipAddress);
      
      const click: Click = {
        id: uuidv4(),
        shortUrlId: shortUrl.shortCode,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        referrer: referrer || 'direct',
        country: geo?.country,
        city: geo?.city,
        location: geo ? `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}` : 'Unknown'
      };

      await db.saveClick(click);
      await Log('backend', 'info', 'service', `Click recorded for ${shortUrl.shortCode}`);
    } catch (error) {
      await Log('backend', 'error', 'service', `Failed to record click: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidShortcode(shortcode: string): boolean {
    return /^[a-zA-Z0-9]{1,20}$/.test(shortcode);
  }

  private async generateUniqueShortCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const shortCode = this.generateRandomString(6);
      if (!(await db.shortCodeExists(shortCode))) {
        return shortCode;
      }
      attempts++;
    }

    return uuidv4().replace(/-/g, '').substring(0, 8);
  }

  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default UrlShortenerService;