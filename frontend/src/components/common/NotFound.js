// frontend/src/components/common/NotFound.js
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    const homePath = user?.type === 'admin' ? '/admin' : '/electeur';
    navigate(homePath);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: '8rem', 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page non trouvée
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            Retour à l'accueil
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size="large"
          >
            Page précédente
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound; 