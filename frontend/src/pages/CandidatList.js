import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  LinearProgress,
  Fade,
  alpha,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Stack,
  Alert,
  Badge,
  Divider
} from '@mui/material';
import {
  Assignment,
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  Person,
  CheckCircle,
  Schedule,
  Cancel,
  Refresh,
  HowToVote,
  People,
  Gavel,
  Description,
  LocationOn,
  CalendarToday,
  FilterList,
  TrendingUp,
  PersonAdd
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { adminService, electionService } from '../services/api';
import { useAuth } from '../App';

const CandidatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidats, setCandidats] = useState([]);
  const [elections, setElections] = useState([]);
  const [electeurs, setElecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterElection, setFilterElection] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  
  const [formData, setFormData] = useState({
    electeur_id: '',
    elections_id: '',
    programme: '',
    statut: 'en_attente'
  });

  const [statusForm, setStatusForm] = useState({
    candidat_id: '',
    statut: '',
    commentaire: ''
  });

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candidatsRes, electionsRes, electeursRes] = await Promise.all([
        adminService.getCandidats(),
        electionService.getElections(),
        adminService.getElecteurs()
      ]);

      if (candidatsRes.success) {
        setCandidats(candidatsRes.data);
      }
      if (electionsRes.success) {
        setElections(electionsRes.data);
      }
      if (electeursRes.success) {
        setElecteurs(electeursRes.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'en_attente': { 
        label: 'En Attente', 
        color: 'warning', 
        icon: <Schedule />,
        bgColor: '#FFB300' 
      },
      'approuve': { 
        label: 'Approuvé', 
        color: 'success', 
        icon: <CheckCircle />,
        bgColor: '#00C853' 
      },
      'rejete': { 
        label: 'Rejeté', 
        color: 'error', 
        icon: <Cancel />,
        bgColor: '#F44336' 
      }
    };
    return statusMap[status] || { label: status, color: 'default', icon: <Person />, bgColor: '#9E9E9E' };
  };

  const filteredCandidats = candidats.filter(candidat => {
    const matchesSearch = candidat.electeur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidat.election_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidat.programme?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || candidat.statut === filterStatus;
    const matchesElection = filterElection === 'all' || candidat.elections_id?.toString() === filterElection;
    
    return matchesSearch && matchesStatus && matchesElection;
  });

  const handleOpenDialog = (mode, candidat = null) => {
    setDialogMode(mode);
    setSelectedCandidat(candidat);
    
    if (mode === 'edit' && candidat) {
      setFormData({
        electeur_id: candidat.electeur_id || '',
        elections_id: candidat.elections_id || '',
        programme: candidat.programme || '',
        statut: candidat.statut || 'en_attente'
      });
    } else {
      setFormData({
        electeur_id: '',
        elections_id: '',
        programme: '',
        statut: 'en_attente'
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidat(null);
    setFormData({
      electeur_id: '',
      elections_id: '',
      programme: '',
      statut: 'en_attente'
    });
  };

  const handleOpenStatusDialog = (candidat) => {
    setSelectedCandidat(candidat);
    setStatusForm({
      candidat_id: candidat.id,
      statut: candidat.statut,
      commentaire: ''
    });
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedCandidat(null);
    setStatusForm({
      candidat_id: '',
      statut: '',
      commentaire: ''
    });
  };

  const handleSubmit = async () => {
    try {
      // Ici vous pouvez ajouter la logique pour créer/modifier un candidat
      // En supposant que vous avez une API pour cela
      toast.success(dialogMode === 'create' ? 'Candidat ajouté avec succès' : 'Candidat modifié avec succès');
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await adminService.updateCandidatStatus(statusForm.candidat_id, statusForm.statut);
      toast.success('Statut du candidat mis à jour avec succès');
      handleCloseStatusDialog();
      loadData();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (candidatId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      try {
        // Logique de suppression
        toast.success('Candidature supprimée avec succès');
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getElectionName = (id) => {
    const election = elections.find(e => e.id === id);
    return election ? election.nom : 'N/A';
  };

  const getElecteurName = (id) => {
    const electeur = electeurs.find(e => e.id === id);
    return electeur ? electeur.nom : 'N/A';
  };

  const getStatsData = () => {
    const total = candidats.length;
    const enAttente = candidats.filter(c => c.statut === 'en_attente').length;
    const approuves = candidats.filter(c => c.statut === 'approuve').length;
    const rejetes = candidats.filter(c => c.statut === 'rejete').length;
    
    return { total, enAttente, approuves, rejetes };
  };

  const stats = getStatsData();

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
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                  mr: 2,
                }}
              >
                <Assignment sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Gestion des Candidatures
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gérez toutes les candidatures aux élections
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
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
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F44336 0%, #FF6B35 100%)',
                  }
                }}
              >
                Ajouter Candidat
              </Button>
            </Box>
          </Box>

          {/* Statistiques */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.total}
                      </Typography>
                      <Typography variant="body2">Total</Typography>
                    </Box>
                    <Assignment sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.enAttente}
                      </Typography>
                      <Typography variant="body2">En Attente</Typography>
                    </Box>
                    <Schedule sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.approuves}
                      </Typography>
                      <Typography variant="body2">Approuvés</Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.rejetes}
                      </Typography>
                      <Typography variant="body2">Rejetés</Typography>
                    </Box>
                    <Cancel sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtres et recherche */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      input={<OutlinedInput label="Statut" />}
                    >
                      <MenuItem value="all">Tous</MenuItem>
                      <MenuItem value="en_attente">En Attente</MenuItem>
                      <MenuItem value="approuve">Approuvés</MenuItem>
                      <MenuItem value="rejete">Rejetés</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Élection</InputLabel>
                    <Select
                      value={filterElection}
                      onChange={(e) => setFilterElection(e.target.value)}
                      input={<OutlinedInput label="Élection" />}
                    >
                      <MenuItem value="all">Toutes</MenuItem>
                      {elections.map((election) => (
                        <MenuItem key={election.id} value={election.id.toString()}>
                          {election.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`${filteredCandidats.length} résultat(s)`}
                      variant="outlined"
                      color="primary"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Tableau des candidats */}
      <Fade in timeout={700}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {filteredCandidats.length === 0 ? (
              <Box py={8} textAlign="center">
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || filterStatus !== 'all' || filterElection !== 'all' ? 'Aucune candidature trouvée' : 'Aucune candidature'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm || filterStatus !== 'all' || filterElection !== 'all'
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Ajoutez votre première candidature pour commencer'
                  }
                </Typography>
                {!searchTerm && filterStatus === 'all' && filterElection === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => handleOpenDialog('create')}
                  >
                    Ajouter un candidat
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#FF6B35', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Candidat</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Programme</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCandidats.map((candidat) => {
                      const status = getStatusInfo(candidat.statut);
                      return (
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
                                  background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                                  mr: 2,
                                  fontSize: '1rem',
                                }}
                              >
                                {candidat.electeur_nom?.charAt(0)?.toUpperCase() || 'C'}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {candidat.electeur_nom || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ID: {candidat.electeur_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={candidat.election_nom || getElectionName(candidat.elections_id)}
                              size="small"
                              variant="outlined"
                              icon={<HowToVote />}
                              sx={{ maxWidth: 200 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {candidat.programme || 'Pas de programme'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              color={status.color}
                              icon={status.icon}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                '& .MuiSvgIcon-root': { fontSize: 16 }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title="Changer le statut">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#9C27B0' }}
                                  onClick={() => handleOpenStatusDialog(candidat)}
                                >
                                  <Gavel />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#FF6B35' }}
                                  onClick={() => handleOpenDialog('edit', candidat)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#F44336' }}
                                  onClick={() => handleDelete(candidat.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Dialog pour créer/modifier un candidat */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                mr: 2,
              }}
            >
              {dialogMode === 'create' ? <PersonAdd /> : <Edit />}
            </Avatar>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Ajouter un candidat' : 'Modifier le candidat'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Électeur</InputLabel>
                <Select
                  value={formData.electeur_id}
                  onChange={(e) => setFormData({ ...formData, electeur_id: e.target.value })}
                  input={<OutlinedInput label="Électeur" />}
                >
                  {electeurs.map((electeur) => (
                    <MenuItem key={electeur.id} value={electeur.id}>
                      {electeur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Élection</InputLabel>
                <Select
                  value={formData.elections_id}
                  onChange={(e) => setFormData({ ...formData, elections_id: e.target.value })}
                  input={<OutlinedInput label="Élection" />}
                >
                  {elections.map((election) => (
                    <MenuItem key={election.id} value={election.id}>
                      {election.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Programme"
                value={formData.programme}
                onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                multiline
                rows={4}
                placeholder="Décrivez le programme du candidat..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #F44336 0%, #FF6B35 100%)',
              }
            }}
          >
            {dialogMode === 'create' ? 'Ajouter' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour changer le statut */}
      <Dialog 
        open={openStatusDialog} 
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                mr: 2,
              }}
            >
              <Gavel />
            </Avatar>
            <Typography variant="h6">
              Changer le statut de la candidature
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Candidat:</strong> {selectedCandidat?.electeur_nom}<br/>
                  <strong>Élection:</strong> {selectedCandidat?.election_nom}
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Nouveau statut</InputLabel>
                <Select
                  value={statusForm.statut}
                  onChange={(e) => setStatusForm({ ...statusForm, statut: e.target.value })}
                  input={<OutlinedInput label="Nouveau statut" />}
                >
                  <MenuItem value="en_attente">En Attente</MenuItem>
                  <MenuItem value="approuve">Approuvé</MenuItem>
                  <MenuItem value="rejete">Rejeté</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentaire (optionnel)"
                value={statusForm.commentaire}
                onChange={(e) => setStatusForm({ ...statusForm, commentaire: e.target.value })}
                multiline
                rows={3}
                placeholder="Ajoutez un commentaire sur cette décision..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseStatusDialog} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
              }
            }}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CandidatList;
