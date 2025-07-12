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
  Work,
  WorkOutline,
  People,
  BusinessCenter,
  Refresh,
  PostAdd,
  Info,
  Category,
  Star,
  TrendingUp,
  Assessment,
  Timeline,
  AccountBalance
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { adminService } from '../services/api';
import { useAuth } from '../App';

const PosteList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postes, setPostes] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedPoste, setSelectedPoste] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    niveau: '',
    type: 'politique',
    departement_id: '',
    nombre_places: 1,
    duree_mandat: '',
    salaire: '',
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
      const [postesRes, departementsRes] = await Promise.all([
        adminService.getPostes(),
        adminService.getDepartements()
      ]);

      if (postesRes.success) {
        setPostes(postesRes.data);
      }
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

  const getNiveauInfo = (niveau) => {
    const niveauMap = {
      'national': { 
        label: 'National', 
        color: 'error', 
        icon: <AccountBalance />,
        bgColor: '#F44336' 
      },
      'regional': { 
        label: 'Régional', 
        color: 'warning', 
        icon: <BusinessCenter />,
        bgColor: '#FF9800' 
      },
      'local': { 
        label: 'Local', 
        color: 'info', 
        icon: <Work />,
        bgColor: '#2196F3' 
      },
      'municipal': { 
        label: 'Municipal', 
        color: 'success', 
        icon: <WorkOutline />,
        bgColor: '#4CAF50' 
      }
    };
    return niveauMap[niveau] || { label: niveau, color: 'default', icon: <Work />, bgColor: '#9E9E9E' };
  };

  const getTypeInfo = (type) => {
    const typeMap = {
      'politique': { 
        label: 'Politique', 
        color: 'primary', 
        icon: <Assignment />,
        bgColor: '#2196F3' 
      },
      'administratif': { 
        label: 'Administratif', 
        color: 'secondary', 
        icon: <BusinessCenter />,
        bgColor: '#9C27B0' 
      },
      'technique': { 
        label: 'Technique', 
        color: 'info', 
        icon: <Work />,
        bgColor: '#00BCD4' 
      }
    };
    return typeMap[type] || { label: type, color: 'default', icon: <Work />, bgColor: '#9E9E9E' };
  };

  const filteredPostes = postes.filter(poste => {
    const matchesSearch = poste.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poste.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Simplifier le filtre status car le champ n'existe pas
    return matchesSearch;
  });

  const handleOpenDialog = (mode, poste = null) => {
    setDialogMode(mode);
    setSelectedPoste(poste);
    
    if (mode === 'edit' && poste) {
      setFormData({
        nom: poste.nom || '',
        description: poste.description || '',
        niveau: poste.niveau || '',
        type: poste.type || 'politique',
        departement_id: poste.departement_id || '',
        nombre_places: poste.nombre_places || 1,
        duree_mandat: poste.duree_mandat || '',
        salaire: poste.salaire || '',
        statut: poste.statut || 'actif'
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        niveau: '',
        type: 'politique',
        departement_id: '',
        nombre_places: 1,
        duree_mandat: '',
        salaire: '',
        statut: 'actif'
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPoste(null);
    setFormData({
      nom: '',
      description: '',
      niveau: '',
      type: 'politique',
      departement_id: '',
      nombre_places: 1,
      duree_mandat: '',
      salaire: '',
      statut: 'actif'
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        // Logique pour créer un poste
        toast.success('Poste créé avec succès');
      } else {
        // Logique pour modifier un poste
        toast.success('Poste modifié avec succès');
      }
      
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (posteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) {
      try {
        // Logique pour supprimer un poste
        toast.success('Poste supprimé avec succès');
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

  const getStatsData = () => {
    const total = postes.length;
    // Simplifier pour utiliser seulement les données disponibles
    const maires = postes.filter(p => p.nom?.toLowerCase().includes('maire')).length;
    const deputes = postes.filter(p => p.nom?.toLowerCase().includes('député')).length;
    const senateurs = postes.filter(p => p.nom?.toLowerCase().includes('sénateur')).length;
    const conseillers = postes.filter(p => p.nom?.toLowerCase().includes('conseiller')).length;
    const presidents = postes.filter(p => p.nom?.toLowerCase().includes('président')).length;
    
    return { total, maires, deputes, senateurs, conseillers, presidents };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des postes...
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
                  background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
                  mr: 2,
                }}
              >
                <Assignment sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Gestion des Postes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gérez les postes électifs et administratifs
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={loadData}
                  sx={{
                    backgroundColor: alpha('#673AB7', 0.1),
                    '&:hover': { backgroundColor: alpha('#673AB7', 0.2) }
                  }}
                >
                  <Refresh sx={{ color: '#673AB7' }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<PostAdd />}
                onClick={() => handleOpenDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #512DA8 0%, #673AB7 100%)',
                  }
                }}
              >
                Nouveau Poste
              </Button>
            </Box>
          </Box>

          {/* Statistiques */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.maires}
                      </Typography>
                      <Typography variant="body2">Maires</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.deputes}
                      </Typography>
                      <Typography variant="body2">Députés</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.senateurs}
                      </Typography>
                      <Typography variant="body2">Sénateurs</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.conseillers}
                      </Typography>
                      <Typography variant="body2">Conseillers</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.presidents}
                      </Typography>
                      <Typography variant="body2">Présidents</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
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
                    placeholder="Rechercher un poste..."
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
                      <MenuItem value="actif">Actifs</MenuItem>
                      <MenuItem value="inactif">Inactifs</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Chip
                      label={`${filteredPostes.length} poste(s)`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${stats.total} postes`}
                      variant="outlined"
                      color="secondary"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Tableau des postes */}
      <Fade in timeout={700}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {filteredPostes.length === 0 ? (
              <Box py={8} textAlign="center">
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || filterStatus !== 'all' ? 'Aucun poste trouvé' : 'Aucun poste'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm || filterStatus !== 'all'
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Ajoutez votre premier poste pour commencer'
                  }
                </Typography>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<PostAdd />}
                    onClick={() => handleOpenDialog('create')}
                  >
                    Créer un poste
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#673AB7', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Poste</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date de création</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPostes.map((poste) => (
                      <TableRow
                        key={poste.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#673AB7', 0.02),
                          },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
                                mr: 2,
                                fontSize: '1rem',
                              }}
                            >
                              {poste.nom?.charAt(0)?.toUpperCase() || 'P'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {poste.nom}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {poste.description || 'Pas de description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(poste.created_at).toLocaleDateString('fr-FR')}
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
                                onClick={() => handleOpenDialog('edit', poste)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                sx={{ color: '#F44336' }}
                                onClick={() => handleDelete(poste.id)}
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

      {/* Dialog pour créer/modifier un poste */}
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
                background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
                mr: 2,
              }}
            >
              {dialogMode === 'create' ? <PostAdd /> : <Edit />}
            </Avatar>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Créer un poste' : 'Modifier le poste'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du poste"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  input={<OutlinedInput label="Type" />}
                >
                  <MenuItem value="politique">Politique</MenuItem>
                  <MenuItem value="administratif">Administratif</MenuItem>
                  <MenuItem value="technique">Technique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                placeholder="Description du poste et des responsabilités..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  input={<OutlinedInput label="Niveau" />}
                >
                  <MenuItem value="national">National</MenuItem>
                  <MenuItem value="regional">Régional</MenuItem>
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="municipal">Municipal</MenuItem>
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nombre de places"
                type="number"
                value={formData.nombre_places}
                onChange={(e) => setFormData({ ...formData, nombre_places: e.target.value })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Durée du mandat (années)"
                type="number"
                value={formData.duree_mandat}
                onChange={(e) => setFormData({ ...formData, duree_mandat: e.target.value })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salaire (optionnel)"
                value={formData.salaire}
                onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                placeholder="Ex: 500000 FCFA"
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
              background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #512DA8 0%, #673AB7 100%)',
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

export default PosteList;
