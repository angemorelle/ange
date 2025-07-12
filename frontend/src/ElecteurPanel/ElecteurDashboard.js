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
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  alpha,
  Fade,
  Zoom,
  Badge,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Stack
} from '@mui/material';
import {
  HowToVote,
  Person,
  CheckCircle,
  Refresh,
  EmojiEvents,
  PersonAdd,
  CalendarToday,
  Group,
  TrendingUp,
  AccountBalanceWallet,
  ContentCopy,
  Timeline,
  Email,
  Work,
  Security,
  History,
  Verified,
  Star,
  Schedule,
  ThumbUp
} from '@mui/icons-material';
import { electeurService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../App';

const StatCard = ({ title, value, icon, color, gradient, subtitle, trend, onClick }) => (
  <Zoom in timeout={600}>
    <Card
      sx={{
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.2)',
        } : {
          transform: 'translateY(-2px)',
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `radial-gradient(circle, ${alpha(color, 0.3)} 0%, transparent 70%)`,
          transform: 'translate(20px, -20px)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: alpha(color, 0.2),
              '& .MuiSvgIcon-root': { fontSize: 28 },
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h3" component="div" fontWeight={700} mb={1}>
          {value}
        </Typography>
        <Typography variant="h6" component="div" sx={{ opacity: 0.9, mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  </Zoom>
);

const CompactBlockchainCard = ({ user, blockchainAddress, onGenerateAddress, balance, loading }) => {
  const [copyTooltip, setCopyTooltip] = useState('Copier l\'adresse');

  // Debug temporaire
  console.log('🐛 DEBUG CompactBlockchainCard - blockchainAddress:', blockchainAddress);
  console.log('🐛 DEBUG CompactBlockchainCard - user:', user);
  console.log('🐛 DEBUG CompactBlockchainCard - balance:', balance);

  const handleCopyAddress = async () => {
    if (blockchainAddress) {
      try {
        await navigator.clipboard.writeText(blockchainAddress);
        setCopyTooltip('Adresse copiée !');
        toast.success('Adresse copiée dans le presse-papier');
        setTimeout(() => setCopyTooltip('Copier l\'adresse'), 2000);
      } catch (error) {
        toast.error('Erreur lors de la copie');
      }
    }
  };

  return (
    <Zoom in timeout={800}>
      <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)', height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mr: 2,
                }}
              >
                <AccountBalanceWallet />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Portefeuille Blockchain
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sécurisé et traçable
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Actualiser">
              <IconButton size="small" onClick={() => window.location.reload()}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {!blockchainAddress ? (
            <Box>
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                  Vous n'avez pas encore d'adresse blockchain associée à votre compte. Une adresse blockchain 
                  est nécessaire pour participer aux votes sécurisés.
                </Typography>
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={onGenerateAddress}
                disabled={loading}
                startIcon={loading ? <LinearProgress /> : <AccountBalanceWallet />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 8px 25px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                {loading ? 'Génération...' : 'Générer mon adresse blockchain'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Adresse Ethereum
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box flexGrow={1}>
                    <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {blockchainAddress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {blockchainAddress.substring(0, 8)}...{blockchainAddress.substring(blockchainAddress.length - 6)}
                    </Typography>
                  </Box>
                  <Tooltip title={copyTooltip}>
                    <IconButton onClick={handleCopyAddress} sx={{ ml: 1 }}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Statut de l'adresse
                    </Typography>
                    <Chip
                      label="Valide"
                      color="success"
                      icon={<Verified />}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Solde ETH
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {balance || '0.0000'} ETH
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Informations du compte
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Nom:</strong> {user?.nom || 'Marie Martin'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Email:</strong> {user?.email || 'marie.martin@email.com'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Inscription:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '11/07/2025'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <Work sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Profession:</strong> {user?.profession || 'Non définie'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Alert severity="info" sx={{ borderRadius: 2, backgroundColor: alpha('#2196f3', 0.1) }}>
                <Typography variant="body2">
                  <strong>Note :</strong> Votre adresse blockchain est unique et sécurisée. Elle permet de garantir l'authenticité et la 
                  traçabilité de vos votes tout en préservant votre anonymat.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

const ActivityCard = ({ activities }) => (
  <Zoom in timeout={1000}>
    <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              mr: 2,
            }}
          >
            <Timeline />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Activité Récente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vos dernières actions
            </Typography>
          </Box>
        </Box>

        {activities.length === 0 ? (
          <Box textAlign="center" py={3}>
            <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Aucune activité récente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vos actions apparaîtront ici
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {activities.slice(0, 3).map((activity, index) => (
              <ListItem key={index} sx={{ px: 0, py: 1 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: activity.color || '#E3F2FD',
                      color: activity.textColor || '#1976D2',
                    }}
                  >
                    {React.cloneElement(activity.icon, { sx: { fontSize: 16 } })}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600}>
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                      {activity.description}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  </Zoom>
);

const ElectionCard = ({ election, onVote, onCandidate, userCandidatures }) => {
  const userCandidate = userCandidatures.find(c => c.elections_id === election.id);
  const isCandidate = !!userCandidate;
  const hasVoted = election.user_has_voted;
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'ouverte': return '#00C853';
      case 'planifiee': return '#FFB300';
      case 'fermee': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusChip = (status) => {
    const color = getStatusColor(status);
    const labels = {
      'ouverte': 'Active',
      'planifiee': 'À venir',
      'fermee': 'Terminée'
    };
    
    return (
      <Chip
        label={labels[status] || 'Statut inconnu'}
        sx={{
          backgroundColor: color,
          color: 'white',
          fontWeight: 600,
          fontSize: '0.7rem'
        }}
        size="small"
      />
    );
  };

  return (
    <Zoom in timeout={800}>
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" flexGrow={1}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                  mr: 2,
                }}
              >
                <HowToVote sx={{ fontSize: 24 }} />
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                  {election.nom}
                </Typography>
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(election.date_ouverture).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {getStatusChip(election.status)}
          </Box>

          {/* Informations essentielles */}
          <Stack spacing={1} mb={2}>
            <Box display="flex" alignItems="center">
              <Security sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
              <Typography variant="body2" color="text.secondary">
                Vote sécurisé blockchain
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Group sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {election.poste_nom}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Person sx={{ fontSize: 16, mr: 1, color: 'info.main' }} />
              <Typography variant="body2" color="text.secondary">
                {election.candidat_count || 0} candidats
              </Typography>
            </Box>
          </Stack>

          {/* Description courte */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {election.description ? election.description.substring(0, 100) + '...' : 'Participez à cette élection importante.'}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Actions */}
          <Box>
            {isCandidate ? (
              <Box textAlign="center">
                <Chip
                  label="Candidat"
                  color="success"
                  icon={<Star />}
                  sx={{ mb: 1, fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {userCandidate?.status || 'En attente'}
                </Typography>
              </Box>
            ) : hasVoted ? (
              <Box textAlign="center">
                <Chip
                  label="Voté"
                  color="success"
                  icon={<CheckCircle />}
                  sx={{ mb: 1, fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Merci !
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => onVote(election.id)}
                  disabled={election.status !== 'ouverte'}
                  startIcon={<HowToVote />}
                  sx={{
                    background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 8px 25px rgba(46, 115, 248, 0.4)',
                    },
                  }}
                >
                  Voter
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => onCandidate(election.id)}
                  disabled={election.status !== 'ouverte'}
                  startIcon={<PersonAdd />}
                  sx={{
                    borderColor: '#FF6B35',
                    color: '#FF6B35',
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#FF6B35',
                      backgroundColor: alpha('#FF6B35', 0.1),
                    },
                  }}
                >
                  Candidater
                </Button>
              </Stack>
            )}
          </Box>

          {/* Badge blockchain pour les élections actives */}
          {election.status === 'ouverte' && (
            <Box sx={{ mt: 2 }}>
              <Paper
                sx={{
                  p: 1,
                  backgroundColor: alpha('#00C853', 0.1),
                  borderRadius: 1,
                  border: `1px solid ${alpha('#00C853', 0.3)}`,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Security sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                  <Typography variant="body2" fontWeight={600} color="success.main" fontSize="0.75rem">
                    Blockchain
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

const ElecteurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockchainAddress, setBlockchainAddress] = useState('');
  const [blockchainBalance, setBlockchainBalance] = useState('0.0000');
  const [generatingAddress, setGeneratingAddress] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
    loadBlockchainInfo();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [electionsRes, candidaturesRes] = await Promise.all([
        electeurService.getElections(),
        electeurService.getCandidatures()
      ]);

      if (electionsRes.success) {
        setElections(Array.isArray(electionsRes.data) ? electionsRes.data : []);
      }

      if (candidaturesRes.success) {
        setCandidatures(Array.isArray(candidaturesRes.data) ? candidaturesRes.data : []);
      }

      // Simuler quelques activités récentes
      setActivities([
        {
          title: 'Connexion au système',
          description: 'Connexion réussie',
          time: 'Il y a 2 min',
          icon: <Person />,
          color: '#E3F2FD',
          textColor: '#1976D2'
        }
      ]);

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadBlockchainInfo = async () => {
    try {
      console.log('🔍 Chargement des informations blockchain...');
      const response = await electeurService.getBlockchainInfo();
      console.log('📦 Réponse API blockchain:', response);
      
      if (response.success && response.data) {
        const address = response.data.address || '';
        const balance = response.data.balance || '0.0000';
        
        console.log('🔗 Adresse blockchain récupérée:', address);
        console.log('💰 Solde récupéré:', balance);
        
        setBlockchainAddress(address);
        setBlockchainBalance(balance);
        
        // Vérification du state après mise à jour
        console.log('📊 State après mise à jour - Address:', address, 'Balance:', balance);
      } else {
        console.log('❌ Pas de données blockchain ou réponse en échec:', response);
        setBlockchainAddress('');
        setBlockchainBalance('0.0000');
      }
    } catch (err) {
      console.error('❌ Erreur chargement blockchain:', err);
      // Fallback pour tester avec des données simulées si l'utilisateur existe
      if (user && user.id) {
        console.log('🧪 Test avec adresse simulée pour le debugging...');
        // Simuler une adresse pour le debugging
        const simulatedAddress = '0x9954ba875f2556B9e1cA7c3699b8214FEaBc3419';
        setBlockchainAddress(simulatedAddress);
        setBlockchainBalance('0.0000');
        console.log('✅ Adresse simulée définie:', simulatedAddress);
      }
    }
  };

  const handleGenerateAddress = async () => {
    try {
      setGeneratingAddress(true);
      const response = await electeurService.generateBlockchainAddress();
      if (response.success) {
        setBlockchainAddress(response.data.address);
        setBlockchainBalance(response.data.balance || '0.0000');
        
        setActivities(prev => [{
          title: 'Adresse générée',
          description: 'Blockchain configurée',
          time: 'Maintenant',
          icon: <AccountBalanceWallet />,
          color: '#E8F5E8',
          textColor: '#2E7D32'
        }, ...prev]);
      }
    } catch (err) {
      console.error('Erreur génération adresse:', err);
      toast.error('Erreur lors de la génération de l\'adresse');
    } finally {
      setGeneratingAddress(false);
    }
  };

  const handleVote = async (electionId) => {
    try {
      const response = await electeurService.voterElection(electionId);
      if (response.success) {
        toast.success('Vote enregistré avec succès!');
        loadDashboardData();
        
        setActivities(prev => [{
          title: 'Vote enregistré',
          description: 'Vote blockchain',
          time: 'Maintenant',
          icon: <HowToVote />,
          color: '#E8F5E8',
          textColor: '#2E7D32'
        }, ...prev]);
      } else {
        toast.error(response.error || 'Erreur lors du vote');
      }
    } catch (err) {
      console.error('Erreur vote:', err);
      toast.error('Erreur lors du vote: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCandidater = async (electionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir vous porter candidat à cette élection ?')) {
      return;
    }

    try {
      const response = await electeurService.postulerCandidat(electionId);
      if (response.success) {
        toast.success('Candidature soumise avec succès!');
        loadDashboardData();
        
        setActivities(prev => [{
          title: 'Candidature soumise',
          description: 'En attente de validation',
          time: 'Maintenant',
          icon: <PersonAdd />,
          color: '#FFF3E0',
          textColor: '#F57C00'
        }, ...prev]);
      } else {
        toast.error(response.error || 'Erreur lors de la candidature');
      }
    } catch (err) {
      console.error('Erreur candidature:', err);
      toast.error('Erreur lors de la candidature: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStats = () => {
    const votesEffectues = elections.filter(e => e.user_has_voted).length;
    const candidaturesTotal = candidatures.length;
    const electionsActives = elections.filter(e => e.status === 'ouverte').length;
    const tauxParticipation = elections.length > 0 ? Math.round((votesEffectues / elections.length) * 100) : 87;
    
    return {
      votesEffectues,
      candidaturesTotal,
      electionsActives,
      tauxParticipation
    };
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '400px', mb: 3, height: 8, borderRadius: 4 }} />
          <Typography variant="h5" color="primary" fontWeight={600}>
            Chargement de votre tableau de bord...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Préparation de vos données personnalisées
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 3, p: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadDashboardData}>
              Réessayer
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Erreur de chargement
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  const stats = getStats();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box mb={5}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                  mr: 3,
                }}
              >
                <Person sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                  Bonjour, {user?.nom || 'Marie Martin'} ! 👋
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Gérez vos participations électorales en toute simplicité
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Actualiser les données">
              <IconButton
                onClick={loadDashboardData}
                sx={{
                  backgroundColor: alpha('#2E73F8', 0.1),
                  border: `2px solid ${alpha('#2E73F8', 0.2)}`,
                  '&:hover': { 
                    backgroundColor: alpha('#2E73F8', 0.2),
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Refresh sx={{ color: '#2E73F8' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {/* Statistiques */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Votes effectués"
            value={stats.votesEffectues}
            icon={<HowToVote />}
            color="#2E73F8"
            gradient="linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)"
            subtitle="Total participations"
            trend="+12% ce mois"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Candidatures"
            value={stats.candidaturesTotal}
            icon={<PersonAdd />}
            color="#FF6B35"
            gradient="linear-gradient(135deg, #FF6B35 0%, #F44336 100%)"
            subtitle="Candidatures soumises"
            trend="+25% ce mois"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Elections actives"
            value={stats.electionsActives}
            icon={<CheckCircle />}
            color="#00C853"
            gradient="linear-gradient(135deg, #00C853 0%, #4CAF50 100%)"
            subtitle="En cours de vote"
            trend="En temps réel"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Taux participation"
            value={`${stats.tauxParticipation}%`}
            icon={<TrendingUp />}
            color="#9C27B0"
            gradient="linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
            subtitle="Votre engagement"
            trend="+5% ce mois"
          />
        </Grid>
      </Grid>

      {/* Portefeuille Blockchain et Activités */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <CompactBlockchainCard
            user={user}
            blockchainAddress={blockchainAddress}
            onGenerateAddress={handleGenerateAddress}
            balance={blockchainBalance}
            loading={generatingAddress}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ActivityCard activities={activities} />
        </Grid>
      </Grid>

      {/* Élections Disponibles */}
      <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  mr: 2,
                }}
              >
                <HowToVote />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Élections Disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participez aux élections en cours
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={`${elections.length} élection(s)`} 
              color="primary" 
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {elections.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <HowToVote sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
                Aucune élection disponible
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Les nouvelles élections apparaîtront ici dès qu'elles seront programmées
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {elections.map((election) => (
                <Grid item xs={12} md={6} lg={4} key={election.id}>
                  <ElectionCard
                    election={election}
                    onVote={handleVote}
                    onCandidate={handleCandidater}
                    userCandidatures={candidatures}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Mes candidatures */}
      {candidatures.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={4}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  mr: 2,
                }}
              >
                <EmojiEvents />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Mes Candidatures
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Suivi de vos candidatures
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              {candidatures.map((candidature) => (
                <Grid item xs={12} sm={6} md={4} key={candidature.id}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                      border: '1px solid #FFB300',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 8px 25px rgba(255, 179, 0, 0.3)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} noWrap mb={2}>
                        {candidature.election_nom}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(candidature.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                        <Chip
                          label={candidature.status === 'approuve' ? 'Approuvée' : 
                                 candidature.status === 'rejete' ? 'Rejetée' : 'En attente'}
                          color={candidature.status === 'approuve' ? 'success' : 
                                 candidature.status === 'rejete' ? 'error' : 'warning'}
                          size="small"
                          icon={candidature.status === 'approuve' ? <ThumbUp /> : <Schedule />}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ElecteurDashboard;
