import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Fade,
  Zoom,
  alpha
} from '@mui/material';
import {
  HowToVote,
  Person,
  Assignment,
  CheckCircle,
  ArrowBack,
  Security,
  Timeline,
  Visibility,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../App';
import { adminService, electeurService, electionService } from '../services/api';
import { toast } from 'react-toastify';

const VotePage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [election, setElection] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || user.type !== 'electeur') {
      toast.error('Accès réservé aux électeurs');
      navigate('/login');
      return;
    }
    loadElectionData();
  }, [electionId, user, navigate]);

  const loadElectionData = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'électeur a déjà voté
      const voteCheckRes = await electeurService.checkIfVoted(electionId);
      if (voteCheckRes.success && voteCheckRes.data.has_voted) {
        toast.info('Vous avez déjà voté pour cette élection');
        navigate('/electeur/dashboard');
        return;
      }
      
      // Charger les données de l'élection et les candidats spécifiquement pour le vote
      const [electionRes, candidatsRes] = await Promise.all([
        electionService.getElection(electionId),
        electeurService.getCandidatesForVoting(electionId)
      ]);

      if (electionRes.success) {
        setElection(electionRes.data);
        
        // Vérifier que l'élection est active
        const now = new Date();
        const ouverture = new Date(electionRes.data.date_ouverture);
        const fermeture = new Date(electionRes.data.date_fermeture);
        
        if (now < ouverture) {
          toast.warning('L\'élection n\'a pas encore commencé');
          navigate('/electeur/dashboard');
      return;
    }

        if (now > fermeture) {
          toast.warning('L\'élection est terminée');
          navigate('/electeur/dashboard');
          return;
        }
      }

      if (candidatsRes.success) {
        setCandidats(candidatsRes.data);
      }
      
    } catch (error) {
      console.error('Erreur chargement élection:', error);
      toast.error('Erreur lors du chargement de l\'élection');
      navigate('/electeur/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidatSelect = (candidat) => {
    setSelectedCandidat(candidat);
    setConfirmDialogOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidat) return;

    try {
      setVoting(true);
      
      // Appel API pour voter
      const voteData = {
        elections_id: parseInt(electionId),
        candidat_id: selectedCandidat.id
      };

      const voteResponse = await electeurService.submitVote(voteData);
      
      if (voteResponse.success) {
        toast.success(`Vote enregistré avec succès pour ${selectedCandidat.electeur_nom}!`);
        setConfirmDialogOpen(false);
        
        // Redirection vers le dashboard après un délai avec état spécial pour rafraîchir
        setTimeout(() => {
          navigate('/electeur/dashboard', { 
            state: { fromVotePage: true }
          });
        }, 2000);
      }
      
    } catch (error) {
      console.error('Erreur vote:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'enregistrement du vote';
      toast.error(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!voting) {
      setConfirmDialogOpen(false);
      setSelectedCandidat(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement de l'élection...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Élection non trouvée
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/electeur/dashboard')}
            sx={{ mb: 2 }}
          >
            Retour au tableau de bord
          </Button>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                mr: 3,
              }}
            >
              <HowToVote sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                {election.nom}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Sélectionnez votre candidat
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Informations de l'élection */}
      <Fade in timeout={700}>
        <Card sx={{ mb: 4, border: '1px solid', borderColor: alpha('#2E73F8', 0.2) }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Timeline sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Informations sur l'élection
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Assignment sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <strong>Poste:</strong> {election.poste_nom}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <strong>Candidats:</strong> {candidats.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Security sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <strong>Vote sécurisé:</strong> Blockchain
                  </Typography>
                </Box>
                <Chip
                  label="Élection Active"
                  color="success"
                  icon={<CheckCircle />}
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            {election.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {election.description}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Liste des candidats */}
      <Fade in timeout={900}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Candidats à cette élection
            </Typography>

          {candidats.length === 0 ? (
              <Alert severity="warning">
                <Typography variant="h6" gutterBottom>
                  Aucun candidat disponible
                </Typography>
                <Typography variant="body2">
                  Il n'y a actuellement aucun candidat approuvé pour cette élection.
                </Typography>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {candidats.map((candidat, index) => (
                  <Grid item xs={12} md={6} key={candidat.id}>
                    <Zoom in timeout={300 + index * 100}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          border: '2px solid transparent',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                            borderColor: alpha('#2E73F8', 0.3),
                          }
                        }}
                        onClick={() => handleCandidatSelect(candidat)}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                              mr: 2,
                              fontSize: '1.5rem',
                              fontWeight: 700,
                            }}
                          >
                            {candidat.electeur_nom?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="h6" fontWeight={600}>
                              {candidat.electeur_nom}
                            </Typography>
                            <Chip
                              label="Candidat Approuvé"
                              color="success"
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                        
                        <Box flexGrow={1} mb={2}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Programme électoral:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {candidat.programme}
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          startIcon={<HowToVote />}
                          fullWidth
                          sx={{
                            background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                            }
                          }}
                        >
                          Voter pour ce candidat
                        </Button>
                      </Paper>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Dialog de confirmation */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Lock sx={{ mr: 2, color: 'warning.main' }} />
            Confirmer votre vote
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCandidat && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Attention:</strong> Une fois confirmé, votre vote ne pourra plus être modifié.
                </Typography>
              </Alert>
              
              <Paper sx={{ p: 2, backgroundColor: alpha('#2E73F8', 0.05) }}>
                <Typography variant="h6" gutterBottom>
                  Vous allez voter pour:
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                      mr: 2,
                    }}
                  >
                    {selectedCandidat.electeur_nom?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedCandidat.electeur_nom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Candidat à l'élection: {election.nom}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={voting}
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmVote}
            variant="contained"
            disabled={voting}
            startIcon={voting ? <CircularProgress size={20} /> : <HowToVote />}
            sx={{
              background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4CAF50 0%, #00C853 100%)',
              }
            }}
          >
            {voting ? 'Enregistrement...' : 'Confirmer mon vote'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Informations sécurité */}
      <Fade in timeout={1100}>
        <Alert 
          severity="info" 
          sx={{ 
            mt: 4,
            borderRadius: 3,
            backgroundColor: alpha('#2E73F8', 0.05),
            border: `1px solid ${alpha('#2E73F8', 0.2)}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            🔒 Vote Sécurisé par Blockchain
          </Typography>
          <Typography variant="body2">
            Votre vote sera enregistré de manière sécurisée et anonyme sur la blockchain. 
            Une fois voté, il sera impossible de modifier votre choix, garantissant ainsi 
            l'intégrité et la transparence du processus électoral.
          </Typography>
        </Alert>
      </Fade>
    </Container>
  );
};

export default VotePage;
