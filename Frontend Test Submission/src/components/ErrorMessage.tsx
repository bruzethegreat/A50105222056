import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error', 
  message, 
  onRetry, 
  severity = 'error' 
}) => {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Alert 
        severity={severity} 
        variant="outlined"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;