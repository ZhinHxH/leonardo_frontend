import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton, 
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const currentTime = new Date().toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201, 
        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#000000',
        color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#FFFFFF',
        boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
        borderBottom: `2px solid ${theme.palette.secondary.main}`
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.secondary.main }}>
            Sistema de Gestión Petardas
          </Typography>
          <Box sx={{ ml: 'auto', mr: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {currentTime}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Notificaciones">
          <IconButton sx={{ color: theme.palette.secondary.main }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Pantalla completa">
          <IconButton sx={{ color: theme.palette.secondary.main }} onClick={handleFullscreen}>
            <FullscreenIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isDarkMode ? "Tema claro" : "Tema oscuro"}>
          <IconButton sx={{ color: theme.palette.secondary.main }} onClick={toggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        <Box ml={2} display="flex" alignItems="center">
          <IconButton
            onClick={handleMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar 
              alt={user?.name || 'Usuario'} 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 1,
                backgroundColor: theme.palette.secondary.main,
                color: '#000000',
                fontWeight: 'bold'
              }} 
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Box sx={{ cursor: 'pointer' }} onClick={handleMenuOpen}>
            <Typography variant="body1" fontWeight={600} sx={{ color: '#FFFFFF' }}>
              {user?.name || 'Usuario Demo'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
              {user?.role || 'member'}
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 250,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.secondary.main}`
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              mr: 2,
              backgroundColor: theme.palette.secondary.main,
              color: '#000000',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {user?.name || 'Usuario Demo'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'usuario@demo.com'}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: theme.palette.secondary.main,
              textTransform: 'capitalize',
              fontWeight: 600
            }}>
              {user?.role || 'member'}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <AccountCircleIcon sx={{ mr: 2, color: theme.palette.secondary.main }} />
          <Typography>Mi Perfil</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <SettingsIcon sx={{ mr: 2, color: theme.palette.secondary.main }} />
          <Typography>Configuración</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <LogoutIcon sx={{ mr: 2, color: 'error.main' }} />
          <Typography color="error.main">Cerrar Sesión</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
} 