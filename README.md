# Technical Assessment Submission

This repository contains three components developed as part of a technical assessment.

## Project Structure

### Frontend Test Submission
A React-based URL shortener application built with TypeScript and Material-UI.

**Features:**
- Clean and responsive user interface
- URL shortening functionality
- Form validation
- Error handling and loading states

**Tech Stack:** React, TypeScript, Material-UI, Axios

**Setup:**
```bash
cd "Frontend Test Submission"
npm install
npm start
```

### Backend Test Submission
An Express.js server providing URL shortening API with comprehensive request logging.

**Features:**
- RESTful API for URL shortening
- Request/response logging with detailed analytics
- IP geolocation and user agent parsing
- CORS support and security headers

**Tech Stack:** Node.js, Express, TypeScript, UUID

**Setup:**
```bash
cd "Backend Test Submission"
npm install
npm run dev
```

### Logging Middleware
A reusable TypeScript logging package for API communication.

**Features:**
- Type-safe logging interface
- Configurable log levels and packages
- Promise-based API
- Error handling and timeout support

**Tech Stack:** TypeScript, Axios

**Setup:**
```bash
cd "Logging Middleware"
npm install
npm run build
```

## API Endpoints

**POST /shorten**
- Request: `{ "url": "https://example.com" }`
- Response: `{ "id": "uuid", "shortUrl": "shortened-url" }`

## Development

Each component includes build scripts and can be developed independently. The logging middleware is designed to be imported and used by both frontend and backend applications.
