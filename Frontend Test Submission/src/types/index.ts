export interface ShortUrl {
  id: string;
  url: string;
  shortcode?: string;
  validity?: number;
}

export interface ShortUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface UrlStatsResponse {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  isActive: boolean;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: string;
  referrer: string;
  location: string;
}

export interface CreateUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface ApiError {
  error: string;
  message: string;
}