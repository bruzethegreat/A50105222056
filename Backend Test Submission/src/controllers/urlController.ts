import { Request, Response } from 'express';
import { CreateShortUrlRequest } from '../models/types';
import { UrlShortenerService } from '../services/urlShortener';
import { StatsService } from '../services/statsService';
import { Log } from '../../logging-middleware';

export class UrlController {
  private urlService: UrlShortenerService;
  private statsService: StatsService;

  constructor(baseUrl: string) {
    this.urlService = new UrlShortenerService(baseUrl);
    this.statsService = new StatsService();
  }

  async createShortUrl(req: Request, res: Response): Promise<void> {
    try {
      await Log('backend', 'info', 'controller', 'POST /shorturls - Create short URL request received');

      const { url, validity, shortcode }: CreateShortUrlRequest = req.body;

      if (!url) {
        await Log('backend', 'warn', 'controller', 'Missing required field: url');
        res.status(400).json({ 
          error: 'Bad Request', 
          message: 'URL is required' 
        });
        return;
      }

      if (validity !== undefined && (!Number.isInteger(validity) || validity <= 0)) {
        await Log('backend', 'warn', 'controller', 'Invalid validity value provided');
        res.status(400).json({ 
          error: 'Bad Request', 
          message: 'Validity must be a positive integer representing minutes' 
        });
        return;
      }

      const result = await this.urlService.createShortUrl({ url, validity, shortcode });

      await Log('backend', 'info', 'controller', `Short URL created successfully: ${result.shortLink}`);

      res.status(201).json(result);
    } catch (error) {
      await Log('backend', 'error', 'controller', `Create short URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid URL format')) {
          res.status(400).json({ 
            error: 'Bad Request', 
            message: 'Invalid URL format' 
          });
        } else if (error.message.includes('Invalid shortcode format')) {
          res.status(400).json({ 
            error: 'Bad Request', 
            message: 'Invalid shortcode format. Only alphanumeric characters allowed.' 
          });
        } else if (error.message.includes('already exists')) {
          res.status(409).json({ 
            error: 'Conflict', 
            message: 'Shortcode already exists' 
          });
        } else {
          res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to create short URL' 
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Internal Server Error', 
          message: 'Unknown error occurred' 
        });
      }
    }
  }

  async redirectToUrl(req: Request, res: Response): Promise<void> {
    try {
      const { shortcode } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const referrer = req.get('Referer') || 'direct';

      await Log('backend', 'info', 'controller', `GET /${shortcode} - Redirect request received`);

      if (!shortcode) {
        await Log('backend', 'warn', 'controller', 'Missing shortcode in redirect request');
        res.status(400).json({ 
          error: 'Bad Request', 
          message: 'Shortcode is required' 
        });
        return;
      }

      const originalUrl = await this.urlService.redirectToOriginalUrl(
        shortcode, 
        ipAddress, 
        userAgent, 
        referrer
      );

      await Log('backend', 'info', 'controller', `Redirecting ${shortcode} to ${originalUrl}`);

      res.redirect(302, originalUrl);
    } catch (error) {
      await Log('backend', 'error', 'controller', `Redirect failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ 
            error: 'Not Found', 
            message: 'Short URL not found' 
          });
        } else if (error.message.includes('expired')) {
          res.status(410).json({ 
            error: 'Gone', 
            message: 'Short URL has expired' 
          });
        } else if (error.message.includes('not active')) {
          res.status(410).json({ 
            error: 'Gone', 
            message: 'Short URL is no longer active' 
          });
        } else {
          res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Redirect failed' 
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Internal Server Error', 
          message: 'Unknown error occurred' 
        });
      }
    }
  }

  async getUrlStats(req: Request, res: Response): Promise<void> {
    try {
      const { shortcode } = req.params;

      await Log('backend', 'info', 'controller', `GET /shorturls/${shortcode} - Stats request received`);

      if (!shortcode) {
        await Log('backend', 'warn', 'controller', 'Missing shortcode in stats request');
        res.status(400).json({ 
          error: 'Bad Request', 
          message: 'Shortcode is required' 
        });
        return;
      }

      const stats = await this.statsService.getUrlStats(shortcode);

      await Log('backend', 'info', 'controller', `Stats retrieved successfully for ${shortcode}`);

      res.status(200).json(stats);
    } catch (error) {
      await Log('backend', 'error', 'controller', `Get stats failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ 
          error: 'Not Found', 
          message: 'Short URL not found' 
        });
      } else {
        res.status(500).json({ 
          error: 'Internal Server Error', 
          message: 'Failed to retrieve statistics' 
        });
      }
    }
  }

  async getAllUrlStats(req: Request, res: Response): Promise<void> {
    try {
      await Log('backend', 'info', 'controller', 'GET /shorturls - All stats request received');

      const stats = await this.statsService.getAllUrlStats();

      await Log('backend', 'info', 'controller', `All stats retrieved successfully: ${stats.length} URLs`);

      res.status(200).json(stats);
    } catch (error) {
      await Log('backend', 'error', 'controller', `Get all stats failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Failed to retrieve statistics' 
      });
    }
  }
}

export default UrlController;