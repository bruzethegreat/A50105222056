export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortLink: string;
  createdAt: Date;
  expiresAt: Date;
  validity: number; // in minutes
  clicks: Click[];
  isActive: boolean;
}

export interface Click {
  id: string;
  shortUrlId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer: string;
  country?: string;
  city?: string;
  location?: string;
}

export interface CreateShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateShortUrlResponse {
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