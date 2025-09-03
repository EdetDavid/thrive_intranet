import { Typography, Button, Box } from '@mui/material';
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          textAlign: 'center',
          p: 3
        }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#ED1C24' }}>
            Something went wrong
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#606060', mb: 3 }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ 
              backgroundColor: '#181344',
              '&:hover': {
                backgroundColor: '#ED1C24'
              }
            }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;