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
  Divider
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
  Work
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
        { label: 'Dashboard', path: '/admin', icon: <Dashboard /> },
        { label: 'Élections', path: '/admin/elections', icon: <HowToVote /> },
        { label: 'Candidats', path: '/admin/candidats', icon: <Person /> },
        { label: 'Électeurs', path: '/admin/electeurs', icon: <People /> },
        { label: 'Départements', path: '/admin/departements', icon: <LocationOn /> },
        { label: 'Postes', path: '/admin/postes', icon: <Work /> },
      ];
    } else {
      return [
        { label: 'Dashboard', path: '/electeur', icon: <Dashboard /> },
        { label: 'Candidature', path: '/electeur/candidature', icon: <Assignment /> },
      ];
    }
  };

  const menuItems = getMenuItems();

  // Titre de l'application selon le type d'utilisateur
  const getAppTitle = () => {
    return user?.type === 'admin' 
      ? 'Administration Électorale' 
      : 'Espace Électeur';
  };

  // Drawer pour mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
        {getAppTitle()}
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          {/* Menu hamburger pour mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Titre */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => handleNavigation(user?.type === 'admin' ? '/admin' : '/electeur')}
          >
            {getAppTitle()}
          </Typography>

          {/* Menu navigation desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', mr: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                  sx={{
                    mx: 1,
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Menu utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={handleUserMenuOpen}
              startIcon={
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'secondary.main',
                    fontSize: '0.9rem'
                  }}
                >
                  {user?.nom?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </Avatar>
              }
              sx={{ textTransform: 'none' }}
            >
              {user?.nom || user?.email}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu utilisateur dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleUserMenuClose} disabled>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {user?.nom} {user?.prenom}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="caption" color="primary" display="block">
              {user?.type === 'admin' ? 'Administrateur' : 'Électeur'}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Paramètres
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Déconnexion
        </MenuItem>
      </Menu>

      {/* Drawer pour mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 