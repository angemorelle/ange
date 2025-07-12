// frontend/src/pages/AffectationSuperviseur.js
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  SupervisorAccount,
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  Assignment,
  HowToVote,
  People,
  LinkOff,
  Link,
  Refresh,
  PersonAdd,
  Info,
  Check,
  Cancel,
  Warning,
  Timeline,
  GroupAdd,
  AssignmentInd,
  AccountCircle,
  CalendarToday,
  LocationOn
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { adminService, electionService } from '../services/api';
import { useAuth } from '../App';

const AffectationSuperviseur = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [superviseurs, setSuperviseurs] = useState([]);
  const [elections, setElections] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedAffectation, setSelectedAffectation] = useState(null);
  
  const [formData, setFormData] = useState({
    superviseur_id: '',
    election_id: '',
    date_affectation: new Date().toISOString().split('T')[0],
    statut: 'actif',
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
      const [superviseursRes, electionsRes] = await Promise.all([
        adminService.getSuperviseurs(),
        electionService.getElections()
      ]);

      if (superviseursRes.success) {
        setSuperviseurs(superviseursRes.data);
      }
      if (electionsRes.success) {
        setElections(electionsRes.data);
      }
      
      // Simuler des affectations (remplacez par votre logique API)
      const mockAffectations = [
        {
          id: 1,
          superviseur_id: 1,
          election_id: 1,
          superviseur_nom: 'Martin Dubois',
          election_nom: 'Élection Présidentielle 2024',
          date_affectation: '2024-01-15',
          statut: 'actif',
          commentaire: 'Superviseur principal'
        },
        {
          id: 2,
          superviseur_id: 2,
          election_id: 2,
          superviseur_nom: 'Sophie Laurent',
          election_nom: 'Élection Législative 2024',
          date_affectation: '2024-01-20',
          statut: 'actif',
          commentaire: 'Superviseur adjoint'
        }
      ];
      setAffectations(mockAffectations);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'actif': { 
        label: 'Actif', 
        color: 'success', 
        icon: <Check />,
        bgColor: '#4CAF50' 
      },
      'inactif': { 
        label: 'Inactif', 
        color: 'error', 
        icon: <Cancel />,
        bgColor: '#F44336' 
      },
      'suspendu': { 
        label: 'Suspendu', 
        color: 'warning', 
        icon: <Warning />,
        bgColor: '#FF9800' 
      }
    };
    return statusMap[status] || { label: status, color: 'default', icon: <Info />, bgColor: '#9E9E9E' };
  };

  const filteredAffectations = affectations.filter(affectation => {
    const matchesSearch = affectation.superviseur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affectation.election_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || affectation.statut === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (mode, affectation = null) => {
    setDialogMode(mode);
    setSelectedAffectation(affectation);
    
    if (mode === 'edit' && affectation) {
      setFormData({
        superviseur_id: affectation.superviseur_id || '',
        election_id: affectation.election_id || '',
        date_affectation: affectation.date_affectation || new Date().toISOString().split('T')[0],
        statut: affectation.statut || 'actif',
        commentaire: affectation.commentaire || ''
      });
    } else {
      setFormData({
        superviseur_id: '',
        election_id: '',
        date_affectation: new Date().toISOString().split('T')[0],
        statut: 'actif',
        commentaire: ''
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAffectation(null);
    setFormData({
      superviseur_id: '',
      election_id: '',
      date_affectation: new Date().toISOString().split('T')[0],
      statut: 'actif',
      commentaire: ''
    });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.superviseur_id || !formData.election_id) {
        toast.error('Veuillez sélectionner un superviseur et une élection');
        return;
      }

      // Vérifier si l'affectation existe déjà
      const existingAffectation = affectations.find(
        a => a.superviseur_id === parseInt(formData.superviseur_id) && 
             a.election_id === parseInt(formData.election_id) &&
             a.id !== selectedAffectation?.id
      );

      if (existingAffectation) {
        toast.error('Cette affectation existe déjà');
        return;
      }

      if (dialogMode === 'create') {
        // Simuler la création (remplacez par votre logique API)
        const newAffectation = {
          id: Date.now(),
          ...formData,
          superviseur_id: parseInt(formData.superviseur_id),
          election_id: parseInt(formData.election_id),
          superviseur_nom: superviseurs.find(s => s.id === parseInt(formData.superviseur_id))?.nom || 'N/A',
          election_nom: elections.find(e => e.id === parseInt(formData.election_id))?.nom || 'N/A'
        };
        setAffectations([...affectations, newAffectation]);
        toast.success('Affectation créée avec succès');
      } else {
        // Simuler la modification (remplacez par votre logique API)
        const updatedAffectations = affectations.map(a => 
          a.id === selectedAffectation.id 
            ? { 
                ...a, 
                ...formData,
                superviseur_id: parseInt(formData.superviseur_id),
                election_id: parseInt(formData.election_id),
                superviseur_nom: superviseurs.find(s => s.id === parseInt(formData.superviseur_id))?.nom || 'N/A',
                election_nom: elections.find(e => e.id === parseInt(formData.election_id))?.nom || 'N/A'
              }
            : a
        );
        setAffectations(updatedAffectations);
        toast.success('Affectation modifiée avec succès');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (affectationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      try {
        // Simuler la suppression (remplacez par votre logique API)
        setAffectations(affectations.filter(a => a.id !== affectationId));
        toast.success('Affectation supprimée avec succès');
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getStatsData = () => {
    const total = affectations.length;
    const actifs = affectations.filter(a => a.statut === 'actif').length;
    const inactifs = affectations.filter(a => a.statut === 'inactif').length;
    const suspendus = affectations.filter(a => a.statut === 'suspendu').length;
    
    return { total, actifs, inactifs, suspendus };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="primary">
            Chargement des affectations...
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
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  mr: 2,
                }}
              >
                <AssignmentInd sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Affectation des Superviseurs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Assignez des superviseurs aux différentes élections
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={loadData}
                  sx={{
                    backgroundColor: alpha('#FF9800', 0.1),
                    '&:hover': { backgroundColor: alpha('#FF9800', 0.2) }
                  }}
                >
                  <Refresh sx={{ color: '#FF9800' }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<GroupAdd />}
                onClick={() => handleOpenDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                  }
                }}
              >
                Nouvelle Affectation
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
                    <AssignmentInd sx={{ fontSize: 40, opacity: 0.7 }} />
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
                        {stats.actifs}
                      </Typography>
                      <Typography variant="body2">Actifs</Typography>
                    </Box>
                    <Check sx={{ fontSize: 40, opacity: 0.7 }} />
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
                        {stats.inactifs}
                      </Typography>
                      <Typography variant="body2">Inactifs</Typography>
                    </Box>
                    <Cancel sx={{ fontSize: 40, opacity: 0.7 }} />
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
                        {stats.suspendus}
                      </Typography>
                      <Typography variant="body2">Suspendus</Typography>
                    </Box>
                    <Warning sx={{ fontSize: 40, opacity: 0.7 }} />
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
                    placeholder="Rechercher une affectation..."
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
                      <MenuItem value="suspendu">Suspendus</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Chip
                      label={`${filteredAffectations.length} affectation(s)`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${superviseurs.length} superviseurs`}
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

      {/* Tableau des affectations */}
      <Fade in timeout={700}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            {filteredAffectations.length === 0 ? (
              <Box py={8} textAlign="center">
                <AssignmentInd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || filterStatus !== 'all' ? 'Aucune affectation trouvée' : 'Aucune affectation'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm || filterStatus !== 'all'
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Créez votre première affectation pour commencer'
                  }
                </Typography>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<GroupAdd />}
                    onClick={() => handleOpenDialog('create')}
                  >
                    Créer une affectation
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#FF9800', 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Superviseur</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date d'affectation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAffectations.map((affectation) => {
                      const statusInfo = getStatusInfo(affectation.statut);
                      return (
                        <TableRow
                          key={affectation.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha('#FF9800', 0.02),
                            },
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                  mr: 2,
                                  fontSize: '1rem',
                                }}
                              >
                                <SupervisorAccount />
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {affectation.superviseur_nom}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ID: {affectation.superviseur_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <HowToVote sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {affectation.election_nom}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" display="flex" alignItems="center">
                              <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              {new Date(affectation.date_affectation).toLocaleDateString('fr-FR')}
                            </Typography>
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
                              {affectation.commentaire || 'Aucun commentaire'}
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
                                  onClick={() => handleOpenDialog('edit', affectation)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#F44336' }}
                                  onClick={() => handleDelete(affectation.id)}
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

      {/* Dialog pour créer/modifier une affectation */}
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
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                mr: 2,
              }}
            >
              {dialogMode === 'create' ? <GroupAdd /> : <Edit />}
            </Avatar>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Créer une affectation' : 'Modifier l\'affectation'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Superviseur</InputLabel>
                <Select
                  value={formData.superviseur_id}
                  onChange={(e) => setFormData({ ...formData, superviseur_id: e.target.value })}
                  input={<OutlinedInput label="Superviseur" />}
                  required
                >
                  {superviseurs.map((superviseur) => (
                    <MenuItem key={superviseur.id} value={superviseur.id}>
                      <Box display="flex" alignItems="center">
                        <SupervisorAccount sx={{ mr: 1 }} />
                        {superviseur.nom}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Élection</InputLabel>
                <Select
                  value={formData.election_id}
                  onChange={(e) => setFormData({ ...formData, election_id: e.target.value })}
                  input={<OutlinedInput label="Élection" />}
                  required
                >
                  {elections.map((election) => (
                    <MenuItem key={election.id} value={election.id}>
                      <Box display="flex" alignItems="center">
                        <HowToVote sx={{ mr: 1 }} />
                        {election.nom}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'affectation"
                type="date"
                value={formData.date_affectation}
                onChange={(e) => setFormData({ ...formData, date_affectation: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
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
                  <MenuItem value="suspendu">Suspendu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                multiline
                rows={3}
                placeholder="Ajoutez un commentaire sur cette affectation..."
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
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
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

export default AffectationSuperviseur;
