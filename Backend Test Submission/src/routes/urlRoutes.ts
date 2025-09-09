import { Router } from 'express';
import { UrlController } from '../controllers/urlController';

export function createUrlRoutes(baseUrl: string): Router {
  const router = Router();
  const urlController = new UrlController(baseUrl);

  // Create short URL - POST /shorturls
  router.post('/shorturls', async (req, res) => {
    await urlController.createShortUrl(req, res);
  });

  // Get URL statistics - GET /shorturls/:shortcode
  router.get('/shorturls/:shortcode', async (req, res) => {
    await urlController.getUrlStats(req, res);
  });

  // Get all URL statistics - GET /shorturls
  router.get('/shorturls', async (req, res) => {
    await urlController.getAllUrlStats(req, res);
  });

  // Redirect short URL - GET /:shortcode
  router.get('/:shortcode', async (req, res) => {
    await urlController.redirectToUrl(req, res);
  });

  return router;
}

export default createUrlRoutes;