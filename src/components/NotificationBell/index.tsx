import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNotifications, Notification, NotificationType, NotificationPriority } from '../../services/notificationService';

interface NotificationBellProps {
  color?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ color = '#FFFFFF' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearRead } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LOW_STOCK:
        return <WarningIcon color="warning" />;
      case NotificationType.SALE_COMPLETED:
        return <ShoppingCartIcon color="success" />;
      case NotificationType.MEMBERSHIP_EXPIRING:
        return <PersonIcon color="info" />;
      case NotificationType.CASH_CLOSURE:
        return <AttachMoneyIcon color="primary" />;
      case NotificationType.SYSTEM_ALERT:
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'error';
      case NotificationPriority.HIGH:
        return 'warning';
      case NotificationPriority.MEDIUM:
        return 'info';
      case NotificationPriority.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton 
          onClick={handleClick}
          sx={{ color }}
          size="large"
        >
          <Badge 
            badgeContent={unreadCount > 99 ? '+99' : unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
                fontWeight: 'bold'
              }
            }}
          >
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 400,
            maxWidth: 500,
            maxHeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Notificaciones
            </Typography>
            <Box display="flex" gap={1}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={markAllAsRead}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Marcar todas como leídas
                </Button>
              )}
              {readNotifications.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={clearRead}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Limpiar leídas
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Notificaciones no leídas */}
        {unreadNotifications.length > 0 && (
          <>
            <Box sx={{ p: 1, backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>
                No leídas ({unreadNotifications.length})
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {unreadNotifications.slice(0, 5).map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" display="flex" alignItems="center" gap={1}>
                        <Box component="span" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {notification.title}
                        </Box>
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box component="span" sx={{ display: 'block', mb: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}>
                          {notification.message}
                        </Box>
                        <Box component="span" sx={{ display: 'block', color: 'text.disabled', fontSize: '0.75rem' }}>
                          {formatTime(notification.timestamp)}
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </MenuItem>
              ))}
            </List>
            {unreadNotifications.length > 5 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Y {unreadNotifications.length - 5} notificaciones más...
                </Typography>
              </Box>
            )}
            <Divider />
          </>
        )}

        {/* Notificaciones leídas */}
        {readNotifications.length > 0 && (
          <>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Leídas ({readNotifications.length})
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {readNotifications.slice(0, 3).map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1,
                    px: 2,
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" display="flex" alignItems="center" gap={1}>
                        <Box component="span" sx={{ fontSize: '0.875rem' }}>
                          {notification.title}
                        </Box>
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box component="span" sx={{ display: 'block', mb: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}>
                          {notification.message}
                        </Box>
                        <Box component="span" sx={{ display: 'block', color: 'text.disabled', fontSize: '0.75rem' }}>
                          {formatTime(notification.timestamp)}
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </MenuItem>
              ))}
            </List>
            {readNotifications.length > 3 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Y {readNotifications.length - 3} notificaciones más...
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Estado vacío */}
        {notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Box component="h6" sx={{ color: 'text.secondary', fontSize: '1.25rem', fontWeight: 600, mb: 1, m: 0 }}>
              No hay notificaciones
            </Box>
            <Box component="p" sx={{ color: 'text.disabled', fontSize: '0.875rem', m: 0 }}>
              Te notificaremos cuando haya actualizaciones importantes
            </Box>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
