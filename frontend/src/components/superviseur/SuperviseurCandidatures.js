import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Schedule,
  Cancel,
  Visibility,
  Edit,
  Refresh,
  HowToReg,
  People,
  Assessment,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../App';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const SuperviseurCandidatures = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [validationDialog, setValidationDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [validationData, setValidationData] = useState({
    decision: '',
    commentaire: '',
    note: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    approuve: 0,
    rejete: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCandidats();
  }, [user, navigate]);

  const loadCandidats = async () => {
    try {
      setLoading(true);
      
      const response = await adminService.getCandidats();
      
      if (response.success && Array.isArray(response.data)) {
        const candidatsData = response.data;
        setCandidats(candidatsData);
        
        const stats = candidatsData.reduce((acc, candidat) => {
          acc.total++;
          if (candidat.status === 'en_attente') acc.en_attente++;
          else if (candidat.status === 'approuve') acc.approuve++;
          else if (candidat.status === 'rejete') acc.rejete++;
          return acc;
        }, { total: 0, en_attente: 0, approuve: 0, rejete: 0 });
        
        setStats(stats);
      }
      
    } catch (error) {
      console.error('Erreur chargement candidats:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = (candidat) => {
    setSelectedCandidat(candidat);
    setValidationDialog(true);
  };

  const handleViewDetails = (candidat) => {
    setSelectedCandidat(candidat);
    setDetailsDialog(true);
  };

  const handleSaveValidation = async () => {
    try {
      if (!validationData.decision) {
        toast.error('Veuillez sélectionner une décision');
        return;
      }
      
      // Simulation d'enregistrement de validation
      const updatedCandidats = candidats.map(c => 
        c.id === selectedCandidat.id 
          ? { ...c, status: validationData.decision }
          : c
      );
      setCandidats(updatedCandidats);
      
      toast.success('Validation enregistrée avec succès');
      setValidationDialog(false);
      setSelectedCandidat(null);
      setValidationData({
        decision: '',
        commentaire: '',
        note: ''
      });
      
      // Recalculer les stats
      const newStats = updatedCandidats.reduce((acc, candidat) => {
        acc.total++;
        if (candidat.status === 'en_attente') acc.en_attente++;
        else if (candidat.status === 'approuve') acc.approuve++;
        else if (candidat.status === 'rejete') acc.rejete++;
        return acc;
      }, { total: 0, en_attente: 0, approuve: 0, rejete: 0 });
      
      setStats(newStats);
      
    } catch (error) {
      console.error('Erreur sauvegarde validation:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'approuve':
        return <Chip label="Approuvé" color="success" icon={<CheckCircle />} size="small" />;
      case 'rejete':
        return <Chip label="Rejeté" color="error" icon={<Cancel />} size="small" />;
      case 'en_attente':
        return <Chip label="En attente" color="warning" icon={<Schedule />} size="small" />;
      default:
        return <Chip label="Non défini" color="default" icon={<Warning />} size="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des candidatures...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                mr: 3,
              }}
            >
              <HowToReg sx={{ fontSize: 32 }} />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Gestion des Candidatures
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Validation et supervision des candidatures
              </Typography>
            </Box>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={loadCandidats}
                sx={{
                  backgroundColor: alpha('#FF6B35', 0.1),
                  '&:hover': { backgroundColor: alpha('#FF6B35', 0.2) }
                }}
              >
                <Refresh sx={{ color: '#FF6B35' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {/* Statistiques */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.total}</Typography>
                  <Typography variant="h6">Total Candidatures</Typography>
                </Box>
                <People sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FFB300 0%, #FFC107 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.en_attente}</Typography>
                  <Typography variant="h6">En Attente</Typography>
                </Box>
                <Schedule sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.approuve}</Typography>
                  <Typography variant="h6">Approuvées</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.rejete}</Typography>
                  <Typography variant="h6">Rejetées</Typography>
                </Box>
                <Cancel sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des candidatures */}
      <Fade in timeout={800}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Candidatures à Valider
            </Typography>
            
            {candidats.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aucune candidature disponible
                </Typography>
                <Typography variant="body2">
                  Il n'y a actuellement aucune candidature à valider.
                </Typography>
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#FF6B35', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Candidat</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date candidature</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidats.map((candidat) => (
                      <TableRow 
                        key={candidat.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#FF6B35', 0.02),
                          },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                backgroundColor: alpha('#FF6B35', 0.1),
                                color: '#FF6B35'
                              }}
                            >
                              <Person />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {candidat.nom} {candidat.prenom}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {candidat.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {candidat.election_nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {candidat.poste_nom}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(candidat.status)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(candidat.date_candidature).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Valider">
                            <IconButton
                              size="small"
                              onClick={() => handleValidation(candidat)}
                              sx={{
                                color: '#FF6B35',
                                '&:hover': { backgroundColor: alpha('#FF6B35', 0.1) }
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(candidat)}
                              sx={{
                                color: '#2E73F8',
                                '&:hover': { backgroundColor: alpha('#2E73F8', 0.1) }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Dialog de validation */}
      <Dialog 
        open={validationDialog} 
        onClose={() => setValidationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Validation de candidature - {selectedCandidat?.nom} {selectedCandidat?.prenom}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Décision</InputLabel>
              <Select
                value={validationData.decision}
                onChange={(e) => setValidationData(prev => ({ ...prev, decision: e.target.value }))}
                label="Décision"
              >
                <MenuItem value="approuve">Approuver</MenuItem>
                <MenuItem value="rejete">Rejeter</MenuItem>
                <MenuItem value="en_attente">Mettre en attente</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Commentaire"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={validationData.commentaire}
              onChange={(e) => setValidationData(prev => ({ ...prev, commentaire: e.target.value }))}
              placeholder="Commentaire sur la décision..."
            />
            
            <TextField
              label="Note interne"
              multiline
              rows={2}
              fullWidth
              margin="normal"
              value={validationData.note}
              onChange={(e) => setValidationData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Note interne (optionnel)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSaveValidation} variant="contained">
            Enregistrer la décision
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Détails de la candidature - {selectedCandidat?.nom} {selectedCandidat?.prenom}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, backgroundColor: alpha('#FF6B35', 0.05) }}>
                  <Typography variant="h6" color="#FF6B35" gutterBottom>
                    Informations Personnelles
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Nom complet :</strong> {selectedCandidat?.nom} {selectedCandidat?.prenom}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email :</strong> {selectedCandidat?.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date de naissance :</strong> {selectedCandidat?.date_naissance ? new Date(selectedCandidat.date_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Profession :</strong> {selectedCandidat?.profession || 'Non renseignée'}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, backgroundColor: alpha('#2E73F8', 0.05) }}>
                  <Typography variant="h6" color="#2E73F8" gutterBottom>
                    Détails Candidature
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Élection :</strong> {selectedCandidat?.election_nom}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Poste :</strong> {selectedCandidat?.poste_nom}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date candidature :</strong> {selectedCandidat?.date_candidature ? new Date(selectedCandidat.date_candidature).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Statut :</strong> {getStatusChip(selectedCandidat?.status)}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Motivation
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={selectedCandidat?.motivation || "Le candidat n'a pas fourni de motivation spécifique pour cette candidature."}
                disabled
                sx={{ backgroundColor: alpha('#F5F5F5', 0.5) }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pièces jointes
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  • CV complet (cv_candidat.pdf)<br/>
                  • Lettre de motivation (motivation.pdf)<br/>
                  • Casier judiciaire (casier.pdf)<br/>
                  • Photo d'identité (photo.jpg)
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDetailsDialog(false)} 
            color="inherit"
          >
            Fermer
          </Button>
          <Button 
            onClick={() => {
              setDetailsDialog(false);
              handleValidation(selectedCandidat);
            }} 
            variant="contained"
            startIcon={<Edit />}
          >
            Valider cette candidature
          </Button>
        </DialogActions>
      </Dialog>

      {/* Information superviseur */}
      <Fade in timeout={1000}>
        <Alert 
          severity="info" 
          sx={{ 
            mt: 4,
            borderRadius: 3,
            backgroundColor: alpha('#FF6B35', 0.05),
            border: `1px solid ${alpha('#FF6B35', 0.2)}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Validation des Candidatures
          </Typography>
          <Typography variant="body2">
            En tant que superviseur, vous devez valider les candidatures selon les critères légaux et 
            réglementaires en vigueur. Chaque décision doit être documentée avec un commentaire justificatif.
          </Typography>
        </Alert>
      </Fade>
    </Container>
  );
};

export default SuperviseurCandidatures; 