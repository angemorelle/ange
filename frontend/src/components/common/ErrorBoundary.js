// frontend/src/components/common/ErrorBoundary.js
import React from 'react';
import { Box, Typography, Button, Container, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'UI d'erreur au prochain rendu
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log de l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Ici on pourrait envoyer l'erreur à un service de monitoring
    // comme Sentry, LogRocket, etc.
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            spacing={3}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 80, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Oups ! Une erreur s'est produite
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Nous nous excusons pour ce désagrément. Une erreur inattendue s'est produite.
            </Typography>

            {isDevelopment && this.state.error && (
              <Alert severity="error" sx={{ width: '100%', mb: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Détails de l'erreur (mode développement):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                size="large"
              >
                Recharger la page
              </Button>
              
              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                size="large"
              >
                Retour à l'accueil
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              Si le problème persiste, veuillez contacter le support technique.
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 