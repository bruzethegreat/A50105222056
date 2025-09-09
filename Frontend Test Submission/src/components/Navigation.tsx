import React from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkOutlined, BarChart } from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const getTabValue = () => {
    switch (location.pathname) {
      case '/shortener':
        return 0;
      case '/statistics':
        return 1;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Tabs value={getTabValue()} variant="scrollable" scrollButtons="auto">
          <Tab
            icon={<LinkOutlined />}
            label="URL Shortener"
            component={RouterLink}
            to="/shortener"
            iconPosition="start"
            sx={{ minHeight: 64, textTransform: 'none' }}
          />
          <Tab
            icon={<BarChart />}
            label="Statistics"
            component={RouterLink}
            to="/statistics"
            iconPosition="start"
            sx={{ minHeight: 64, textTransform: 'none' }}
          />
        </Tabs>
      </Container>
    </Box>
  );
};

export default Navigation;