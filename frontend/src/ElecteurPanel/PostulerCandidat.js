import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Fade,
  Zoom,
  alpha,
  Avatar,
  Divider
} from '@mui/material';
import {
  Assignment,
  Person,
  Schedule,
  HowToVote,
  Send,
  Cancel,
  CheckCircle,
  Info,
  ArrowBack
} from '@mui/icons-material';
import { electeurService, electionService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const PostulerCandidat = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [electionSelectionnee, setElectionSelectionnee] = useState(null);
  const [programme, setProgramme] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await electionService.getElections();
      if (response.success) {
        // Filtrer les élections ouvertes ou programmées pour candidature
        const electionsDisponibles = response.data.filter(election => {
          const status = election.status || election.statut;
          return status === 'planifiee' || status === 'programmee' || status === 'ouverte' || status === 'active';
        });
        setElections(electionsDisponibles);
      }
    } catch (error) {
      console.error('Erreur récupération élections:', error);
      toast.error('Impossible de charger les élections');
    } finally {
      setLoading(false);
    }
  };

  const handlePostulerClick = (election) => {
    setElectionSelectionnee(election);
    setDialogOpen(true);
  };

  const handleSubmitCandidature = async () => {
    if (!programme.trim()) {
      toast.error('Veuillez saisir votre programme électoral');
      return;
    }

    if (programme.length < 50) {
      toast.error('Votre programme doit contenir au moins 50 caractères');
      return;
    }

    try {
      setSubmitting(true);
      await electeurService.submitCandidature({
        election_id: electionSelectionnee.id,
        programme: programme.trim()
      });
      
      toast.success('Candidature soumise avec succès !');
      setDialogOpen(false);
      setElectionSelectionnee(null);
      setProgramme('');
      
      // Rafraîchir la liste des élections
      fetchElections();
    } catch (error) {
      console.error('Erreur soumission candidature:', error);
      toast.error('Erreur lors de la soumission de la candidature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setElectionSelectionnee(null);
    setProgramme('');
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status === 'active' ? 'ouverte' : 
                           status === 'upcoming' ? 'programmee' : 
                           status === 'closed' ? 'fermee' : status;
    
    switch (normalizedStatus) {
      case 'ouverte': return 'success';
      case 'planifiee':
      case 'programmee': return 'warning';
      case 'fermee': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status === 'active' ? 'ouverte' : 
                           status === 'upcoming' ? 'programmee' : 
                           status === 'closed' ? 'fermee' : status;
    
    switch (normalizedStatus) {
      case 'ouverte': return <CheckCircle />;
      case 'planifiee':
      case 'programmee': return <Schedule />;
      default: return <Info />;
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Vous devez être connecté pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/electeur')}
              sx={{ mr: 2 }}
            >
              Retour au dashboard
            </Button>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
            >
              <Assignment />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Postuler en tant que Candidat
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Soumettez votre candidature pour les élections disponibles
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Informations utilisateur */}
      <Fade in timeout={700}>
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
            border: '1px solid',
            borderColor: alpha('#2196F3', 0.2),
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
              }}
            >
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Candidat : {user.nom} {user.prenom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email : {user.email}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Liste des élections */}
      {!loading && (
        <Fade in timeout={900}>
          <Box>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Élections Disponibles ({elections.length})
            </Typography>
            
            {elections.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  py: 4,
                  borderRadius: 3,
                  backgroundColor: alpha('#2196F3', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#2196F3', 0.2),
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Aucune élection disponible
                </Typography>
                <Typography variant="body2">
                  Il n'y a actuellement aucune élection ouverte pour les candidatures. 
                  Revenez bientôt pour découvrir de nouvelles opportunités.
                </Typography>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {elections.map((election, index) => (
                  <Grid item xs={12} md={6} lg={4} key={election.id}>
                    <Zoom in timeout={300 + index * 100}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          border: '1px solid',
                          borderColor: alpha('#E2E8F0', 0.5),
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
                            borderColor: alpha('#2E73F8', 0.3),
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, 
                              ${getStatusColor(election.status || election.statut) === 'success' ? '#00C853' : 
                                getStatusColor(election.status || election.statut) === 'warning' ? '#FFB300' : '#FF5722'} 0%, 
                              ${getStatusColor(election.status || election.statut) === 'success' ? '#4CAF50' : 
                                getStatusColor(election.status || election.statut) === 'warning' ? '#FFC107' : '#F44336'} 100%)`,
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          {/* Header de la carte */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {election.nom}
                            </Typography>
                            <Chip
                              label={election.status || election.statut || 'Inconnu'}
                              color={getStatusColor(election.status || election.statut)}
                              icon={getStatusIcon(election.status || election.statut)}
                              sx={{
                                fontWeight: 600,
                                textTransform: 'capitalize',
                              }}
                            />
                          </Box>

                          {/* Description */}
                          {election.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {election.description}
                            </Typography>
                          )}

                          <Divider sx={{ my: 2 }} />

                          {/* Dates */}
                          <Box sx={{ mb: 2 }}>
                            {election.date_ouverture && (
                              <Box display="flex" alignItems="center" mb={1}>
                                <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  Ouverture: {new Date(election.date_ouverture).toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            )}
                            {election.date_fermeture && (
                              <Box display="flex" alignItems="center">
                                <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  Fermeture: {new Date(election.date_fermeture).toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Poste */}
                          {election.poste_nom && (
                            <Box display="flex" alignItems="center" mb={2}>
                              <HowToVote sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Poste: {election.poste_nom}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Assignment />}
                            onClick={() => handlePostulerClick(election)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            Postuler pour cette élection
                          </Button>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>
      )}

      {/* Dialog de candidature */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
              }}
            >
              <Assignment />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Candidature à l'élection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {electionSelectionnee?.nom}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Rédigez votre programme électoral. Soyez précis et convaincant dans vos propositions.
              <br />
              <strong>Minimum requis :</strong> 50 caractères
            </Typography>
          </Alert>
          
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={8}
            label="Votre programme électoral"
            placeholder="Décrivez vos propositions, vos objectifs et votre vision pour ce poste..."
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            helperText={`${programme.length} caractères (minimum 50 requis)`}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<Cancel />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
                >
                  Annuler
          </Button>
          <Button
            onClick={handleSubmitCandidature}
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
            disabled={submitting || programme.length < 50}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4CAF50 0%, #00C853 100%)',
              }
            }}
          >
            {submitting ? 'Soumission...' : 'Soumettre ma candidature'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostulerCandidat;
