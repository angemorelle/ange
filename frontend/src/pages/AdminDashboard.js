import React, { useState, useEffect } from 'react';
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
  Zoom,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  AdminPanelSettings,
  Assessment,
  HowToVote,
  People,
  Refresh,
  CheckCircle,
  Schedule,
  Warning,
  Add,
  Edit,
  TrendingUp,
  Assignment,
  LocationCity,
  SupervisorAccount,
  EmojiEvents,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../App';
import { adminService, electionService, statisticsService } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${alpha(color, 0.3)}`,
        } : {},
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
      onClick={onClick}
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
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">+{trend}% ce mois</Typography>
              </Box>
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [currentElections, setCurrentElections] = useState([]);
  const [topDepartements, setTopDepartements] = useState([]);
  const [stats, setStats] = useState({
    electionsTotal: 0,
    electionsActives: 0,
    candidatsTotal: 0,
    electeursTotal: 0,
    departementsTotal: 0,
    superviseursTotal: 0,
    tauxParticipation: 0,
    totalVotes: 0
  });
  const [recentElections, setRecentElections] = useState([]);
  const [recentCandidats, setRecentCandidats] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.type !== 'admin') {
      toast.error('Accès réservé aux administrateurs');
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Charger les nouvelles statistiques enrichies
      const [
        dashboardStatsRes,
        currentElectionsRes,
        topDepartementsRes,
        recentElectionsRes,
        recentCandidatsRes
      ] = await Promise.all([
        statisticsService.getDashboardStats(),
        statisticsService.getCurrentElections(),
        statisticsService.getTopDepartements(),
        electionService.getElections({ limit: 10 }),
        adminService.getCandidats({ limit: 10 })
      ]);
      
      console.log('Statistiques dashboard:', dashboardStatsRes);
      
      // Mettre à jour les statistiques principales
      if (dashboardStatsRes.success && dashboardStatsRes.data) {
        const statsData = dashboardStatsRes.data;
        setDashboardStats(statsData);
        
        setStats({
          electionsTotal: statsData.resume?.total_elections || 0,
          electionsActives: statsData.elections?.actives_et_a_venir?.filter(e => e.statut_temps === 'En cours').length || 0,
          candidatsTotal: statsData.resume?.total_candidats || 0,
          electeursTotal: statsData.resume?.total_electeurs || 0,
          departementsTotal: statsData.departements?.total_departements || 0,
          superviseursTotal: statsData.superviseurs?.total_superviseurs || 0,
          tauxParticipation: parseFloat(statsData.resume?.taux_participation || 0),
          totalVotes: statsData.resume?.total_votes || 0
        });
      }
      
      // Élections en cours
      if (currentElectionsRes.success) {
        setCurrentElections(currentElectionsRes.data);
      }
      
      // Top départements
      if (topDepartementsRes.success) {
        setTopDepartements(topDepartementsRes.data);
      }
      
      // Données pour les tableaux (maintenir compatibilité)
      if (recentElectionsRes.success) {
        setRecentElections(recentElectionsRes.data);
      }
      
      if (recentCandidatsRes.success) {
        setRecentCandidats(recentCandidatsRes.data);
      }
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du dashboard');
      
      // Statistiques par défaut en cas d'erreur
      setStats({
        electionsTotal: 0,
        electionsActives: 0,
        candidatsTotal: 0,
        electeursTotal: 0,
        departementsTotal: 0,
        superviseursTotal: 0,
        tauxParticipation: 0,
        totalVotes: 0
      });
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

  const getCandidatStatusChip = (status) => {
    const statusMap = {
      'en_attente': { label: 'En attente', color: 'warning' },
      'approuve': { label: 'Approuvé', color: 'success' },
      'rejete': { label: 'Rejeté', color: 'error' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const ouverture = new Date(election.date_ouverture);
    const fermeture = new Date(election.date_fermeture);

    if (now < ouverture) {
      return { label: 'Programmée', color: 'warning', bgColor: alpha('#FFB300', 0.2) };
    } else if (now >= ouverture && now <= fermeture) {
      return { label: 'Active', color: 'success', bgColor: alpha('#00C853', 0.2) };
    } else {
      return { label: 'Terminée', color: 'error', bgColor: alpha('#F44336', 0.2) };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement du tableau de bord administrateur...
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
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  mr: 3,
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 32 }} />
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Administration Électorale
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Bienvenue, {user?.nom} - Panneau de contrôle administrateur
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={loadDashboard}
                sx={{
                  backgroundColor: alpha('#9C27B0', 0.1),
                  '&:hover': { backgroundColor: alpha('#9C27B0', 0.2) }
                }}
              >
                <Refresh sx={{ color: '#9C27B0' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {/* Statistiques principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Élections Totales"
            value={stats.electionsTotal}
            icon={<HowToVote />}
            color="#2E73F8"
            gradient="linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)"
            subtitle={`${stats.electionsActives} en cours`}
            trend={15}
            onClick={() => navigate('/admin/elections')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Votes Enregistrés"
            value={stats.totalVotes}
            icon={<CheckCircle />}
            color="#00C853"
            gradient="linear-gradient(135deg, #00C853 0%, #4CAF50 100%)"
            subtitle={`${stats.tauxParticipation}% participation`}
            trend={25}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Candidatures"
            value={stats.candidatsTotal}
            icon={<Assignment />}
            color="#FF6B35"
            gradient="linear-gradient(135deg, #FF6B35 0%, #F44336 100%)"
            subtitle="Toutes élections"
            onClick={() => navigate('/admin/candidats')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Électeurs"
            value={stats.electeursTotal}
            icon={<People />}
            color="#FFB300"
            gradient="linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)"
            subtitle="Inscrits actifs"
            onClick={() => navigate('/admin/electeurs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Départements"
            value={stats.departementsTotal}
            icon={<LocationCity />}
            color="#9C27B0"
            gradient="linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
            subtitle="Régions gérées"
            onClick={() => navigate('/admin/departements')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Superviseurs"
            value={stats.superviseursTotal}
            icon={<SupervisorAccount />}
            color="#607D8B"
            gradient="linear-gradient(135deg, #607D8B 0%, #455A64 100%)"
            subtitle="Actifs"
          />
        </Grid>
      </Grid>

      {/* Élections en cours */}
      {currentElections.length > 0 && (
        <Fade in timeout={600}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                🗳️ Élections en Cours
              </Typography>
              <Grid container spacing={2}>
                {currentElections.map((election) => (
                  <Grid item xs={12} md={6} lg={4} key={election.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: alpha('#00C853', 0.3),
                        backgroundColor: alpha('#00C853', 0.02),
                        '&:hover': {
                          borderColor: '#00C853',
                          backgroundColor: alpha('#00C853', 0.05),
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                          {election.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {election.poste_nom}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Candidats:</Typography>
                          <Chip 
                            label={`${election.candidats_approuves}/${election.candidats_total}`} 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Votes reçus:</Typography>
                          <Chip 
                            label={election.votes_recus} 
                            size="small" 
                            color="success"
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Temps restant:</Typography>
                          <Typography variant="body2" color="warning.main" fontWeight={500}>
                            {election.heures_restantes > 0 
                              ? `${Math.floor(election.heures_restantes)}h`
                              : 'Fermée'
                            }
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Top départements */}
      {topDepartements.length > 0 && (
        <Fade in timeout={800}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3} color="secondary">
                🏆 Départements les Plus Actifs
              </Typography>
              <Grid container spacing={2}>
                {topDepartements.slice(0, 6).map((dept, index) => (
                  <Grid item xs={12} sm={6} md={4} key={dept.departement}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        background: index < 3 
                          ? `linear-gradient(135deg, ${['#FFD700', '#C0C0C0', '#CD7F32'][index]} 0%, transparent 100%)`
                          : 'transparent',
                        border: index < 3 ? 'none' : '1px solid #E2E8F0'
                      }}
                    >
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography variant="h6" fontWeight={600}>
                            #{index + 1}
                          </Typography>
                          <Typography variant="h6" fontWeight={600} ml={1} sx={{ flexGrow: 1 }}>
                            {dept.departement}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">Électeurs:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {dept.nombre_electeurs}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">Candidats:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {dept.nombre_candidats}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Votes:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {dept.nombre_votes}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Actions rapides */}
      <Fade in timeout={700}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Actions Rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/elections')}
                  sx={{
                    background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                    }
                  }}
                >
                  Nouvelle Élection
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={() => navigate('/admin/candidats')}
                  color="secondary"
                >
                  Gérer Candidatures
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  onClick={() => navigate('/admin/electeurs')}
                >
                  Gérer Électeurs
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LocationCity />}
                  onClick={() => navigate('/admin/departements')}
                >
                  Gérer Départements
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      <Grid container spacing={3}>
        {/* Élections récentes */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={900}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Élections récentes
                </Typography>
                {recentElections.length > 0 ? (
                  <List>
                    {recentElections.map((election) => (
                      <ListItem key={election.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getElectionStatus(election).bgColor }}>
                            <HowToVote />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={election.nom}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(election.date_ouverture).toLocaleDateString('fr-FR')} - {new Date(election.date_fermeture).toLocaleDateString('fr-FR')}
                              </Typography>
                              <Chip
                                label={getElectionStatus(election).label}
                                color={getElectionStatus(election).color}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/elections/${election.id}/candidats`)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {(getElectionStatus(election).label === 'Terminée' || getElectionStatus(election).label === 'Active') && (
                            <Tooltip title="Voir les résultats">
                              <IconButton
                                size="small"
                                sx={{ color: '#00C853' }}
                                onClick={() => navigate(`/elections/${election.id}/resultats`)}
                              >
                                <EmojiEvents />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune élection récente
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Candidatures récentes */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={1100}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Candidatures Récentes
                </Typography>
                
                {recentCandidats.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 3 }}>
                    <Typography variant="body2">
                      Aucune candidature récente
                    </Typography>
                  </Alert>
                ) : (
                  <Box>
                    {recentCandidats.slice(0, 5).map((candidat, index) => (
                      <Box 
                        key={candidat.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 2,
                          borderBottom: index < 4 ? '1px solid #E2E8F0' : 'none'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                            mr: 2,
                            fontSize: '1rem',
                          }}
                        >
                          {candidat.electeur_nom?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {candidat.electeur_nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {candidat.election_nom}
                          </Typography>
                        </Box>
                        {getCandidatStatusChip(candidat.status)}
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 2 }} />
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/admin/candidats')}
                    >
                      Voir toutes les candidatures
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Informations système */}
      <Fade in timeout={1300}>
        <Alert 
          severity="info" 
          sx={{ 
            mt: 4,
            borderRadius: 3,
            backgroundColor: alpha('#9C27B0', 0.05),
            border: `1px solid ${alpha('#9C27B0', 0.2)}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            🛡️ Administration Système
          </Typography>
          <Typography variant="body2">
            Vous avez un accès complet à toutes les fonctionnalités d'administration. 
            Gérez les élections, supervisez les candidatures, administrez les utilisateurs 
            et maintenez l'intégrité du système électoral.
          </Typography>
        </Alert>
      </Fade>
    </Container>
  );
};

export default AdminDashboard; 