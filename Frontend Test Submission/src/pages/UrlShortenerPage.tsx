import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Add,
  ContentCopy,
  Link as LinkIcon,
  Schedule,
  Code,
  Launch,
  Delete,
} from '@mui/icons-material';
import { CreateUrlRequest, ShortUrlResponse, ApiError } from '../types';
import { ApiService } from '../services/api';
import { LoggingService } from '../services/logger';
import { validateUrlRequest, formatUrl, formatDateTime } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  expiry: string;
  createdAt: string;
}

const UrlShortenerPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    LoggingService.logPageView('URL Shortener Page');
    return () => {
      LoggingService.logComponentUnmount('UrlShortenerPage');
    };
  }, []);

  const createNewUrl = (): CreateUrlRequest => ({
    url: '',
    validity: undefined,
    shortcode: undefined,
  });

  const [newUrls, setNewUrls] = useState<CreateUrlRequest[]>([createNewUrl()]);

  const handleUrlChange = (index: number, field: keyof CreateUrlRequest, value: string | number | undefined) => {
    const updatedUrls = [...newUrls];
    if (field === 'validity') {
      updatedUrls[index][field] = value ? Number(value) : undefined;
    } else {
      updatedUrls[index][field] = value as string;
    }
    setNewUrls(updatedUrls);
    setError('');
  };

  const handleAddUrlField = () => {
    if (newUrls.length < 5) {
      setNewUrls([...newUrls, createNewUrl()]);
      LoggingService.logUserAction('Add URL field', { totalFields: newUrls.length + 1 });
    }
  };

  const handleRemoveUrlField = (index: number) => {
    if (newUrls.length > 1) {
      const updatedUrls = newUrls.filter((_, i) => i !== index);
      setNewUrls(updatedUrls);
      LoggingService.logUserAction('Remove URL field', { totalFields: updatedUrls.length });
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const validUrls = newUrls.filter(url => url.url.trim());
    if (validUrls.length === 0) {
      setError('Please enter at least one URL to shorten');
      return;
    }

    const allErrors: string[] = [];
    validUrls.forEach((url, index) => {
      const errors = validateUrlRequest({ ...url, url: formatUrl(url.url) });
      if (errors.length > 0) {
        allErrors.push(`URL ${index + 1}: ${errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      setError(allErrors.join('; '));
      return;
    }

    setLoading(true);
    
    try {
      const results: ShortenedUrl[] = [];
      
      for (let index = 0; index < validUrls.length; index++) {
        const urlRequest = validUrls[index];
        try {
          const formattedRequest: CreateUrlRequest = {
            ...urlRequest,
            url: formatUrl(urlRequest.url),
          };

          LoggingService.logUserAction('Create short URL attempt', formattedRequest);
          const response: ShortUrlResponse = await ApiService.createShortUrl(formattedRequest);
          
          results.push({
            id: Date.now().toString() + index,
            originalUrl: formattedRequest.url,
            shortUrl: response.shortLink,
            expiry: response.expiry,
            createdAt: new Date().toISOString(),
          });

          LoggingService.logApiCall('POST', '/shorturls', true);
        } catch (apiError: any) {
          LoggingService.logApiCall('POST', '/shorturls', false);
          const errorMsg = apiError.message || 'Failed to shorten URL';
          allErrors.push(`URL ${index + 1}: ${errorMsg}`);
        }
      }

      if (results.length > 0) {
        setUrls(prev => [...results, ...prev]);
        setNewUrls([createNewUrl()]);
        setSuccess(`Successfully shortened ${results.length} URL${results.length > 1 ? 's' : ''}`);
        LoggingService.logInfo('component', `Successfully created ${results.length} short URLs`);
      }

      if (allErrors.length > 0) {
        setError(allErrors.join('; '));
      }
    } catch (error: any) {
      setError('An unexpected error occurred while shortening URLs');
      LoggingService.logError('component', 'URL shortening process failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(`${label} copied to clipboard!`);
      LoggingService.logUserAction('Copy to clipboard', { text: label });
    } catch (error) {
      LoggingService.logError('component', 'Failed to copy to clipboard');
    }
  };

  const handleRemoveShortenedUrl = (id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id));
    LoggingService.logUserAction('Remove shortened URL', { id });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        URL Shortener
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create Short URLs (Max 5 at once)
        </Typography>
        
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Collapse>

        <Collapse in={!!success}>
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Collapse>

        {newUrls.map((urlData, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" color="primary">
                  URL {index + 1}
                </Typography>
                {newUrls.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveUrlField(index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Original URL"
                  placeholder="https://example.com"
                  value={urlData.url}
                  onChange={(e) => handleUrlChange(index, 'url', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter the URL you want to shorten"
                />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    placeholder="my-link"
                    value={urlData.shortcode || ''}
                    onChange={(e) => handleUrlChange(index, 'shortcode', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Code />
                        </InputAdornment>
                      ),
                    }}
                    helperText="4-20 chars, letters, numbers, hyphens, underscores"
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Validity (minutes, optional)"
                    placeholder="1440"
                    value={urlData.validity || ''}
                    onChange={(e) => handleUrlChange(index, 'validity', e.target.value ? Number(e.target.value) : undefined)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Schedule />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Max 525600 minutes (1 year)"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}

        <Box display="flex" gap={2} mt={3}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || newUrls.every(url => !url.url.trim())}
            startIcon={loading ? undefined : <LinkIcon />}
            size="large"
          >
            {loading ? <LoadingSpinner size={20} message="" /> : 'Create Short URLs'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleAddUrlField}
            disabled={newUrls.length >= 5}
            startIcon={<Add />}
          >
            Add URL ({newUrls.length}/5)
          </Button>
        </Box>
      </Paper>

      {urls.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Shortened URLs
          </Typography>
          
          {urls.map((url) => (
            <Card key={url.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {url.originalUrl}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="h6" color="primary" sx={{ fontFamily: 'monospace' }}>
                        {url.shortUrl}
                      </Typography>
                      <Tooltip title="Copy short URL">
                        <IconButton
                          onClick={() => handleCopyToClipboard(url.shortUrl, 'Short URL')}
                          size="small"
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open original URL">
                        <IconButton
                          onClick={() => window.open(url.originalUrl, '_blank')}
                          size="small"
                        >
                          <Launch fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
                    <IconButton
                      onClick={() => handleRemoveShortenedUrl(url.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                    <Chip
                      label={`Expires: ${formatDateTime(url.expiry)}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default UrlShortenerPage;