// frontend/src/App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Services
import { authService } from './services/api';

// Composants d'authentification
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';

// Composants Électeur
import ElecteurDashboard from './components/electeur/Dashboard';
import VotingPage from './components/electeur/VotingPage';
import CandidaturePage from './components/electeur/CandidaturePage';

// Composants Admin
import AdminDashboard from './components/admin/Dashboard';
import ElectionManagement from './components/admin/ElectionManagement';
import CandidatManagement from './components/admin/CandidatManagement';
import DepartementManagement from './components/admin/DepartementManagement';
import PosteManagement from './components/admin/PosteManagement';
import ElecteurManagement from './components/admin/ElecteurManagement';

// Composants communs
import Navbar from './components/common/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';

// Context pour l'authentification
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Thème Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#f5325b',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Composant de chargement
const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress size={60} />
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
      const token = localStorage.getItem('authToken');
      if (token) {
        // Vérifier si le token est encore valide
        const response = await authService.verifyToken();
        if (response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          // Token invalide
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
      // Nettoyer en cas d'erreur
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
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
                  <Navigate to={user?.type === 'admin' ? '/admin' : '/electeur'} replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? <Register /> : (
                  <Navigate to={user?.type === 'admin' ? '/admin' : '/electeur'} replace />
                )
              } 
            />

            {/* Redirection racine */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to={user?.type === 'admin' ? '/admin' : '/electeur'} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Routes Électeur */}
            <Route path="/electeur" element={<ProtectedRoute allowedRoles={['electeur']} />}>
              <Route index element={<ElecteurDashboard />} />
              <Route path="vote/:electionId" element={<VotingPage />} />
              <Route path="candidature" element={<CandidaturePage />} />
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
