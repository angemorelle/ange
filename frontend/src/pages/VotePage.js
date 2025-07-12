import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  Fade,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  HowToVote,
  CheckCircle,
  Warning,
  Person
} from '@mui/icons-material';
import { electeurService } from '../services/api';
import { toast } from 'react-toastify';

const VotePage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidat, setSelectedCandidat] = useState('');
  const [election, setElection] = useState(null);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [electionStatus, setElectionStatus] = useState(null);

  // Récupérer l'utilisateur courant
  const user = React.useMemo(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  useEffect(() => {
    const loadVoteData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifications préliminaires
        if (!user) {
          setError('Vous devez être connecté pour voter');
          return;
        }

        if (user.type !== 'electeur') {
          setError('Seuls les électeurs peuvent voter');
          return;
        }

        // Vérifier si l'utilisateur a déjà voté
        const voteCheckResponse = await electeurService.checkIfVoted(electionId);
        if (voteCheckResponse.success && voteCheckResponse.data.hasVoted) {
          setHasVoted(true);
          setError('Vous avez déjà voté pour cette élection');
          return;
        }

        // Charger les informations de l'élection
        const electionResponse = await electeurService.getElection(electionId);
        if (!electionResponse.success) {
          setError('Élection non trouvée');
          return;
        }

        const electionData = electionResponse.data;
        setElection(electionData);
        setElectionStatus(electionData.statut || electionData.status);

        // Vérifier si l'élection est ouverte
        const status = electionData.statut || electionData.status;
        if (status !== 'ouverte' && status !== 'active') {
          setError('Cette élection n\'est pas ouverte au vote');
          return;
        }

        // Charger les candidats pour cette élection
        const response = await electeurService.getCandidatsForVote(electionId);
        
        if (response.success) {
          setCandidats(response.data);
        } else {
          setError(response.error || 'Impossible de charger les candidats');
          toast.error(response.error || 'Erreur lors du chargement des candidats');
        }
      } catch (error) {
        console.error('Erreur chargement données vote:', error);
        setError('Erreur lors du chargement des données');
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (electionId) {
      loadVoteData();
    }
  }, [electionId, user]);

  const handleVoteSubmit = async () => {
    if (!selectedCandidat) {
      toast.warning('Veuillez sélectionner un candidat');
      return;
    }

    // Vérifications finales avant soumission
    if (hasVoted) {
      toast.error('Vous avez déjà voté pour cette élection');
      return;
    }

    if (electionStatus && electionStatus !== 'ouverte' && electionStatus !== 'active') {
      toast.error('Cette élection n\'est plus ouverte au vote');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await electeurService.submitVote(electionId, selectedCandidat);
      
      if (response.success) {
        toast.success('Vote enregistré avec succès !');
        // Rediriger vers la page des candidats pour voir le changement
        navigate(`/elections/${electionId}/candidats?voted=true`, { replace: true });
      } else {
        toast.error(response.error || 'Erreur lors de l\'enregistrement du vote');
      }
    } catch (error) {
      console.error('Erreur soumission vote:', error);
      toast.error('Erreur lors de l\'enregistrement du vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    // Retourner vers la page des candidats de l'élection
    navigate(`/elections/${electionId}/candidats`);
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
          <Typography variant="h6" gutterBottom>
            Impossible de voter
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
        >
          Retour à la liste des candidats
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header avec navigation */}
          <Box display="flex" alignItems="center" mb={4}>
            <Tooltip title="Retour">
              <IconButton
                onClick={handleBack}
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
                Vote
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {election?.nom || 'Élection'}
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
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Instructions :</strong> Sélectionnez le candidat pour lequel vous souhaitez voter, 
                  puis cliquez sur "Confirmer mon vote". Cette action est irréversible.
                </Typography>
              </Alert>
            </Paper>
          )}

          {/* Formulaire de vote */}
          <Fade in timeout={700}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={600} mb={3}>
                Candidats disponibles
              </Typography>

              {candidats.length === 0 ? (
                <Alert severity="warning">
                  <Typography variant="h6" gutterBottom>
                    Aucun candidat disponible
                  </Typography>
                  <Typography variant="body2">
                    Il n'y a actuellement aucun candidat approuvé pour cette élection.
                    Vous ne pouvez pas voter tant qu'il n'y a pas de candidats approuvés.
                  </Typography>
                </Alert>
              ) : (
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    value={selectedCandidat}
                    onChange={(e) => setSelectedCandidat(e.target.value)}
                  >
                    <Grid container spacing={3}>
                      {candidats.map((candidat, index) => (
                        <Grid item xs={12} key={candidat.id}>
                          <Fade in timeout={300 * (index + 1)}>
                            <Card
                              sx={{
                                border: selectedCandidat === candidat.id.toString() 
                                  ? '2px solid #2E73F8' 
                                  : '1px solid #E2E8F0',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: '#2E73F8',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                                },
                              }}
                              onClick={() => setSelectedCandidat(candidat.id.toString())}
                            >
                              <CardContent>
                                <Box display="flex" alignItems="center">
                                  <Radio
                                    value={candidat.id.toString()}
                                    checked={selectedCandidat === candidat.id.toString()}
                                    sx={{
                                      color: '#2E73F8',
                                      '&.Mui-checked': {
                                        color: '#2E73F8',
                                      },
                                    }}
                                  />
                                  <Box flexGrow={1} ml={2}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                      {candidat.electeur_nom}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                      {candidat.electeur_email}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                                      Programme électoral :
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {candidat.programme || 'Programme non disponible'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>
              )}

              {/* Boutons d'action */}
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ minWidth: 120 }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => navigate('/electeur')}
                    sx={{ minWidth: 120 }}
                  >
                    Dashboard
                  </Button>
                </Box>
                
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  onClick={handleVoteSubmit}
                  disabled={!selectedCandidat || submitting || candidats.length === 0}
                  sx={{
                    background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                    },
                    minWidth: 150,
                  }}
                >
                  {submitting ? 'Enregistrement...' : 'Confirmer mon vote'}
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Fade>
    </Container>
  );
};

export default VotePage; 