// frontend/src/App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Services
import { authService } from './services/api';

// Composants d'authentification
import Login from './ElecteurPanel/Login';
import Register from './ElecteurPanel/Register';
import ProtectedRoute from './components/common/ProtectedRoute';

// Composants Électeur
import ElecteurDashboard from './ElecteurPanel/ElecteurDashboard';
import VotePage from './pages/VotePage';
import CandidaturePage from './ElecteurPanel/PostulerCandidat';

// Composants Admin
import AdminDashboard from './pages/AdminDashboard';
import ElectionManagement from './pages/ElectionList';
import CandidatManagement from './pages/CandidatList';
import DepartementManagement from './pages/DepartementList';
import PosteManagement from './pages/PosteList';
import ElecteurManagement from './pages/ElecteurList';

// Composants Superviseur
import SuperviseurDashboard from './components/superviseur/SuperviseurDashboard';
import SuperviseurSupervision from './components/superviseur/SuperviseurSupervision';
import SuperviseurCandidatures from './components/superviseur/SuperviseurCandidatures';

// Composants communs
import Navbar from './components/common/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';

// Composants élections
import ElectionCandidats from './pages/ElectionCandidats';
import ElectionResults from './pages/ElectionResults';

// Context pour l'authentification
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Thème Material-UI Moderne
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E73F8', // Bleu moderne
      light: '#5EAAFF',
      dark: '#1E3A8A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6B35', // Orange vibrant
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00C853',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#FFB300',
      light: '#FFC107',
      dark: '#F57F17',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#C62828',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#718096',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2E73F8 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
          boxShadow: '0px 4px 20px rgba(46, 115, 248, 0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
          color: 'white',
        },
        colorWarning: {
          background: 'linear-gradient(135deg, #FFB300 0%, #FFC107 100%)',
          color: 'white',
        },
        colorError: {
          background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
          color: 'white',
        },
      },
    },
  },
});

// Composant de chargement amélioré
const LoadingScreen = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    sx={{
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
    }}
  >
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4}
        sx={{
          color: '#2E73F8',
          animationDuration: '550ms',
        }}
      />
    </Box>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        ElectionDapp
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Chargement en cours...
      </Typography>
    </Box>
  </Box>
);

// Provider d'authentification
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔍 Initialisation de l\'authentification...');
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token trouvé:', !!token);
      
      if (token) {
        // Vérifier si le token est encore valide
        console.log('🔍 Vérification du token...');
        const response = await authService.verifyToken();
        console.log('📊 Réponse vérification token:', response);
        
        if (response.success) {
          console.log('✅ Token valide, utilisateur connecté:', response.user);
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Token invalide, nettoyage...');
          // Token invalide
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } else {
        console.log('❌ Aucun token trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
      // Nettoyer en cas d'erreur
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      console.log('✅ Fin initialisation auth, loading = false');
      setLoading(false);
    }
  };

  const login = async (email, password, userType) => {
    try {
      const response = await authService.login(email, password, userType);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Composant principal de l'application
const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <Box sx={{ flexGrow: 1 }}>
          {isAuthenticated && <Navbar />}
          
          <Routes>
            {/* Routes publiques */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? <Login /> : (
                  <Navigate to={
                    user?.type === 'admin' ? '/admin' : 
                    user?.type === 'superviseur' ? '/superviseur' : 
                    '/electeur'
                  } replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? <Register /> : (
                  <Navigate to={
                    user?.type === 'admin' ? '/admin' : 
                    user?.type === 'superviseur' ? '/superviseur' : 
                    '/electeur'
                  } replace />
                )
              } 
            />

            {/* Redirection racine */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to={
                    user?.type === 'admin' ? '/admin' : 
                    user?.type === 'superviseur' ? '/superviseur' : 
                    '/electeur'
                  } replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Routes Électeur */}
            <Route path="/electeur" element={<ProtectedRoute allowedRoles={['electeur']} />}>
              <Route index element={<ElecteurDashboard />} />
              <Route path="vote/:electionId" element={<VotePage />} />
              <Route path="candidature" element={<CandidaturePage />} />
            </Route>

            {/* Routes Superviseur */}
            <Route path="/superviseur" element={<ProtectedRoute allowedRoles={['superviseur']} />}>
              <Route index element={<SuperviseurDashboard />} />
              <Route path="supervision" element={<SuperviseurSupervision />} />
              <Route path="candidatures" element={<SuperviseurCandidatures />} />
            </Route>

            {/* Routes Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="elections" element={<ElectionManagement />} />
              <Route path="candidats" element={<CandidatManagement />} />
              <Route path="electeurs" element={<ElecteurManagement />} />
              <Route path="departements" element={<DepartementManagement />} />
              <Route path="postes" element={<PosteManagement />} />
            </Route>

            {/* Routes publiques pour les élections */}
            <Route path="/elections/:id/candidats" element={<ElectionCandidats />} />
            <Route path="/elections/:id/resultats" element={<ElectionResults />} />

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </ErrorBoundary>
    </Router>
  );
};

// Composant App principal
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
