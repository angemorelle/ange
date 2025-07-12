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
  LocationCity,
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  LocationOn,
  People,
  Map,
  Public,
  Refresh,
  AddLocationAlt,
  Info,
  Business,
  PinDrop,
  Flag,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { adminService } from '../services/api';
import { useAuth } from '../App';

const DepartementList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    chef_lieu: '',
    population: '',
    superficie: '',
    statut: 'actif'
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
      const departementsRes = await adminService.getDepartements();

      if (departementsRes.success) {
        setDepartements(departementsRes.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartements = departements.filter(dept => 
    dept.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.chef_lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (mode, departement = null) => {
    setDialogMode(mode);
    setSelectedDepartement(departement);
    
    if (mode === 'edit' && departement) {
      setFormData({
        nom: departement.nom || '',
        code: departement.code || '',
        description: departement.description || '',
        chef_lieu: departement.chef_lieu || '',
        population: departement.population || '',
        superficie: departement.superficie || '',
        statut: departement.statut || 'actif'
      });
    } else {
      setFormData({
        nom: '',
        code: '',
        description: '',
        chef_lieu: '',
        population: '',
        superficie: '',
        statut: 'actif'
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartement(null);
    setFormData({
      nom: '',
      code: '',
      description: '',
      chef_lieu: '',
      population: '',
      superficie: '',
      statut: 'actif'
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await adminService.addDepartement(formData);
        toast.success('Département ajouté avec succès');
      } else {
        // Logique pour modifier un département
        toast.success('Département modifié avec succès');
      }
      
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (departementId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      try {
        await adminService.deleteDepartement(departementId);
        toast.success('Département supprimé avec succès');
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getStatsData = () => {
    const total = departements.length;
    // Simplifier pour utiliser seulement les données disponibles
    const unique = [...new Set(departements.map(d => d.nom))].length; // Départements uniques
    const duplicates = total - unique; // Doublons
    const recent = departements.filter(d => {
      const createdDate = new Date(d.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;
    
    return { total, unique, duplicates, recent };
  };

  const stats = getStatsData();

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des départements...
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
                  background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                  mr: 2,
                }}
              >
                <LocationCity sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Gestion des Départements
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gérez la division territoriale administrative
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={loadData}
                  sx={{
                    backgroundColor: alpha('#00C853', 0.1),
                    '&:hover': { backgroundColor: alpha('#00C853', 0.2) }
                  }}
                >
                  <Refresh sx={{ color: '#00C853' }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddLocationAlt />}
                onClick={() => handleOpenDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4CAF50 0%, #00C853 100%)',
                  }
                }}
              >
                Nouveau Département
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
                      <Typography variant="body2">Départements</Typography>
                    </Box>
                    <LocationCity sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.unique}
                      </Typography>
                      <Typography variant="body2">Départements Uniques</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.duplicates}
                      </Typography>
                      <Typography variant="body2">Doublons</Typography>
                    </Box>
                    <Business sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.recent}
                      </Typography>
                      <Typography variant="body2">Départements Récents</Typography>
                    </Box>
                    <Map sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recherche */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Rechercher un département..."
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
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Chip
                      label={`${filteredDepartements.length} département(s)`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${stats.total} total`}
                      variant="outlined"
                      color="info"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Tableau des départements */}
      <Fade in timeout={700}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {filteredDepartements.length === 0 ? (
              <Box py={8} textAlign="center">
                <LocationCity sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm ? 'Aucun département trouvé' : 'Aucun département'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm
                    ? 'Essayez de modifier votre recherche'
                    : 'Ajoutez votre premier département pour commencer'
                  }
                </Typography>
                {!searchTerm && (
                  <Button
                    variant="contained"
                    startIcon={<AddLocationAlt />}
                    onClick={() => handleOpenDialog('create')}
                  >
                    Ajouter un département
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#00C853', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Département</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date de création</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Dernière modification</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDepartements.map((departement) => (
                      <TableRow
                        key={departement.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#00C853', 0.02),
                          },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                                mr: 2,
                                fontSize: '1rem',
                              }}
                            >
                              {departement.nom?.charAt(0)?.toUpperCase() || 'D'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {departement.nom}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`#${departement.id}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(departement.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(departement.updated_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Voir détails">
                              <IconButton
                                size="small"
                                sx={{ color: '#2196F3' }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                sx={{ color: '#FF9800' }}
                                onClick={() => handleOpenDialog('edit', departement)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                sx={{ color: '#F44336' }}
                                onClick={() => handleDelete(departement.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
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

      {/* Dialog pour créer/modifier un département */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
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
                background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                mr: 2,
              }}
            >
              {dialogMode === 'create' ? <AddLocationAlt /> : <Edit />}
            </Avatar>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Ajouter un département' : 'Modifier le département'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du département"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                placeholder="Description du département..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chef-lieu"
                value={formData.chef_lieu}
                onChange={(e) => setFormData({ ...formData, chef_lieu: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  input={<OutlinedInput label="Statut" />}
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Population"
                type="number"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                placeholder="Nombre d'habitants"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Superficie (km²)"
                type="number"
                value={formData.superficie}
                onChange={(e) => setFormData({ ...formData, superficie: e.target.value })}
                placeholder="Superficie en km²"
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
              background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4CAF50 0%, #00C853 100%)',
              }
            }}
          >
            {dialogMode === 'create' ? 'Ajouter' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DepartementList;
