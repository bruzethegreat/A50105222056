import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Search,
  Refresh,
  BarChart,
  TrendingUp,
  Mouse,
  Schedule,
  FilterList,
} from '@mui/icons-material';
import { UrlStatsResponse, ApiError } from '../types';
import { ApiService } from '../services/api';
import { LoggingService } from '../services/logger';
import { isExpired } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import UrlCard from '../components/UrlCard';

type SortBy = 'created' | 'expiry' | 'clicks' | 'alphabetical';
type FilterBy = 'all' | 'active' | 'expired';

const UrlStatsPage: React.FC = () => {
  const [allUrls, setAllUrls] = useState<UrlStatsResponse[]>([]);
  const [filteredUrls, setFilteredUrls] = useState<UrlStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    LoggingService.logPageView('URL Statistics Page');
    fetchAllUrlStats();
    
    return () => {
      LoggingService.logComponentUnmount('UrlStatsPage');
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allUrls, searchTerm, sortBy, filterBy]);

  const fetchAllUrlStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      LoggingService.logUserAction('Fetch all URL statistics');
      const urlStats = await ApiService.getAllUrlStats();
      setAllUrls(urlStats);
      setLastUpdated(new Date().toLocaleString());
      LoggingService.logApiCall('GET', '/shorturls', true);
      LoggingService.logInfo('component', `Fetched ${urlStats.length} URL statistics`);
    } catch (apiError: any) {
      const errorMessage = apiError.message || 'Failed to fetch URL statistics';
      setError(errorMessage);
      LoggingService.logApiCall('GET', '/shorturls', false);
      LoggingService.logError('component', `Failed to fetch URL stats: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allUrls];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(url => 
        url.originalUrl.toLowerCase().includes(search) ||
        url.shortUrl.toLowerCase().includes(search) ||
        url.shortCode.toLowerCase().includes(search)
      );
    }

    if (filterBy !== 'all') {
      filtered = filtered.filter(url => {
        const expired = isExpired(url.expiresAt);
        return filterBy === 'active' ? !expired : expired;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'expiry':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case 'clicks':
          return b.totalClicks - a.totalClicks;
        case 'alphabetical':
          return a.originalUrl.localeCompare(b.originalUrl);
        default:
          return 0;
      }
    });

    setFilteredUrls(filtered);
    LoggingService.logUserAction('Apply filters and sort', { 
      searchTerm, 
      sortBy, 
      filterBy, 
      resultCount: filtered.length 
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value as SortBy);
  };

  const handleFilterChange = (event: any) => {
    setFilterBy(event.target.value as FilterBy);
  };

  const getStatsOverview = () => {
    const totalUrls = allUrls.length;
    const activeUrls = allUrls.filter(url => !isExpired(url.expiresAt)).length;
    const expiredUrls = totalUrls - activeUrls;
    const totalClicks = allUrls.reduce((sum, url) => sum + url.totalClicks, 0);
    const avgClicksPerUrl = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : '0';

    return { totalUrls, activeUrls, expiredUrls, totalClicks, avgClicksPerUrl };
  };

  const stats = getStatsOverview();

  if (loading && allUrls.length === 0) {
    return <LoadingSpinner message="Loading URL statistics..." />;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchAllUrlStats}
          startIcon={loading ? undefined : <Refresh />}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <Collapse in={!!error}>
        <ErrorMessage message={error} onRetry={fetchAllUrlStats} />
      </Collapse>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BarChart color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="primary">
                {stats.totalUrls}
              </Typography>
              <Typography color="text.secondary">
                Total URLs
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                {stats.activeUrls}
              </Typography>
              <Typography color="text.secondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="warning.main">
                {stats.expiredUrls}
              </Typography>
              <Typography color="text.secondary">
                Expired URLs
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Mouse color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div" color="info.main">
                {stats.totalClicks}
              </Typography>
              <Typography color="text.secondary">
                Total Clicks
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Avg: {stats.avgClicksPerUrl} per URL
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FilterList />
          <Typography variant="h6">
            Filter & Sort
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Search URLs"
              placeholder="Search by URL, shortcode..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={handleSortChange} label="Sort By">
                <MenuItem value="created">Created Date (Newest first)</MenuItem>
                <MenuItem value="expiry">Expiry Date (Earliest first)</MenuItem>
                <MenuItem value="clicks">Click Count (Highest first)</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: { xs: '100%', md: 150 } }}>
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select value={filterBy} onChange={handleFilterChange} label="Filter By">
                <MenuItem value="all">All URLs</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="expired">Expired Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
        <Typography variant="h6">
          URLs ({filteredUrls.length} {filteredUrls.length === 1 ? 'result' : 'results'})
        </Typography>
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
        )}
      </Box>

      {filteredUrls.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          {allUrls.length === 0 ? (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No URLs Found
              </Typography>
              <Typography color="text.secondary">
                Create some short URLs first to see statistics here.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Results Found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search terms or filters.
              </Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Box>
          {filteredUrls.map((urlStats) => (
            <UrlCard key={urlStats.shortCode} urlStats={urlStats} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UrlStatsPage;