import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Fade,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Person,
  ArrowBack,
  Assignment,
  CheckCircle,
  AccessTime,
  Cancel,
  HowToVote,
  Timeline
} from '@mui/icons-material';
import { electionService, adminService, electeurService } from '../services/api';
import { toast } from 'react-toastify';

const ElectionCandidats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);

  const loadElectionAndCandidats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les informations de l'élection
      const electionResponse = await electionService.getElection(id);
      if (electionResponse.success) {
        setElection(electionResponse.data);
      }

      // Charger les candidats
      const candidatsResponse = await adminService.getCandidats({ elections_id: id });
      if (candidatsResponse.success) {
        setCandidats(candidatsResponse.data || []);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Impossible de charger les données de l\'élection');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkVoteStatus = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) return;

      // Vérifier si l'électeur a déjà voté
      const voteResponse = await electeurService.checkIfVoted(id);
      if (voteResponse.success) {
        setHasVoted(voteResponse.data.has_voted);
      }

      // Vérifier si l'électeur est candidat à cette élection
      const candidatsResponse = await adminService.getCandidats({ 
        elections_id: id, 
        electeur_id: user.id 
      });
      if (candidatsResponse.success && candidatsResponse.data.length > 0) {
        setIsCandidate(true);
      }

    } catch (error) {
      console.error('Erreur vérification statut vote:', error);
      // Ne pas afficher d'erreur pour ne pas perturber l'utilisateur
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadElectionAndCandidats();
      checkVoteStatus();
    }
  }, [id, loadElectionAndCandidats, checkVoteStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approuve': return 'success';
      case 'en_attente': return 'warning';
      case 'rejete': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approuve': return <CheckCircle />;
      case 'en_attente': return <AccessTime />;
      case 'rejete': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approuve': return 'Approuvé';
      case 'en_attente': return 'En attente';
      case 'rejete': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const getElectionStatusColor = (status) => {
    switch (status) {
      case 'ouverte': return 'success';
      case 'planifiee': return 'warning';
      case 'fermee': return 'error';
      default: return 'default';
    }
  };

  const handleVote = () => {
    navigate(`/electeur/vote/${id}`);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des candidats...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Retour
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header avec navigation */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={3}>
            <Tooltip title="Retour">
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  backgroundColor: 'rgba(46, 115, 248, 0.1)',
                  mr: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(46, 115, 248, 0.2)',
                  }
                }}
              >
                <ArrowBack sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
            <Box flexGrow={1}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Candidats à l'élection
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {election?.nom || 'Élection non trouvée'}
              </Typography>
            </Box>
          </Box>

          {/* Informations sur l'élection */}
          {election && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                border: '1px solid',
                borderColor: 'rgba(46, 115, 248, 0.1)',
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HowToVote sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {election.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {election.description}
                      </Typography>
                    </Box>
                  </Box>
                  {election.date_ouverture && (
                    <Typography variant="body2" color="text.secondary">
                      📅 Ouverture: {new Date(election.date_ouverture).toLocaleDateString('fr-FR')} 
                      {election.date_fermeture && ` - Fermeture: ${new Date(election.date_fermeture).toLocaleDateString('fr-FR')}`}
                    </Typography>
                  )}
                  {isCandidate && (
                    <Box mt={1}>
                      <Chip
                        label="Vous êtes candidat à cette élection"
                        color="success"
                        icon={<Assignment />}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2}>
                    <Chip
                      label={election.statut || election.status || 'Statut inconnu'}
                      color={getElectionStatusColor(election.statut || election.status)}
                      icon={<Timeline />}
                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                    />
                    {(election.status === 'ouverte' || election.statut === 'ouverte') && !hasVoted && !isCandidate && (
                      <Button
                        variant="contained"
                        startIcon={<HowToVote />}
                        onClick={handleVote}
                        sx={{
                          background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                          }
                        }}
                      >
                        Voter maintenant
                      </Button>
                    )}
                    {hasVoted && !isCandidate && (
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle />}
                        disabled
                        sx={{
                          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                          color: 'white !important',
                          '&.Mui-disabled': {
                            background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                            color: 'white !important',
                          }
                        }}
                      >
                        Déjà voté
                      </Button>
                    )}
                    {isCandidate && (
                      <Button
                        variant="outlined"
                        startIcon={<Assignment />}
                        disabled
                        color="success"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&.Mui-disabled': {
                            borderColor: 'success.main',
                            color: 'success.main',
                          }
                        }}
                      >
                        Vous êtes candidat
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </Fade>

      {/* Statistiques */}
      <Fade in timeout={700}>
        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                  <Person sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {candidats.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Candidat(s) total
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {candidats.filter(c => c.status === 'approuve').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approuvé(s)
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                  <AccessTime sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {candidats.filter(c => c.status === 'en_attente').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En attente
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                  <Cancel sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {candidats.filter(c => c.status === 'rejete').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejeté(s)
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Liste des candidats */}
      <Fade in timeout={900}>
        <Box>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Liste des candidats
          </Typography>

          {candidats.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aucun candidat pour cette élection
              </Typography>
              <Typography variant="body2">
                Il n'y a actuellement aucun candidat inscrit pour cette élection. 
                Les candidatures peuvent encore être en cours de traitement.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {candidats.map((candidat, index) => (
                <Grid item xs={12} md={6} lg={4} key={candidat.id}>
                  <Fade in timeout={300 * (index + 1)}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header du candidat */}
                        <Box display="flex" alignItems="center" mb={3}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              mr: 2,
                              background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                            }}
                          >
                            {candidat.nom ? candidat.nom.charAt(0).toUpperCase() : 
                             candidat.electeur_nom ? candidat.electeur_nom.charAt(0).toUpperCase() : 'C'}
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="h6" fontWeight={600}>
                              {candidat.nom || candidat.electeur_nom || 'Candidat'}
                            </Typography>
                            <Chip
                              label={getStatusLabel(candidat.status)}
                              color={getStatusColor(candidat.status)}
                              icon={getStatusIcon(candidat.status)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Programme */}
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight={600} mb={1} color="primary">
                            Programme électoral :
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.5,
                            }}
                          >
                            {candidat.programme || 'Programme non disponible'}
                          </Typography>
                        </Box>

                        {/* Date de candidature */}
                        {candidat.created_at && (
                          <Typography variant="caption" color="text.secondary">
                            Candidature déposée le {new Date(candidat.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        )}
                      </CardContent>

                      {/* Indicateur de statut en bas */}
                      <Box
                        sx={{
                          height: 4,
                          background: candidat.status === 'approuve' ? 'linear-gradient(90deg, #00C853 0%, #4CAF50 100%)' :
                                     candidat.status === 'en_attente' ? 'linear-gradient(90deg, #FFB300 0%, #FFC107 100%)' :
                                     'linear-gradient(90deg, #F44336 0%, #EF5350 100%)',
                        }}
                      />
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default ElectionCandidats; 