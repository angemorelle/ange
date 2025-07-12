import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Fade,
  Zoom,
  alpha,
  useTheme,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  HowToVote,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  AdminPanelSettings,
  Email,
  SupervisorAccount
} from '@mui/icons-material';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('electeur');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      
      const response = await login(email, password, userType);
      
      if (response.success) {
        setIsError(false);
        setMessage(`Connexion réussie en tant que ${userType}`);
        
        // Redirection selon le type d'utilisateur
        const redirectPath = userType === 'admin' ? '/admin' : 
                             userType === 'superviseur' ? '/superviseur' : 
                             '/electeur';
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || error.response?.data?.error || 'Email ou mot de passe invalide');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = () => {
    switch(userType) {
      case 'admin':
        return <AdminPanelSettings sx={{ color: '#9C27B0', fontSize: '1.5rem' }} />;
      case 'superviseur':
        return <SupervisorAccount sx={{ color: '#FF6B35', fontSize: '1.5rem' }} />;
      default:
        return <Person sx={{ color: '#2E73F8', fontSize: '1.5rem' }} />;
    }
  };

  const getUserTypeColor = () => {
    switch(userType) {
      case 'admin':
        return '#9C27B0';
      case 'superviseur':
        return '#FF6B35';
      default:
        return '#2E73F8';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha('#2E73F8', 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha('#FF6B35', 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha('#00C853', 0.2)} 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }}
    >
      {/* Header moderne */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Container maxWidth="lg">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              py={3}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
                }}
              >
                <HowToVote sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #FFFFFF 30%, rgba(255,255,255,0.8) 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                ElectionDapp
              </Typography>
            </Box>
          </Container>
        </Paper>
      </Fade>

      {/* Contenu principal */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Zoom in timeout={1000}>
          <Card
            sx={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${getUserTypeColor()} 0%, #FF6B35 100%)`,
              }
            }}
          >
            <CardContent sx={{ p: 5 }}>
              {/* En-tête du formulaire */}
              <Box textAlign="center" mb={4}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getUserTypeColor()} 0%, ${alpha(getUserTypeColor(), 0.7)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: `0 12px 24px ${alpha(getUserTypeColor(), 0.3)}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {userType === 'admin' ? 
                    <AdminPanelSettings sx={{ color: 'white', fontSize: '2rem' }} /> :
                    userType === 'superviseur' ?
                    <SupervisorAccount sx={{ color: 'white', fontSize: '2rem' }} /> :
                    <Person sx={{ color: 'white', fontSize: '2rem' }} />
                  }
                </Box>
                <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
                  Connexion
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Accédez à votre espace {userType === 'admin' ? 'administrateur' : 'électeur'}
                </Typography>
              </Box>

              {/* Message d'alerte */}
              {message && (
                <Fade in>
                  <Alert 
                    severity={isError ? 'error' : 'success'} 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                      }
                    }}
                  >
                    {message}
                  </Alert>
                </Fade>
              )}

              {/* Formulaire */}
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Sélection du type d'utilisateur */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Type d'utilisateur</InputLabel>
                      <Select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        label="Type d'utilisateur"
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: getUserTypeColor(),
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: getUserTypeColor(),
                            },
                          },
                        }}
                      >
                        <MenuItem value="electeur">
                          <Box display="flex" alignItems="center" width="100%">
                            <Person sx={{ mr: 2, color: '#2E73F8', fontSize: '1.25rem' }} />
                            <Typography variant="body1">Électeur</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="superviseur">
                          <Box display="flex" alignItems="center" width="100%">
                            <SupervisorAccount sx={{ mr: 2, color: '#FF6B35', fontSize: '1.25rem' }} />
                            <Typography variant="body1">Superviseur</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="admin">
                          <Box display="flex" alignItems="center" width="100%">
                            <AdminPanelSettings sx={{ mr: 2, color: '#9C27B0', fontSize: '1.25rem' }} />
                            <Typography variant="body1">Administrateur</Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: getUserTypeColor(),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: getUserTypeColor(),
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Mot de passe */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: getUserTypeColor(),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: getUserTypeColor(),
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Bouton de connexion */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? null : <LoginIcon />}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${getUserTypeColor()} 0%, ${alpha(getUserTypeColor(), 0.8)} 100%)`,
                        boxShadow: `0 8px 25px ${alpha(getUserTypeColor(), 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 30px ${alpha(getUserTypeColor(), 0.4)}`,
                          background: `linear-gradient(135deg, ${alpha(getUserTypeColor(), 0.9)} 0%, ${getUserTypeColor()} 100%)`,
                        },
                        '&:disabled': {
                          background: alpha(getUserTypeColor(), 0.6),
                        },
                      }}
                    >
                      {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Info supplémentaire */}
              <Box mt={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Besoin d'aide ? Contactez l'administrateur système
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Zoom>
      </Container>

      {/* Footer moderne */}
      <Fade in timeout={1200}>
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Container maxWidth="lg">
            <Box py={3} textAlign="center">
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                }}
              >
                © {new Date().getFullYear()} ElectionDapp - Plateforme de vote électronique sécurisée
              </Typography>
            </Box>
          </Container>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
