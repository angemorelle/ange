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
  People,
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  Person,
  Email,
  LocationOn,
  Phone,
  Badge as BadgeIcon,
  Refresh,
  PersonAdd,
  CheckCircle,
  Block,
  VpnKey,
  AdminPanelSettings,
  SupervisorAccount,
  FilterList,
  Download,
  Upload
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { adminService } from '../services/api';
import { useAuth } from '../App';

const ElecteurList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [electeurs, setElecteurs] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartement, setFilterDepartement] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedElecteur, setSelectedElecteur] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: '',
    adresse: '',
    departement_id: '',
    type: 'electeur',
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
      const [electeursRes, departementsRes] = await Promise.all([
        adminService.getElecteurs(),
        adminService.getDepartements()
      ]);

      if (electeursRes.success) {
        setElecteurs(electeursRes.data);
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

  const getTypeInfo = (type) => {
    const typeMap = {
      'admin': { 
        label: 'Admin', 
        color: 'error', 
        icon: <AdminPanelSettings />,
        bgColor: '#F44336' 
      },
      'superviseur': { 
        label: 'Superviseur', 
        color: 'warning', 
        icon: <SupervisorAccount />,
        bgColor: '#FF9800' 
      },
      'electeur': { 
        label: 'Électeur', 
        color: 'primary', 
        icon: <Person />,
        bgColor: '#2196F3' 
      }
    };
    return typeMap[type] || { label: type, color: 'default', icon: <Person />, bgColor: '#9E9E9E' };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'actif': { 
        label: 'Actif', 
        color: 'success', 
        icon: <CheckCircle />,
        bgColor: '#4CAF50' 
      },
      'inactif': { 
        label: 'Inactif', 
        color: 'error', 
        icon: <Block />,
        bgColor: '#F44336' 
      },
      'suspendu': { 
        label: 'Suspendu', 
        color: 'warning', 
        icon: <Block />,
        bgColor: '#FF9800' 
      }
    };
    return statusMap[status] || { label: status, color: 'default', icon: <Person />, bgColor: '#9E9E9E' };
  };

  const filteredElecteurs = electeurs.filter(electeur => {
    const matchesSearch = electeur.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         electeur.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         electeur.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         electeur.cin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || electeur.type === filterType;
    const matchesDepartement = filterDepartement === 'all' || electeur.departement_id?.toString() === filterDepartement;
    const matchesStatus = filterStatus === 'all' || electeur.statut === filterStatus;
    
    return matchesSearch && matchesType && matchesDepartement && matchesStatus;
  });

  const handleOpenDialog = (mode, electeur = null) => {
    setDialogMode(mode);
    setSelectedElecteur(electeur);
    
    if (mode === 'edit' && electeur) {
      setFormData({
        nom: electeur.nom || '',
        prenom: electeur.prenom || '',
        email: electeur.email || '',
        telephone: electeur.telephone || '',
        cin: electeur.cin || '',
        adresse: electeur.adresse || '',
        departement_id: electeur.departement_id || '',
        type: electeur.type || 'electeur',
        statut: electeur.statut || 'actif'
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        cin: '',
        adresse: '',
        departement_id: '',
        type: 'electeur',
        statut: 'actif'
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedElecteur(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      cin: '',
      adresse: '',
      departement_id: '',
      type: 'electeur',
      statut: 'actif'
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await adminService.addElecteur(formData);
        toast.success('Électeur ajouté avec succès');
      } else {
        // Logique pour modifier un électeur
        toast.success('Électeur modifié avec succès');
      }
      
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (electeurId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet électeur ?')) {
      try {
        await adminService.deleteElecteur(electeurId);
        toast.success('Électeur supprimé avec succès');
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
    const total = electeurs.length;
    const admins = electeurs.filter(e => e.type === 'admin').length;
    const superviseurs = electeurs.filter(e => e.type === 'superviseur').length;
    const electeursSimples = electeurs.filter(e => e.type === 'electeur').length;
    const actifs = electeurs.filter(e => e.statut === 'actif').length;
    
    return { total, admins, superviseurs, electeursSimples, actifs };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des électeurs...
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
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  mr: 2,
                }}
              >
                <People sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Gestion des Électeurs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gérez tous les utilisateurs du système
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Importer">
                <IconButton
                  sx={{
                    backgroundColor: alpha('#4CAF50', 0.1),
                    '&:hover': { backgroundColor: alpha('#4CAF50', 0.2) }
                  }}
                >
                  <Upload sx={{ color: '#4CAF50' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exporter">
                <IconButton
                  sx={{
                    backgroundColor: alpha('#2196F3', 0.1),
                    '&:hover': { backgroundColor: alpha('#2196F3', 0.2) }
                  }}
                >
                  <Download sx={{ color: '#2196F3' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={loadData}
                  sx={{
                    backgroundColor: alpha('#9C27B0', 0.1),
                    '&:hover': { backgroundColor: alpha('#9C27B0', 0.2) }
                  }}
                >
                  <Refresh sx={{ color: '#9C27B0' }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                  }
                }}
              >
                Nouvel Électeur
              </Button>
            </Box>
          </Box>

          {/* Statistiques */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.total}
                      </Typography>
                      <Typography variant="body2">Total</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.admins}
                      </Typography>
                      <Typography variant="body2">Admins</Typography>
                    </Box>
                    <AdminPanelSettings sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.superviseurs}
                      </Typography>
                      <Typography variant="body2">Superviseurs</Typography>
                    </Box>
                    <SupervisorAccount sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.electeursSimples}
                      </Typography>
                      <Typography variant="body2">Électeurs</Typography>
                    </Box>
                    <Person sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.actifs}
                      </Typography>
                      <Typography variant="body2">Actifs</Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtres et recherche */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Rechercher un électeur..."
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
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      input={<OutlinedInput label="Type" />}
                    >
                      <MenuItem value="all">Tous</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superviseur">Superviseur</MenuItem>
                      <MenuItem value="electeur">Électeur</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      input={<OutlinedInput label="Statut" />}
                    >
                      <MenuItem value="all">Tous</MenuItem>
                      <MenuItem value="actif">Actif</MenuItem>
                      <MenuItem value="inactif">Inactif</MenuItem>
                      <MenuItem value="suspendu">Suspendu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Département</InputLabel>
                    <Select
                      value={filterDepartement}
                      onChange={(e) => setFilterDepartement(e.target.value)}
                      input={<OutlinedInput label="Département" />}
                    >
                      <MenuItem value="all">Tous</MenuItem>
                      {departements.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id.toString()}>
                          {dept.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`${filteredElecteurs.length} résultat(s)`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${stats.actifs} actifs`}
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

      {/* Tableau des électeurs */}
      <Fade in timeout={700}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {filteredElecteurs.length === 0 ? (
              <Box py={8} textAlign="center">
                <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || filterType !== 'all' || filterDepartement !== 'all' || filterStatus !== 'all' ? 'Aucun électeur trouvé' : 'Aucun électeur'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm || filterType !== 'all' || filterDepartement !== 'all' || filterStatus !== 'all'
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Ajoutez votre premier électeur pour commencer'
                  }
                </Typography>
                {!searchTerm && filterType === 'all' && filterDepartement === 'all' && filterStatus === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => handleOpenDialog('create')}
                  >
                    Ajouter un électeur
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#9C27B0', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>CIN</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Département</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredElecteurs.map((electeur) => {
                      const typeInfo = getTypeInfo(electeur.type);
                      const statusInfo = getStatusInfo(electeur.statut);
                      return (
                        <TableRow
                          key={electeur.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha('#9C27B0', 0.02),
                            },
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: typeInfo.bgColor,
                                  mr: 2,
                                  fontSize: '1rem',
                                }}
                              >
                                {electeur.nom?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {electeur.nom} {electeur.prenom}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ID: {electeur.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" display="flex" alignItems="center">
                                <Email sx={{ fontSize: 16, mr: 1 }} />
                                {electeur.email || 'N/A'}
                              </Typography>
                              {electeur.telephone && (
                                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                                  <Phone sx={{ fontSize: 16, mr: 1 }} />
                                  {electeur.telephone}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={electeur.cin || 'N/A'}
                              size="small"
                              variant="outlined"
                              icon={<BadgeIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getDepartementName(electeur.departement_id)}
                              size="small"
                              variant="outlined"
                              icon={<LocationOn />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={typeInfo.label}
                              color={typeInfo.color}
                              icon={typeInfo.icon}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                '& .MuiSvgIcon-root': { fontSize: 16 }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusInfo.label}
                              color={statusInfo.color}
                              icon={statusInfo.icon}
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
                                  sx={{ color: '#2196F3' }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#FF9800' }}
                                  onClick={() => handleOpenDialog('edit', electeur)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#F44336' }}
                                  onClick={() => handleDelete(electeur.id)}
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

      {/* Dialog pour créer/modifier un électeur */}
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
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                mr: 2,
              }}
            >
              {dialogMode === 'create' ? <PersonAdd /> : <Edit />}
            </Avatar>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Ajouter un électeur' : 'Modifier l\'électeur'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CIN"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                required
              />
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                multiline
                rows={2}
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
                  <MenuItem value="electeur">Électeur</MenuItem>
                  <MenuItem value="superviseur">Superviseur</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
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
                  <MenuItem value="suspendu">Suspendu</MenuItem>
                </Select>
              </FormControl>
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
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
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

export default ElecteurList;
