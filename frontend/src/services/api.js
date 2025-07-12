// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Configuration de base d'axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expirée, veuillez vous reconnecter');
      return Promise.reject(error);
    }

    // Gestion des erreurs de validation
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error || 'Erreur de validation';
      toast.error(errorMessage);
    }

    // Gestion des erreurs serveur
    if (error.response?.status >= 500) {
      toast.error('Erreur serveur, veuillez réessayer plus tard');
    }

    // Gestion des erreurs réseau
    if (!error.response) {
      toast.error('Erreur de connexion au serveur');
    }

    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  async login(email, password, userType) {
    try {
      const response = await api.post('/auth/login', {
        email,
        pwd: password,
        userType
      });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Connexion réussie');
        return response.data;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        toast.success('Inscription réussie');
        return response.data;
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      // Nettoyer quand même le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return {
        success: true,
        user: response.data.user || response.data
      };
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

// Services pour les élections
export const electionService = {
  async getElections(params = {}) {
    try {
      const response = await api.get('/elections', { params });
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération élections:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getElection(id) {
    try {
      const response = await api.get(`/elections/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur récupération élection:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async createElection(electionData) {
    try {
      const response = await api.post('/elections', electionData);
      if (response.data.success) {
        toast.success('Élection créée avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur création élection:', error);
      throw error;
    }
  },

  async updateElection(id, electionData) {
    try {
      const response = await api.put(`/elections/${id}`, electionData);
      if (response.data.success) {
        toast.success('Élection modifiée avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur modification élection:', error);
      throw error;
    }
  },

  async deleteElection(id) {
    try {
      const response = await api.delete(`/elections/${id}`);
      if (response.data.success) {
        toast.success('Élection supprimée avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur suppression élection:', error);
      throw error;
    }
  },

  async getElectionResults(id) {
    try {
      const response = await api.get(`/elections/${id}/resultats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur récupération résultats:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  }
};

// Services pour les électeurs
export const electeurService = {
  async getDashboard() {
    try {
      const response = await api.get('/electeur/dashboard');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async getElections() {
    try {
      const response = await api.get('/elections');
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération élections:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getCandidatures() {
    try {
      // Récupérer les candidatures de l'électeur connecté
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.id) {
        console.warn('Utilisateur non connecté ou ID manquant');
        return {
          success: true,
          data: []
        };
      }
      
      const response = await api.get('/candidats');
      const allCandidats = Array.isArray(response.data.data) ? response.data.data : [];
      
      // Filtrer les candidatures de l'électeur connecté
      const mesCandidatures = allCandidats.filter(candidat => 
        candidat.electeur_id === user.id
      );
      
      return {
        success: true,
        data: mesCandidatures
      };
    } catch (error) {
      console.error('Erreur récupération candidatures:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async voterElection(electionId) {
    try {
      // Simulation de vote - à remplacer par l'endpoint réel
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simule un appel réseau
      
      console.log(`Vote simulé pour l'élection ${electionId}`);
      
      return {
        success: true,
        data: {
          message: `Vote enregistré pour l'élection ${electionId}`,
          electionId: electionId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Erreur vote élection:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async postulerCandidat(electionId) {
    try {
      // Simulation de candidature - à remplacer par l'endpoint réel
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simule un appel réseau
      
      console.log(`Candidature simulée pour l'élection ${electionId}`);
      
      return {
        success: true,
        data: {
          message: `Candidature soumise pour l'élection ${electionId}`,
          electionId: electionId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Erreur candidature élection:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async getElectionForVoting(electionId) {
    try {
      const response = await api.get(`/electeur/election/${electionId}/voter`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur récupération élection pour vote:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async submitCandidature(candidatureData) {
    try {
      const response = await api.post('/electeur/candidature', candidatureData);
      if (response.data.success) {
        toast.success('Candidature soumise avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur soumission candidature:', error);
      throw error;
    }
  },

  async getVoteHistory(params = {}) {
    try {
      const response = await api.get('/electeur/historique-votes', { params });
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } catch (error) {
      console.error('Erreur récupération historique votes:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  // === GESTION BLOCKCHAIN ===
  async getBlockchainInfo() {
    try {
      console.log('🔗 Appel API: /electeur/blockchain-info');
      const response = await api.get('/electeur/blockchain-info');
      console.log('🔗 Réponse brute API:', response.data);
      
      // Le backend retourne déjà { success: true, data: {...} }
      // Donc on retourne directement response.data
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération infos blockchain:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async generateBlockchainAddress() {
    try {
      console.log('🔗 Appel API: /electeur/generate-blockchain-address');
      const response = await api.post('/electeur/generate-blockchain-address');
      console.log('🔗 Réponse génération adresse:', response.data);
      
      if (response.data.success) {
        toast.success('Adresse blockchain générée avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('❌ Erreur génération adresse blockchain:', error);
      throw error;
    }
  },

  // === GESTION DES VOTES ===
  async submitVote(voteData) {
    try {
      const response = await api.post('/vote/submit', voteData);
      if (response.data.success) {
        toast.success('Vote enregistré avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur soumission vote:', error);
      throw error;
    }
  },

  async checkIfVoted(electionId) {
    try {
      const response = await api.get(`/vote/check/${electionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur vérification vote:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async getCandidatesForVoting(electionId) {
    try {
      const response = await api.get(`/vote/candidates/${electionId}`);
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } catch (error) {
      console.error('Erreur récupération candidats pour vote:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  }
};

// Services blockchain
export const blockchainService = {
  async vote(voteData) {
    try {
      const response = await api.post('/blockchain/vote', voteData);
      if (response.data.success) {
        toast.success('Vote enregistré avec succès sur la blockchain');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur vote blockchain:', error);
      throw error;
    }
  },

  async syncElection(electionId) {
    try {
      const response = await api.post(`/blockchain/sync/election/${electionId}`);
      if (response.data.success) {
        toast.success('Élection synchronisée avec la blockchain');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur sync élection:', error);
      throw error;
    }
  },

  async getSyncStatus() {
    try {
      const response = await api.get('/blockchain/sync/status');
      return response.data;
    } catch (error) {
      console.error('Erreur statut sync:', error);
      throw error;
    }
  }
};

// Services génériques pour les autres entités
export const adminService = {
  async getDepartements() {
    try {
      const response = await api.get('/departements');
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération départements:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getPostes() {
    try {
      const response = await api.get('/postes');
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération postes:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getCandidats(params = {}) {
    try {
      const response = await api.get('/candidats', { params });
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération candidats:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getElecteurs(params = {}) {
    try {
      const response = await api.get('/electeurs', { params });
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération électeurs:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getElections(params = {}) {
    try {
      const response = await api.get('/elections', { params });
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération élections:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async addElecteur(electeurData) {
    try {
      const response = await api.post('/electeurs', electeurData);
      if (response.data.message) {
        toast.success('Électeur ajouté avec succès');
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur ajout électeur:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  async deleteElecteur(electeurId) {
    try {
      const response = await api.delete(`/electeurs/${electeurId}`);
      if (response.data.message) {
        toast.success('Électeur supprimé avec succès');
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur suppression électeur:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  async updateCandidatStatus(candidatId, status) {
    try {
      const response = await api.put(`/candidats/${candidatId}/status`, { statut: status });
      if (response.data.success) {
        toast.success('Statut du candidat mis à jour');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour statut candidat:', error);
      throw error;
    }
  },

  async getSuperviseurs(params = {}) {
    try {
      const response = await api.get('/superviseurs', { params });
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    } catch (error) {
      console.error('Erreur récupération superviseurs:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async addSuperviseur(superviseurData) {
    try {
      const response = await api.post('/superviseurs', superviseurData);
      if (response.data.message) {
        toast.success('Superviseur ajouté avec succès');
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur ajout superviseur:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  async deleteSuperviseur(superviseurId) {
    try {
      const response = await api.delete(`/superviseurs/${superviseurId}`);
      if (response.data.message) {
        toast.success('Superviseur supprimé avec succès');
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur suppression superviseur:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  async addDepartement(departementData) {
    try {
      const response = await api.post('/departements', departementData);
      if (response.data.message) {
        toast.success('Département ajouté avec succès');
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur ajout département:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  async deleteDepartement(departementId) {
    try {
      const response = await api.delete(`/departements/${departementId}`);
      if (response.data.message) {
        toast.success('Département supprimé avec succès');
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur suppression département:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
};

// Services pour les statistiques
export const statisticsService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/statistics/dashboard');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur récupération statistiques dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null
      };
    }
  },

  async getStatsByPeriod(days = 30) {
    try {
      const response = await api.get(`/statistics/dashboard/period/${days}`);
      return {
        success: true,
        data: response.data.data,
        period: response.data.period
      };
    } catch (error) {
      console.error('Erreur récupération statistiques période:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getTopDepartements() {
    try {
      const response = await api.get('/statistics/departements/top');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur récupération top départements:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  },

  async getCurrentElections() {
    try {
      const response = await api.get('/statistics/elections/current');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur récupération élections en cours:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: []
      };
    }
  }
};

// Fonction utilitaire pour gérer les téléchargements
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    toast.error('Erreur lors du téléchargement');
  }
};

export default api; 