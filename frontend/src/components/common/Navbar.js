// frontend/src/components/common/Navbar.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Badge,
  Chip,
  Fade,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  HowToVote,
  Person,
  ExitToApp,
  Settings,
  People,
  Assignment,
  LocationOn,
  Work,
  Notifications,
  AccountBalanceWallet,
  Close
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Configuration des menus selon le type d'utilisateur
  const getMenuItems = () => {
    if (user?.type === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin', icon: <Dashboard />, color: '#2E73F8' },
        { label: 'Élections', path: '/admin/elections', icon: <HowToVote />, color: '#00C853' },
        { label: 'Candidats', path: '/admin/candidats', icon: <Person />, color: '#FF6B35' },
        { label: 'Électeurs', path: '/admin/electeurs', icon: <People />, color: '#9C27B0' },
        { label: 'Départements', path: '/admin/departements', icon: <LocationOn />, color: '#FF9800' },
        { label: 'Postes', path: '/admin/postes', icon: <Work />, color: '#607D8B' },
      ];
    } else if (user?.type === 'superviseur') {
      return [
        { label: 'Dashboard', path: '/superviseur', icon: <Dashboard />, color: '#FF6B35' },
        { label: 'Supervision', path: '/superviseur/supervision', icon: <HowToVote />, color: '#00C853' },
        { label: 'Candidatures', path: '/superviseur/candidatures', icon: <Assignment />, color: '#9C27B0' },
      ];
    } else {
      return [
        { label: 'Dashboard', path: '/electeur', icon: <Dashboard />, color: '#2E73F8' },
        { label: 'Candidature', path: '/electeur/candidature', icon: <Assignment />, color: '#FF6B35' },
      ];
    }
  };

  const menuItems = getMenuItems();

  // Titre de l'application selon le type d'utilisateur
  const getAppTitle = () => {
    if (user?.type === 'admin') {
      return 'ElectionDapp Admin';
    } else if (user?.type === 'superviseur') {
      return 'ElectionDapp Superviseur';
    } else {
      return 'ElectionDapp';
    }
  };

  // Avatar avec gradient
  const UserAvatar = ({ size = 40 }) => (
    <Avatar 
      sx={{ 
        width: size, 
        height: size, 
        background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
        fontSize: size === 32 ? '0.9rem' : '1rem',
        fontWeight: 600,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
        }
      }}
    >
      {user?.nom?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
    </Avatar>
  );

  // Drawer moderne pour mobile
  const drawer = (
    <Box 
      sx={{ 
        width: 280,
        height: '100%',
        background: 'linear-gradient(145deg, #F8FAFC 0%, #E2E8F0 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header du drawer */}
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <UserAvatar size={48} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {user?.nom || 'Utilisateur'}
            </Typography>
            <Chip
              label={
                user?.type === 'admin' ? 'Administrateur' : 
                user?.type === 'superviseur' ? 'Superviseur' : 
                'Électeur'
              }
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 3 }}>
        {menuItems.map((item, index) => (
          <ListItem 
            button 
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                backgroundColor: alpha(item.color, 0.1),
                borderLeft: `4px solid ${item.color}`,
                '& .MuiListItemIcon-root': {
                  color: item.color,
                },
                '& .MuiListItemText-primary': {
                  color: item.color,
                  fontWeight: 600,
                }
              },
              '&:hover': {
                backgroundColor: alpha(item.color, 0.05),
                transform: 'translateX(4px)',
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? item.color : 'text.secondary',
                transition: 'color 0.2s ease'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
        <Button
          fullWidth
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha('#F44336', 0.1),
              color: '#F44336'
            }
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2E73F8 0%, #1E3A8A 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Menu hamburger pour mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo et titre */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => handleNavigation(
              user?.type === 'admin' ? '/admin' : 
              user?.type === 'superviseur' ? '/superviseur' : 
              '/electeur'
            )}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(5deg) scale(1.05)'
                }
              }}
            >
              <HowToVote sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                background: 'linear-gradient(45deg, #FFFFFF 30%, #E3F2FD 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {getAppTitle()}
            </Typography>
          </Box>

          {/* Menu navigation desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', mr: 3, gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 'auto',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    backgroundColor: location.pathname === item.path 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'transparent',
                    backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {!isMobile ? item.label : ''}
                </Button>
              ))}
            </Box>
          )}

          {/* Section utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications */}
            <IconButton
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Badge badgeContent={3} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Wallet (pour électeurs uniquement) */}
            {user?.type === 'electeur' && (
              <IconButton
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <AccountBalanceWallet />
              </IconButton>
            )}

            {/* Menu utilisateur */}
            <Button
              color="inherit"
              onClick={handleUserMenuOpen}
              startIcon={<UserAvatar size={32} />}
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {!isMobile && (
                <Box sx={{ ml: 1, textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.nom || user?.email}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {user?.type === 'admin' ? 'Admin' : 
                     user?.type === 'superviseur' ? 'Superviseur' : 
                     'Électeur'}
                  </Typography>
                </Box>
              )}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu utilisateur dropdown moderne */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 3,
            minWidth: 250,
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 1,
          }
        }}
      >
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <UserAvatar size={50} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {user?.nom} {user?.prenom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Chip
                label={
                  user?.type === 'admin' ? 'Administrateur' : 
                  user?.type === 'superviseur' ? 'Superviseur' : 
                  'Électeur'
                }
                size="small"
                color="primary"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </Box>
        
        <Divider />
        
        <MenuItem 
          onClick={handleUserMenuClose}
          sx={{
            py: 2,
            '&:hover': {
              backgroundColor: alpha('#2E73F8', 0.05)
            }
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: '#2E73F8' }} />
          </ListItemIcon>
          <Typography fontWeight={500}>Paramètres</Typography>
        </MenuItem>
        
        <MenuItem 
          onClick={handleLogout}
          sx={{
            py: 2,
            '&:hover': {
              backgroundColor: alpha('#F44336', 0.05)
            }
          }}
        >
          <ListItemIcon>
            <ExitToApp fontSize="small" sx={{ color: '#F44336' }} />
          </ListItemIcon>
          <Typography fontWeight={500} color="#F44336">Déconnexion</Typography>
        </MenuItem>
      </Menu>

      {/* Drawer moderne pour mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            border: 'none',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 