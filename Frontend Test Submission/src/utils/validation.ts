import { CreateUrlRequest } from '../types';

export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidShortcode = (shortcode: string): boolean => {
  if (!shortcode || typeof shortcode !== 'string') return false;
  
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(shortcode) && shortcode.length >= 4 && shortcode.length <= 20;
};

export const isValidValidity = (validity: number): boolean => {
  return Number.isInteger(validity) && validity > 0 && validity <= 525600;
};

export const validateUrlRequest = (request: CreateUrlRequest): string[] => {
  const errors: string[] = [];

  if (!request.url) {
    errors.push('URL is required');
  } else if (!isValidUrl(request.url)) {
    errors.push('Please enter a valid URL (must start with http:// or https://)');
  }

  if (request.shortcode && !isValidShortcode(request.shortcode)) {
    errors.push('Shortcode must be 4-20 characters long and contain only letters, numbers, hyphens, and underscores');
  }

  if (request.validity !== undefined && !isValidValidity(request.validity)) {
    errors.push('Validity must be a positive integer (max 525600 minutes)');
  }

  return errors;
};

export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'Unknown Domain';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Invalid Date';
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDateTime(dateString);
  } catch {
    return 'Unknown';
  }
};

export const isExpired = (expiryDate: string): boolean => {
  try {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
  } catch {
    return true;
  }
};