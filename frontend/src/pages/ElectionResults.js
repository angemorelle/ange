import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Fade,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  EmojiEvents,
  TrendingUp,
  People,
  HowToVote,
  LocationOn,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ElectionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('Aucun ID d\'élection fourni');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/api/statistics/elections/${id}/results`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.error || 'Erreur lors du chargement des résultats');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError(`Impossible de charger les résultats: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'fermee': return 'error';
      case 'ouverte': return 'success';
      case 'planifiee': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fermee': return <CheckCircle />;
      case 'ouverte': return <TrendingUp />;
      case 'planifiee': return <Schedule />;
      default: return <Warning />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'fermee': return 'Terminée';
      case 'ouverte': return 'En cours';
      case 'planifiee': return 'Planifiée';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des résultats...
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
          onClick={() => navigate('/admin/elections')}
          variant="outlined"
        >
          Retour aux élections
        </Button>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Aucun résultat disponible pour cette élection
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/elections')}
          variant="outlined"
        >
          Retour aux élections
        </Button>
      </Container>
    );
  }

  const { election, resultats } = results;
  
  if (!election || !resultats) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Structure de données invalide
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/elections')}
          variant="outlined"
        >
          Retour aux élections
        </Button>
      </Container>
    );
  }

  const { candidats, gagnant, total_votes, taux_participation, stats_generales, votes_par_departement } = resultats;

  // Préparer les données pour les graphiques
  const chartData = candidats.map((candidat, index) => ({
    name: candidat.electeur_nom,
    votes: candidat.votes_recus,
    percentage: parseFloat(candidat.pourcentage_votes),
    color: COLORS[index % COLORS.length]
  }));

  const pieData = candidats.map((candidat, index) => ({
    name: candidat.electeur_nom,
    value: candidat.votes_recus,
    color: COLORS[index % COLORS.length]
  }));

  const departementData = votes_par_departement.map(dept => ({
    name: dept.departement,
    participation: parseFloat(dept.taux_participation_dept),
    electeurs: dept.electeurs_eligibles,
    votes: dept.electeurs_ont_vote
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header avec navigation */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={3}>
            <Tooltip title="Retour aux élections">
              <IconButton
                onClick={() => navigate('/admin/elections')}
                sx={{ mr: 2 }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              Résultats de l'élection
            </Typography>
            <Chip
              icon={getStatusIcon(election.status)}
              label={getStatusLabel(election.status)}
              color={getStatusColor(election.status)}
              variant="outlined"
            />
          </Box>

          {/* Informations de l'élection */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {election.nom}
              </Typography>
              {election.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {election.description}
                </Typography>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Poste :</strong> {election.poste_nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ouverture :</strong> {formatDate(election.date_ouverture)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fermeture :</strong> {formatDate(election.date_fermeture)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Statut :</strong> {election.statut_temps}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Statistiques générales */}
      <Fade in timeout={700}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <HowToVote sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {total_votes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Votes exprimés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {formatPercentage(taux_participation)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taux de participation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {stats_generales?.candidats_approuves || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Candidats approuvés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmojiEvents sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" component="div">
                  {gagnant ? gagnant.electeur_nom : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gagnant
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Résultats détaillés */}
      <Fade in timeout={900}>
        <Grid container spacing={4}>
          {/* Graphique en barres */}
          {candidats.length > 0 && (
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Résultats par candidat
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="votes" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Graphique circulaire */}
          {candidats.length > 0 && (
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Répartition des votes
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Tableau des résultats */}
          {candidats.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Détails des résultats
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Rang</strong></TableCell>
                          <TableCell><strong>Candidat</strong></TableCell>
                          <TableCell><strong>Département</strong></TableCell>
                          <TableCell><strong>Votes</strong></TableCell>
                          <TableCell><strong>Pourcentage</strong></TableCell>
                          <TableCell><strong>Statut</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {candidats.map((candidat, index) => (
                          <TableRow key={candidat.id}>
                            <TableCell>
                              <Badge
                                badgeContent={index + 1}
                                color={index === 0 ? "success" : "default"}
                              >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {candidat.electeur_nom.charAt(0)}
                                </Avatar>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body1">
                                  {candidat.electeur_nom}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {candidat.electeur_email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<LocationOn />}
                                label={candidat.departement_nom}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="bold">
                                {candidat.votes_recus}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                                  {formatPercentage(candidat.pourcentage_votes)}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={parseFloat(candidat.pourcentage_votes)}
                                  sx={{ width: 60, height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={candidat.candidat_status === 'approuve' ? 'Approuvé' : 'En attente'}
                                color={candidat.candidat_status === 'approuve' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Participation par département */}
          {votes_par_departement.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Participation par département
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="participation" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Fade>
    </Container>
  );
};

export default ElectionResults; 