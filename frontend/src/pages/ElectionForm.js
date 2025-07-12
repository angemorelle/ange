import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fade,
  Zoom,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  HowToVote,
  Schedule,
  Person,
  Refresh,
  Search,
  FilterList,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';

const ElectionForm = () => {
  const [elections, setElections] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [form, setForm] = useState({
    nom: '',
    description: '',
    date_ouverture: '',
    date_fermeture: '',
    poste_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [electionsRes, postesRes] = await Promise.all([
        adminService.getElections(),
        adminService.getPostes()
      ]);
      
      if (electionsRes.success) setElections(electionsRes.data);
      if (postesRes.success) setPostes(postesRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nom || !form.date_ouverture || !form.date_fermeture || !form.poste_id) {
      toast.error('Tous les champs obligatoires doivent être remplis');
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.createElection(form);
      
      if (response.success) {
        toast.success('Élection créée avec succès !');
        setForm({
          nom: '',
          description: '',
          date_ouverture: '',
          date_fermeture: '',
          poste_id: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Erreur création élection:', error);
      toast.error('Erreur lors de la création de l\'élection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (election) => {
    setSelectedElection(election);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await adminService.deleteElection(selectedElection.id);
      if (response.success) {
        toast.success('Élection supprimée avec succès');
        loadData();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedElection(null);
    }
  };

  const getStatusChip = (election) => {
    const now = new Date();
    const ouverture = new Date(election.date_ouverture);
    const fermeture = new Date(election.date_fermeture);

    if (now < ouverture) {
      return <Chip label="Programmée" color="warning" icon={<Schedule />} size="small" />;
    } else if (now >= ouverture && now <= fermeture) {
      return <Chip label="Ouverte" color="success" icon={<CheckCircle />} size="small" />;
    } else {
      return <Chip label="Fermée" color="error" icon={<ErrorIcon />} size="small" />;
    }
  };

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const now = new Date();
    const ouverture = new Date(election.date_ouverture);
    const fermeture = new Date(election.date_fermeture);
    
    const status = now < ouverture ? 'programmee' : 
                  (now >= ouverture && now <= fermeture) ? 'ouverte' : 'fermee';
    
    return matchesSearch && status === filterStatus;
  });

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
          <Box display="flex" alignItems="center" mb={2}>
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
              <Typography variant="h6" color="text.secondary">
                Créez et gérez les élections de votre organisation
              </Typography>
            </Box>
            <Box flexGrow={1} />
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
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Formulaire de création */}
        <Grid item xs={12} lg={5}>
          <Zoom in timeout={700}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
                border: '1px solid',
                borderColor: alpha('#E2E8F0', 0.5),
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Nouvelle Élection
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nom de l'élection"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date d'ouverture"
                        type="datetime-local"
                        value={form.date_ouverture}
                        onChange={(e) => setForm({ ...form, date_ouverture: e.target.value })}
                        required
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date de fermeture"
                        type="datetime-local"
                        value={form.date_fermeture}
                        onChange={(e) => setForm({ ...form, date_fermeture: e.target.value })}
                        required
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Poste à pourvoir</InputLabel>
                        <Select
                          value={form.poste_id}
                          onChange={(e) => setForm({ ...form, poste_id: e.target.value })}
                          label="Poste à pourvoir"
                          required
                          sx={{ borderRadius: 2 }}
                        >
                          {postes.map((poste) => (
                            <MenuItem key={poste.id} value={poste.id}>
                              <Box display="flex" alignItems="center">
                                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                {poste.nom}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        startIcon={submitting ? null : <Add />}
                        sx={{
                          py: 2,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4CAF50 0%, #00C853 100%)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        {submitting ? 'Création en cours...' : 'Créer l\'élection'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Liste des élections */}
        <Grid item xs={12} lg={7}>
          <Fade in timeout={900}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
                border: '1px solid',
                borderColor: alpha('#E2E8F0', 0.5),
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Header de la liste */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Élections ({filteredElections.length})
                  </Typography>
                  
                  <Box display="flex" gap={2}>
                    <TextField
                      size="small"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{
                        width: 200,
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Statut"
                        startAdornment={<FilterList />}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">Tous</MenuItem>
                        <MenuItem value="programmee">Programmées</MenuItem>
                        <MenuItem value="ouverte">Ouvertes</MenuItem>
                        <MenuItem value="fermee">Fermées</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Table des élections */}
                {filteredElections.length === 0 ? (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      borderRadius: 3,
                      backgroundColor: alpha('#2196F3', 0.05),
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Aucune élection trouvée
                    </Typography>
                    <Typography variant="body2">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Aucune élection ne correspond à vos critères de recherche.'
                        : 'Créez votre première élection en utilisant le formulaire.'}
                    </Typography>
                  </Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha('#2E73F8', 0.05) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Élection</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Poste</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredElections.map((election) => (
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
                                icon={<Person />}
                              />
                            </TableCell>
                            <TableCell>
                              {getStatusChip(election)}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#2E73F8',
                                    '&:hover': { backgroundColor: alpha('#2E73F8', 0.1) }
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(election)}
                                  sx={{
                                    color: '#F44336',
                                    '&:hover': { backgroundColor: alpha('#F44336', 0.1) }
                                  }}
                                >
                                  <Delete />
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
        </Grid>
      </Grid>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible !
          </Alert>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'élection "{selectedElection?.nom}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ 
              textTransform: 'none',
              background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ElectionForm;
