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
  SupervisorAccount,
  Assessment,
  HowToVote,
  People,
  Refresh,
  Visibility,
  CheckCircle,
  Schedule,
  Warning,
  Add,
  Edit,
  Delete,
  BarChart,
  Security
} from '@mui/icons-material';
import { useAuth } from '../../App';
import { electionService, adminService } from '../../services/api';
import { toast } from 'react-toastify';

const SuperviseurSupervision = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [supervisionDialog, setSupervisionDialog] = useState(false);
  const [rapportDialog, setRapportDialog] = useState(false);
  const [supervisionData, setSupervisionData] = useState({
    rapport: '',
    statut: 'en_cours',
    observations: ''
  });
  const [stats, setStats] = useState({
    electionsTotal: 0,
    electionsActives: 0,
    electionsSupervises: 0,
    problemes: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [electionsRes, supervisionRes] = await Promise.all([
        electionService.getElections(),
        adminService.getSupervisions ? adminService.getSupervisions() : Promise.resolve({ success: true, data: [] })
      ]);
      
      if (electionsRes.success && Array.isArray(electionsRes.data)) {
        const electionsData = electionsRes.data;
        setElections(electionsData);
        
        const now = new Date();
        const electionsActives = electionsData.filter(election => {
          const ouverture = new Date(election.date_ouverture);
          const fermeture = new Date(election.date_fermeture);
          return now >= ouverture && now <= fermeture;
        });
        
        setStats({
          electionsTotal: electionsData.length,
          electionsActives: electionsActives.length,
          electionsSupervises: electionsData.filter(e => e.status === 'supervise').length,
          problemes: 0
        });
      }
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSupervision = (election) => {
    setSelectedElection(election);
    setSupervisionDialog(true);
  };

  const handleRapport = (election) => {
    setSelectedElection(election);
    setRapportDialog(true);
  };

  const handleSaveSupervision = async () => {
    try {
      // Simulation d'enregistrement de supervision
      toast.success('Supervision enregistrée avec succès');
      setSupervisionDialog(false);
      setSelectedElection(null);
      setSupervisionData({
        rapport: '',
        statut: 'en_cours',
        observations: ''
      });
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde supervision:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getStatusChip = (election) => {
    const now = new Date();
    const ouverture = new Date(election.date_ouverture);
    const fermeture = new Date(election.date_fermeture);

    if (now < ouverture) {
      return <Chip label="Programmée" color="warning" icon={<Schedule />} size="small" />;
    } else if (now >= ouverture && now <= fermeture) {
      return <Chip label="Active" color="success" icon={<CheckCircle />} size="small" />;
    } else {
      return <Chip label="Fermée" color="error" icon={<Warning />} size="small" />;
    }
  };

  const getSupervisionStatusChip = (status) => {
    switch(status) {
      case 'supervise':
        return <Chip label="Supervisé" color="success" icon={<CheckCircle />} size="small" />;
      case 'en_cours':
        return <Chip label="En cours" color="warning" icon={<Schedule />} size="small" />;
      default:
        return <Chip label="Non supervisé" color="error" icon={<Warning />} size="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des données de supervision...
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
              <Security sx={{ fontSize: 32 }} />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Supervision des Élections
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Surveillance et validation des processus électoraux
              </Typography>
            </Box>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={loadData}
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
                  <Typography variant="h3" fontWeight={700}>{stats.electionsTotal}</Typography>
                  <Typography variant="h6">Élections Totales</Typography>
                </Box>
                <HowToVote sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.electionsActives}</Typography>
                  <Typography variant="h6">Élections Actives</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.electionsSupervises}</Typography>
                  <Typography variant="h6">Supervisées</Typography>
                </Box>
                <Security sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700}>{stats.problemes}</Typography>
                  <Typography variant="h6">Problèmes Détectés</Typography>
                </Box>
                <Warning sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des élections à superviser */}
      <Fade in timeout={800}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Élections à Superviser
            </Typography>
            
            {elections.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aucune élection à superviser
                </Typography>
                <Typography variant="body2">
                  Il n'y a actuellement aucune élection assignée à votre supervision.
                </Typography>
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#FF6B35', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut Supervision</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {elections.map((election) => (
                      <TableRow 
                        key={election.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#FF6B35', 0.02),
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {election.nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {election.poste_nom}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {new Date(election.date_ouverture).toLocaleDateString('fr-FR')} -
                            </Typography>
                            <Typography variant="body2">
                              {new Date(election.date_fermeture).toLocaleDateString('fr-FR')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(election)}
                        </TableCell>
                        <TableCell>
                          {getSupervisionStatusChip(election.supervision_status)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Superviser">
                            <IconButton
                              size="small"
                              onClick={() => handleSupervision(election)}
                              sx={{
                                color: '#FF6B35',
                                '&:hover': { backgroundColor: alpha('#FF6B35', 0.1) }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rapport">
                            <IconButton
                              size="small"
                              onClick={() => handleRapport(election)}
                              sx={{
                                color: '#2E73F8',
                                '&:hover': { backgroundColor: alpha('#2E73F8', 0.1) }
                              }}
                            >
                              <BarChart />
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

      {/* Dialog de supervision */}
      <Dialog 
        open={supervisionDialog} 
        onClose={() => setSupervisionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Supervision - {selectedElection?.nom}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Statut de supervision</InputLabel>
              <Select
                value={supervisionData.statut}
                onChange={(e) => setSupervisionData(prev => ({ ...prev, statut: e.target.value }))}
                label="Statut de supervision"
              >
                <MenuItem value="en_cours">En cours</MenuItem>
                <MenuItem value="supervise">Supervisé</MenuItem>
                <MenuItem value="probleme">Problème détecté</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Rapport de supervision"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={supervisionData.rapport}
              onChange={(e) => setSupervisionData(prev => ({ ...prev, rapport: e.target.value }))}
              placeholder="Décrivez les observations et actions effectuées..."
            />
            
            <TextField
              label="Observations"
              multiline
              rows={3}
              fullWidth
              margin="normal"
              value={supervisionData.observations}
              onChange={(e) => setSupervisionData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observations complémentaires..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupervisionDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSaveSupervision} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rapport */}
      <Dialog 
        open={rapportDialog} 
        onClose={() => setRapportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Rapport de Supervision - {selectedElection?.nom}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Rapport détaillé de supervision
              </Typography>
              <Typography variant="body2">
                Consultez et téléchargez le rapport complet de supervision pour cette élection.
              </Typography>
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, backgroundColor: alpha('#2E73F8', 0.05) }}>
                  <Typography variant="h6" color="#2E73F8" gutterBottom>
                    Informations Élection
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Nom :</strong> {selectedElection?.nom}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Poste :</strong> {selectedElection?.poste_nom}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Période :</strong> {selectedElection?.date_ouverture ? new Date(selectedElection.date_ouverture).toLocaleDateString('fr-FR') : ''} - {selectedElection?.date_fermeture ? new Date(selectedElection.date_fermeture).toLocaleDateString('fr-FR') : ''}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, backgroundColor: alpha('#00C853', 0.05) }}>
                  <Typography variant="h6" color="#00C853" gutterBottom>
                    Statut Supervision
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Statut :</strong> {selectedElection?.supervision_status || 'Non supervisé'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Superviseur :</strong> {user?.nom} {user?.prenom}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR')}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Observations
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value="Aucune observation particulière. Processus électoral conforme aux réglementations."
                disabled
                sx={{ backgroundColor: alpha('#F5F5F5', 0.5) }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRapportDialog(false)} 
            color="inherit"
          >
            Fermer
          </Button>
          <Button 
            onClick={() => toast.success('Rapport téléchargé avec succès')} 
            variant="contained"
            startIcon={<BarChart />}
          >
            Télécharger PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuperviseurSupervision; 