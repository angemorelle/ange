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
      return response.data;
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      throw error;
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
      return response.data;
    } catch (error) {
      console.error('Erreur récupération élections:', error);
      throw error;
    }
  },

  async getElection(id) {
    try {
      const response = await api.get(`/elections/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération élection:', error);
      throw error;
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
      return response.data;
    } catch (error) {
      console.error('Erreur récupération résultats:', error);
      throw error;
    }
  }
};

// Services pour les électeurs
export const electeurService = {
  async getDashboard() {
    try {
      const response = await api.get('/electeur/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      throw error;
    }
  },

  async getElectionForVoting(electionId) {
    try {
      const response = await api.get(`/electeur/election/${electionId}/voter`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération élection pour vote:', error);
      throw error;
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
      return response.data;
    } catch (error) {
      console.error('Erreur récupération historique votes:', error);
      throw error;
    }
  },

  // === GESTION BLOCKCHAIN ===
  async getBlockchainInfo() {
    try {
      const response = await api.get('/electeur/dashboard/blockchain-info');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération infos blockchain:', error);
      throw error;
    }
  },

  async generateBlockchainAddress() {
    try {
      const response = await api.post('/electeur/dashboard/generate-blockchain-address');
      if (response.data.success) {
        toast.success('Adresse blockchain générée avec succès');
      }
      return response.data;
    } catch (error) {
      console.error('Erreur génération adresse blockchain:', error);
      throw error;
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
      return response.data;
    } catch (error) {
      console.error('Erreur récupération départements:', error);
      throw error;
    }
  },

  async getPostes() {
    try {
      const response = await api.get('/postes');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération postes:', error);
      throw error;
    }
  },

  async getCandidats(params = {}) {
    try {
      const response = await api.get('/candidats', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération candidats:', error);
      throw error;
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