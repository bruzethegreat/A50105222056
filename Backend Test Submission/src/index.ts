import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createUrlRoutes } from './routes/urlRoutes';
import { initializeLogging, requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/loggingMiddleware';
import { Log } from '../logging-middleware';

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbmtpdC52ZXJtYTJAcy5hbWl0eS5lZHUiLCJleHAiOjE3NTc0MDIyOTIsImlhdCI6MTc1NzQwMTM5MiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImI5YTA2YjRjLTkzODktNDZiNC1iNmZmLWRiZTVlMDk4MGZlOSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImFua2l0IGt1bWFyIHZlcm1hIiwic3ViIjoiNTljYjExYmQtZWU2OC00OWU3LTlmODgtNmMxMTBmN2JhYzkwIn0sImVtYWlsIjoiYW5raXQudmVybWEyQHMuYW1pdHkuZWR1IiwibmFtZSI6ImFua2l0IGt1bWFyIHZlcm1hIiwicm9sbE5vIjoiYTUwMTA1MjIyMDU2IiwiYWNjZXNzQ29kZSI6IlRxRm5qSCIsImNsaWVudElEIjoiNTljYjExYmQtZWU2OC00OWU3LTlmODgtNmMxMTBmN2JhYzkwIiwiY2xpZW50U2VjcmV0IjoiemJEV0NBZXlEZ2J0Z3VDayJ9.PUUVhm9wwl-oo2cJO9R5rXhFX-eKlbQAJukESpbJpaw';

initializeLogging(ACCESS_TOKEN);

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLoggingMiddleware);

app.use(morgan('combined', {
  skip: () => true
}));

app.get('/health', async (req, res) => {
  try {
    await Log('backend', 'info', 'handler', 'Health check endpoint accessed');
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'URL Shortener Microservice'
    });
  } catch (error) {
    await Log('backend', 'error', 'handler', `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString() 
    });
  }
});

app.use('/', createUrlRoutes(BASE_URL));

app.use((req, res) => {
  Log('backend', 'warn', 'handler', `404 - Route not found: ${req.method} ${req.originalUrl}`).catch(() => {});
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

app.use(errorLoggingMiddleware);

app.listen(PORT, async () => {
  try {
    await Log('backend', 'info', 'service', `URL Shortener Microservice started on ${BASE_URL}`);
    await Log('backend', 'info', 'service', `Health check available at ${BASE_URL}/health`);
    await Log('backend', 'info', 'service', 'API endpoints available: POST /shorturls, GET /shorturls/:shortcode, GET /shorturls, GET /:shortcode');
  } catch (error) {
    await Log('backend', 'fatal', 'service', `Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`).catch(() => {});
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await Log('backend', 'info', 'service', 'Server shutting down gracefully');
    process.exit(0);
  } catch (error) {
    await Log('backend', 'error', 'service', `Error during shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`).catch(() => {});
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  try {
    await Log('backend', 'info', 'service', 'Server interrupted, shutting down gracefully');
    process.exit(0);
  } catch (error) {
    await Log('backend', 'error', 'service', `Error during shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`).catch(() => {});
    process.exit(1);
  }
});

export default app;