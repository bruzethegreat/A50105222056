import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  ContentCopy,
  ExpandMore,
  ExpandLess,
  Launch,
  AccessTime,
  Mouse,
  Language,
} from '@mui/icons-material';
import { UrlStatsResponse } from '../types';
import { formatDateTime, formatTimeAgo, isExpired, extractDomain } from '../utils/validation';
import { LoggingService } from '../services/logger';

interface UrlCardProps {
  urlStats: UrlStatsResponse;
}

const UrlCard: React.FC<UrlCardProps> = ({ urlStats }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      LoggingService.logUserAction('Copy URL', { shortUrl: urlStats.shortUrl });
    } catch (error) {
      LoggingService.logError('component', 'Failed to copy to clipboard');
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
    LoggingService.logUserAction('Toggle URL details', { shortCode: urlStats.shortCode });
  };

  const handleOpenOriginal = () => {
    window.open(urlStats.originalUrl, '_blank');
    LoggingService.logUserAction('Open original URL', { originalUrl: urlStats.originalUrl });
  };

  const expired = isExpired(urlStats.expiresAt);

  return (
    <Card sx={{ mb: 2, opacity: expired ? 0.7 : 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" component="div" noWrap>
              {extractDomain(urlStats.originalUrl)}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {urlStats.originalUrl}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={expired ? 'Expired' : 'Active'}
              color={expired ? 'error' : 'success'}
              size="small"
              variant="outlined"
            />
            <Tooltip title="Open original URL">
              <IconButton onClick={handleOpenOriginal} size="small">
                <Launch />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box flex={1} display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace' }}>
              {urlStats.shortUrl}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy short URL'}>
              <IconButton 
                onClick={() => handleCopyToClipboard(urlStats.shortUrl)} 
                size="small"
                color={copied ? 'success' : 'default'}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Chip
            icon={<Mouse />}
            label={`${urlStats.totalClicks} clicks`}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
            <AccessTime fontSize="small" />
            Created {formatTimeAgo(urlStats.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expires {formatDateTime(urlStats.expiresAt)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {urlStats.clicks.length} detailed clicks recorded
          </Typography>
          <Button
            onClick={handleExpandClick}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            size="small"
            disabled={urlStats.clicks.length === 0}
          >
            {expanded ? 'Hide' : 'Show'} Details
          </Button>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Click Details
          </Typography>
          {urlStats.clicks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" style={{ fontStyle: 'italic' }}>
              No clicks recorded yet
            </Typography>
          ) : (
            <List dense>
              {urlStats.clicks.map((click, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Language fontSize="small" />
                        <Typography variant="body2">
                          {click.location || 'Unknown location'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {formatDateTime(click.timestamp)}
                        </Typography>
                        {click.referrer && (
                          <Typography variant="caption" color="text.secondary">
                            Referrer: {click.referrer}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default UrlCard;