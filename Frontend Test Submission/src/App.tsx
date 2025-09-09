import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Container, Alert, Snackbar } from '@mui/material';
import { LinkOutlined } from '@mui/icons-material';

import UrlShortenerPage from './pages/UrlShortenerPage';
import UrlStatsPage from './pages/UrlStatsPage';
import Navigation from './components/Navigation';
import { ApiService } from './services/api';
import { LoggingService } from './services/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    LoggingService.logInfo('component', 'App component initialized');
    
    const checkBackend = async () => {
      try {
        const isHealthy = await ApiService.checkBackendHealth();
        setBackendStatus(isHealthy);
        
        if (isHealthy) {
          setStatusMessage('Connected to backend successfully');
          LoggingService.logInfo('api', 'Backend connection established');
        } else {
          setStatusMessage('Unable to connect to backend. Some features may not work.');
          LoggingService.logError('api', 'Backend connection failed');
        }
      } catch (error) {
        setBackendStatus(false);
        setStatusMessage('Backend connection error');
        LoggingService.logError('api', 'Backend health check failed');
      }
    };

    checkBackend();
  }, []);

  const handleCloseStatus = () => {
    setStatusMessage('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <LinkOutlined sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                URL Shortener
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Navigation />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/shortener" replace />} />
              <Route path="/shortener" element={<UrlShortenerPage />} />
              <Route path="/statistics" element={<UrlStatsPage />} />
              <Route path="*" element={<Navigate to="/shortener" replace />} />
            </Routes>
          </Container>

          <Snackbar 
            open={!!statusMessage} 
            autoHideDuration={6000} 
            onClose={handleCloseStatus}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseStatus} 
              severity={backendStatus === null ? 'info' : backendStatus ? 'success' : 'warning'}
              variant="filled"
            >
              {statusMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;