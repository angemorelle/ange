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
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../App';
import { adminService, electionService } from '../../services/api';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, color, gradient, subtitle }) => (
  <Zoom in timeout={600}>
    <Card
      sx={{
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${alpha(color, 0.3)} 0%, transparent 70%)`,
          transform: 'translate(30px, -30px)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" component="div" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="h6" component="div" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              backgroundColor: alpha(color, 0.2),
              '& .MuiSvgIcon-root': { fontSize: 32 },
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </Zoom>
);

const SuperviseurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    electionsTotal: 0,
    electionsActives: 0,
    candidatsTotal: 0,
    electeursTotal: 0
  });
  const [elections, setElections] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques et élections
      const [electionsRes, candidatsRes] = await Promise.all([
        electionService.getElections(),
        adminService.getCandidats()
      ]);
      
      console.log('Réponses API Superviseur:', { electionsRes, candidatsRes });
      
      if (electionsRes.success && Array.isArray(electionsRes.data)) {
        const electionsData = electionsRes.data;
        setElections(electionsData);
        
        const now = new Date();
        const electionsActives = electionsData.filter(election => {
          const ouverture = new Date(election.date_ouverture);
          const fermeture = new Date(election.date_fermeture);
          return now >= ouverture && now <= fermeture;
        });
        
        // Filtrer les élections par département du superviseur si nécessaire
        const departementElections = electionsData; // À filtrer selon le département
        
        setStats(prev => ({
          ...prev,
          electionsTotal: departementElections.length,
          electionsActives: electionsActives.length
        }));
      }
      
      if (candidatsRes.success && Array.isArray(candidatsRes.data)) {
        const candidatsData = candidatsRes.data;
        const candidatsEnAttente = candidatsData.filter(c => c.status === 'en_attente');
        
        setStats(prev => ({
          ...prev,
          candidatsTotal: candidatsEnAttente.length,
          electeursTotal: 85 // Statistique simulée pour le département
        }));
      }
      
      // Statistiques par défaut si pas de données
      setStats(prev => ({
        electionsTotal: prev.electionsTotal || 0,
        electionsActives: prev.electionsActives || 0,
        candidatsTotal: prev.candidatsTotal || 0,
        electeursTotal: prev.electeursTotal || 85
      }));
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du dashboard');
      
      // Statistiques par défaut en cas d'erreur
      setStats({
        electionsTotal: 0,
        electionsActives: 0,
        candidatsTotal: 0,
        electeursTotal: 0
      });
      setElections([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement du tableau de bord...
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
              <SupervisorAccount sx={{ fontSize: 32 }} />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Tableau de Bord Superviseur
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Bienvenue, {user?.nom} - Supervision électorale
              </Typography>
            </Box>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={loadDashboard}
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
          <StatCard
            title="Élections Totales"
            value={stats.electionsTotal}
            icon={<HowToVote />}
            color="#2E73F8"
            gradient="linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)"
            subtitle="Toutes périodes"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Élections Actives"
            value={stats.electionsActives}
            icon={<CheckCircle />}
            color="#00C853"
            gradient="linear-gradient(135deg, #00C853 0%, #4CAF50 100%)"
            subtitle="En cours de vote"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Candidatures"
            value={stats.candidatsTotal}
            icon={<People />}
            color="#FF6B35"
            gradient="linear-gradient(135deg, #FF6B35 0%, #F44336 100%)"
            subtitle="À superviser"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Électeurs Actifs"
            value={stats.electeursTotal}
            icon={<Assessment />}
            color="#9C27B0"
            gradient="linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
            subtitle="Département"
          />
        </Grid>
      </Grid>

      {/* Liste des élections */}
      <Fade in timeout={800}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Élections à Superviser
            </Typography>
            
            {elections.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aucune élection disponible
                </Typography>
                <Typography variant="body2">
                  Il n'y a actuellement aucune élection à superviser dans votre département.
                </Typography>
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#FF6B35', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Poste</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
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
                            {election.description && (
                              <Typography variant="body2" color="text.secondary">
                                {election.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              <strong>Début:</strong> {new Date(election.date_ouverture).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Fin:</strong> {new Date(election.date_fermeture).toLocaleDateString('fr-FR')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={election.poste_nom}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {getStatusChip(election)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Superviser">
                            <IconButton
                              size="small"
                              sx={{
                                color: '#FF6B35',
                                '&:hover': { backgroundColor: alpha('#FF6B35', 0.1) }
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

      {/* Informations de supervision */}
      <Fade in timeout={1000}>
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            backgroundColor: alpha('#FF6B35', 0.05),
            border: `1px solid ${alpha('#FF6B35', 0.2)}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Rôle de Superviseur
          </Typography>
          <Typography variant="body2">
            En tant que superviseur, vous êtes responsable de la surveillance et de la validation 
            des processus électoraux dans votre département. Vous pouvez superviser les candidatures, 
            surveiller le déroulement des votes et garantir l'intégrité du processus démocratique.
          </Typography>
        </Alert>
      </Fade>
    </Container>
  );
};

export default SuperviseurDashboard; 