// frontend/src/components/electeur/BlockchainInfo.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  AccountBalanceWallet,
  Verified,
  Warning,
  ContentCopy,
  Refresh,
  Add
} from '@mui/icons-material';
import { electeurService } from '../../services/api';
import { toast } from 'react-toastify';

const BlockchainInfo = () => {
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadBlockchainInfo();
  }, []);

  const loadBlockchainInfo = async () => {
    try {
      setLoading(true);
      const response = await electeurService.getBlockchainInfo();
      if (response.success) {
        setBlockchainData(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement blockchain info:', error);
      toast.error('Impossible de charger les informations blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAddress = async () => {
    try {
      setGenerating(true);
      const response = await electeurService.generateBlockchainAddress();
      if (response.success) {
        await loadBlockchainInfo(); // Recharger les données
        toast.success('Adresse blockchain générée !');
      }
    } catch (error) {
      console.error('Erreur génération adresse:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de la génération de l\'adresse');
      }
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Adresse copiée dans le presse-papiers'))
      .catch(() => toast.error('Erreur lors de la copie'));
  };

  const formatAddress = (address) => {
    if (!address) return 'Non définie';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Chargement des informations blockchain...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            Portefeuille Blockchain
          </Typography>
          <Box flexGrow={1} />
          <Tooltip title="Actualiser">
            <IconButton onClick={loadBlockchainInfo} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {!blockchainData?.blockchain_address ? (
          // Pas d'adresse blockchain
          <Box textAlign="center" py={3}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Vous n'avez pas encore d'adresse blockchain associée à votre compte.
              Une adresse blockchain est nécessaire pour participer aux votes sécurisés.
            </Alert>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={generating ? <CircularProgress size={20} /> : <Add />}
              onClick={handleGenerateAddress}
              disabled={generating}
              size="large"
            >
              {generating ? 'Génération...' : 'Générer mon adresse blockchain'}
            </Button>
          </Box>
        ) : (
          // Adresse blockchain existante
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Adresse Ethereum
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="body1" 
                      fontFamily="monospace"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {blockchainData.blockchain_address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatAddress(blockchainData.blockchain_address)}
                    </Typography>
                  </Box>
                  <Tooltip title="Copier l'adresse">
                    <IconButton 
                      onClick={() => copyToClipboard(blockchainData.blockchain_address)}
                      size="small"
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Statut de l'adresse
                </Typography>
              </Box>
              <Chip
                icon={blockchainData.address_valid ? <Verified /> : <Warning />}
                label={blockchainData.address_valid ? 'Valide' : 'Invalide'}
                color={blockchainData.address_valid ? 'success' : 'error'}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Solde ETH
                </Typography>
              </Box>
              <Typography variant="h6" color="primary.main">
                {blockchainData.balance || '0.0'} ETH
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Informations du compte
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  <strong>Nom :</strong> {blockchainData.info?.nom}
                </Typography>
                <Typography variant="body2">
                  <strong>Email :</strong> {blockchainData.info?.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Inscription :</strong> {
                    blockchainData.info?.inscription_date ? 
                    new Date(blockchainData.info.inscription_date).toLocaleDateString('fr-FR') : 
                    'Non disponible'
                  }
                </Typography>
              </Box>
            </Grid>

            {blockchainData.warning && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  {blockchainData.warning}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        <Box mt={3}>
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              <strong>Note :</strong> Votre adresse blockchain est unique et sécurisée. 
              Elle permet de garantir l'authenticité et la traçabilité de vos votes 
              tout en préservant votre anonymat.
            </Typography>
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlockchainInfo; 