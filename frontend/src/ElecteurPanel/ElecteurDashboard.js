// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const ElecteurDashboard = () => {
//   const [elections, setElections] = useState([]);
//   const electeur = JSON.parse(localStorage.getItem("user")); // récupère l’électeur connecté

//   useEffect(() => {
//     axios.get("http://localhost:3001/api/elections")
//       .then(res => setElections(res.data))
//       .catch(err => console.error("Erreur chargement élections :", err));
//   }, []);

//   const postuler = async (elections_id) => {
//     const programme = prompt("Entrez votre programme électoral :");
//     if (!programme) return;

//     try {
//       await axios.post("http://localhost:3001/api/candidats", {
//         electeur_id: electeur.id,
//         elections_id,
//         programme
//       });
//       alert("Candidature enregistrée !");
//     } catch (err) {
//       alert("Erreur : déjà candidat ou autre problème.");
//     }
//   };

//   const voter = async (elections_id) => {
//     try {
//       await axios.post("http://localhost:3001/api/bulletins", {
//         electeur_id: electeur.id,
//         elections_id
//       });
//       alert("Vote enregistré !");
//     } catch (err) {
//       alert("Erreur : déjà voté ou élection non ouverte.");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Bienvenue, {electeur.nom}</h2>
      
//       <a
//         href={`/electeur/edit/${electeur.id}`}
//         className="bg-yellow-500 text-white px-4 py-2 rounded mb-6 inline-block"
//       >
//         Modifier mes informations
//       </a>

//       <h3 className="text-lg font-semibold mt-4">Élections disponibles</h3>
//       <table className="w-full mt-4 border text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 border">Nom</th>
//             <th className="p-2 border">Statut</th>
//             <th className="p-2 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {elections.map(e => (
//             <tr key={e.id} className="text-center">
//               <td className="border p-2">{e.nom}</td>
//               <td className="border p-2">{e.status}</td>
//               <td className="border p-2 space-x-2">
//                 <button
//                   onClick={() => postuler(e.id)}
//                   className="bg-green-600 text-white px-2 py-1 rounded"
//                 >
//                   Postuler
//                 </button>
//                 <a
//                   href={`/elections/${e.id}/candidats`}
//                   className="bg-blue-500 text-white px-2 py-1 rounded"
//                 >
//                   Candidats
//                 </a>
//                 {e.status === "ouverte" && (
//                   <button
//                     onClick={() => voter(e.id)}
//                     className="bg-purple-600 text-white px-2 py-1 rounded"
//                   >
//                     Voter
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ElecteurDashboard;


import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person,
  HowToVote,
  Assignment,
  Visibility
} from '@mui/icons-material';
import { electeurService } from '../services/api';
import BlockchainInfo from '../components/electeur/BlockchainInfo';
import { toast } from 'react-toastify';

const ElecteurDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");
  const electeur = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await electeurService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Impossible de charger le tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidature = async (electionId) => {
    const programme = prompt("Entrez votre programme électoral :");
    if (!programme) return;

    try {
      await electeurService.submitCandidature({
        election_id: electionId,
        programme
      });
    } catch (error) {
      console.error('Erreur soumission candidature:', error);
    }
  };

  if (!electeur) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Vous devez être connecté pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* En-tête de bienvenue */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bienvenue, {electeur.nom}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tableau de bord électeur - Gérez vos participations électorales
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informations Blockchain */}
        <Grid item xs={12} lg={6}>
          <BlockchainInfo />
        </Grid>

        {/* Statistiques rapides */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mes Statistiques
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {dashboardData?.statistics?.total_votes || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Votes effectués
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {dashboardData?.statistics?.total_candidatures || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Candidatures
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Élections disponibles */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HowToVote sx={{ mr: 1, verticalAlign: 'middle' }} />
                Élections Disponibles
              </Typography>
              
              {dashboardData?.elections?.length === 0 ? (
                <Alert severity="info">
                  Aucune élection disponible pour le moment.
                </Alert>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {dashboardData?.elections?.map((election) => (
                    <Grid item xs={12} md={6} key={election.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {election.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {election.description}
                          </Typography>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Chip
                              label={election.status}
                              color={
                                election.status === 'ouverte' ? 'success' :
                                election.status === 'programmee' ? 'warning' : 'default'
                              }
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {election.date_ouverture && new Date(election.date_ouverture).toLocaleDateString('fr-FR')}
                            </Typography>
                          </Box>

                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              startIcon={<Assignment />}
                              onClick={() => handleCandidature(election.id)}
                              variant="outlined"
                              color="primary"
                            >
                              Candidater
                            </Button>
                            
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              href={`/elections/${election.id}/candidats`}
                              variant="outlined"
                            >
                              Voir candidats
                            </Button>
                            
                            {election.status === 'ouverte' && (
                              <Button
                                size="small"
                                startIcon={<HowToVote />}
                                href={`/elections/${election.id}/voter`}
                                variant="contained"
                                color="primary"
                              >
                                Voter
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Historique des votes récents */}
        {dashboardData?.recent_votes?.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Votes Récents
                </Typography>
                {dashboardData.recent_votes.map((vote, index) => (
                  <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                    <Typography variant="body2">
                      {vote.election_nom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(vote.date_vote).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ElecteurDashboard;
