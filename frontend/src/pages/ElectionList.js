// frontend/src/pages/ElectionList.js
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
  Alert,
  LinearProgress,
  Fade,
  alpha,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  DateRange,
  CheckCircle,
  Schedule,
  Error,
  HowToVote,
  Assignment,
  LocationOn,
  CalendarToday,
  Refresh,
  Download,
  MoreVert,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { electionService, adminService } from '../services/api';
import { useAuth } from '../App';

const ElectionList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedElection, setSelectedElection] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    date_ouverture: new Date().toISOString().split('T')[0],
    date_fermeture: new Date().toISOString().split('T')[0],
    poste_id: '',
    departement_id: '',
    statut: 'programmee'
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
      const [electionsRes, departementsRes, postesRes] = await Promise.all([
        electionService.getElections(),
        adminService.getDepartements(),
        adminService.getPostes()
      ]);

      if (electionsRes.success) {
        setElections(electionsRes.data);
      }
      if (departementsRes.success) {
        setDepartements(departementsRes.data);
      }
      if (postesRes.success) {
        setPostes(postesRes.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const ouverture = new Date(election.date_ouverture);
    const fermeture = new Date(election.date_fermeture);

    if (now < ouverture) {
      return { 
        label: 'Programmée', 
        color: 'warning', 
        icon: <Schedule />,
        bgColor: '#FFB300'
      };
    } else if (now >= ouverture && now <= fermeture) {
      return { 
        label: 'Active', 
        color: 'success', 
        icon: <CheckCircle />,
        bgColor: '#00C853'
      };
    } else {
      return { 
        label: 'Terminée', 
        color: 'error', 
        icon: <Error />,
        bgColor: '#F44336'
      };
    }
  };

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getElectionStatus(election);
    return matchesSearch && status.label.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleOpenDialog = (mode, election = null) => {
    setDialogMode(mode);
    setSelectedElection(election);
    
    if (mode === 'edit' && election) {
      setFormData({
        nom: election.nom || '',
        description: election.description || '',
        date_ouverture: election.date_ouverture ? new Date(election.date_ouverture).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        date_fermeture: election.date_fermeture ? new Date(election.date_fermeture).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        poste_id: election.poste_id || '',
        departement_id: election.departement_id || '',
        statut: election.statut || 'programmee'
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        date_ouverture: new Date().toISOString().split('T')[0],
        date_fermeture: new Date().toISOString().split('T')[0],
        poste_id: '',
        departement_id: '',
        statut: 'programmee'
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedElection(null);
    setFormData({
      nom: '',
      description: '',
      date_ouverture: new Date().toISOString().split('T')[0],
      date_fermeture: new Date().toISOString().split('T')[0],
      poste_id: '',
      departement_id: '',
      statut: 'programmee'
    });
  };

  const handleSubmit = async () => {
    try {
      // Validation des dates
      const dateOuverture = new Date(formData.date_ouverture);
      const dateFermeture = new Date(formData.date_fermeture);
      
      if (dateFermeture <= dateOuverture) {
        toast.error('La date de fermeture doit être postérieure à la date d\'ouverture');
        return;
      }

      if (dialogMode === 'create') {
        await electionService.createElection(formData);
        toast.success('Élection créée avec succès');
      } else {
        await electionService.updateElection(selectedElection.id, formData);
        toast.success('Élection modifiée avec succès');
      }
      
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (electionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette élection ?')) {
      try {
        await electionService.deleteElection(electionId);
        toast.success('Élection supprimée avec succès');
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getDepartementName = (id) => {
    const dept = departements.find(d => d.id === id);
    return dept ? dept.nom : 'N/A';
  };

  const getPosteName = (id) => {
    const poste = postes.find(p => p.id === id);
    return poste ? poste.nom : 'N/A';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des élections...
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
                  background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                  mr: 2,
                }}
              >
                <HowToVote sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Gestion des Élections
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gérez toutes les élections de votre système
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={loadData}
                  sx={{
                    backgroundColor: alpha('#2E73F8', 0.1),
                    '&:hover': { backgroundColor: alpha('#2E73F8', 0.2) }
                  }}
                >
                  <Refresh sx={{ color: '#2E73F8' }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
                  }
                }}
              >
                Nouvelle Élection
              </Button>
            </Box>
          </Box>

          {/* Filtres et recherche */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Rechercher une élection..."
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
                      <MenuItem value="programmée">Programmées</MenuItem>
                      <MenuItem value="active">Actives</MenuItem>
                      <MenuItem value="terminée">Terminées</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Stack direction="row" spacing={2}>
                    <Chip
                      label={`${filteredElections.length} élection(s)`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${elections.filter(e => getElectionStatus(e).label === 'Active').length} actives`}
                      variant="outlined"
                      color="success"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Tableau des élections */}
      <Fade in timeout={700}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {filteredElections.length === 0 ? (
              <Box py={8} textAlign="center">
                <HowToVote sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || filterStatus !== 'all' ? 'Aucune élection trouvée' : 'Aucune élection'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Créez votre première élection pour commencer'
                  }
                </Typography>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog('create')}
                  >
                    Créer une élection
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#2E73F8', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Poste</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Département</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Dates</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredElections.map((election) => {
                      const status = getElectionStatus(election);
                      return (
                        <TableRow
                          key={election.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha('#2E73F8', 0.02),
                            },
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {election.nom}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {election.description || 'Pas de description'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getPosteName(election.poste_id)}
                              size="small"
                              variant="outlined"
                              icon={<Assignment />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getDepartementName(election.departement_id)}
                              size="small"
                              variant="outlined"
                              icon={<LocationOn />}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" display="flex" alignItems="center">
                                <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                                {new Date(election.date_ouverture).toLocaleDateString('fr-FR')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                au {new Date(election.date_fermeture).toLocaleDateString('fr-FR')}
                              </Typography>
                            </Box>
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
                              <Tooltip title="Voir détails">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#2E73F8' }}
                                  onClick={() => navigate(`/elections/${election.id}/candidats`)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#FF6B35' }}
                                  onClick={() => handleOpenDialog('edit', election)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#F44336' }}
                                  onClick={() => handleDelete(election.id)}
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

      {/* Dialog pour créer/modifier une élection */}
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
                background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
                mr: 2,
              }}
            >
              {dialogMode === 'create' ? <Add /> : <Edit />}
            </Avatar>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Créer une élection' : 'Modifier l\'élection'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'élection"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Poste</InputLabel>
                <Select
                  value={formData.poste_id}
                  onChange={(e) => setFormData({ ...formData, poste_id: e.target.value })}
                  input={<OutlinedInput label="Poste" />}
                >
                  {postes.map((poste) => (
                    <MenuItem key={poste.id} value={poste.id}>
                      {poste.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Département</InputLabel>
                <Select
                  value={formData.departement_id}
                  onChange={(e) => setFormData({ ...formData, departement_id: e.target.value })}
                  input={<OutlinedInput label="Département" />}
                >
                  {departements.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'ouverture"
                type="date"
                value={formData.date_ouverture}
                onChange={(e) => setFormData({ ...formData, date_ouverture: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de fermeture"
                type="date"
                value={formData.date_fermeture}
                onChange={(e) => setFormData({ ...formData, date_fermeture: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                required
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
              background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
              }
            }}
          >
            {dialogMode === 'create' ? 'Créer' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ElectionList;
