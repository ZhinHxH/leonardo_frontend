import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  Toolbar, 
  Typography, 
  Box,
  Divider,
  ListItemButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  AttachMoney as AttachMoneyIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  MedicalServices as MedicalIcon,
  FitnessCenter as FitnessIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const drawerWidth = 260;

const getMenuItems = (userRole: string) => {
  const baseItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard', roles: ['admin', 'manager', 'trainer', 'receptionist', 'member'] },
  ];

  const adminItems = [
    {
      text: 'Gestión de Usuarios', 
      icon: <GroupIcon />, 
      roles: ['admin', 'manager'],
      children: [
        { text: 'Registrar Usuario', icon: <PersonAddIcon />, href: '/users/register' },
        { text: 'Lista de Usuarios', icon: <PeopleIcon />, href: '/users' },
        { text: 'Historial Clínico', icon: <MedicalIcon />, href: '/users/clinical-history' },
      ]
    },
    { 
      text: 'Inventario', 
      icon: <InventoryIcon />, 
      href: '/inventory', 
      roles: ['admin', 'manager', 'receptionist'] 
    },
    {
      text: 'Ventas', 
      icon: <ShoppingCartIcon />, 
      roles: ['admin', 'manager', 'receptionist'],
      children: [
        { text: 'Panel de Ventas', icon: <ShoppingCartIcon />, href: '/sales' },
        { text: 'Punto de Venta (POS)', icon: <PersonAddIcon />, href: '/sales/pos' },
        { text: 'Historial de Ventas', icon: <ReceiptIcon />, href: '/sales/history' },
      ]
    },
    {
      text: 'Administración', 
      icon: <SettingsIcon />, 
      roles: ['admin', 'manager'],
      children: [
        { text: 'Gestión de Roles', icon: <SecurityIcon />, href: '/admin/roles' },
        { text: 'Planes y Tarifas', icon: <AttachMoneyIcon />, href: '/admin/membership-plans' },
      ]
    },
    {
      text: 'Reportes', 
      icon: <AssessmentIcon />, 
      roles: ['admin', 'manager'],
      children: [
        { text: 'Centro de Reportes', icon: <AssessmentIcon />, href: '/reports' },
        { text: 'Reporte de Usuarios', icon: <PeopleIcon />, href: '/reports/users' },
        { text: 'Reporte de Ingresos', icon: <AttachMoneyIcon />, href: '/reports/revenue' },
        { text: 'Reporte de Picos', icon: <TrendingUpIcon />, href: '/reports/peaks' },
        { text: 'Reporte de Inventario', icon: <InventoryIcon />, href: '/reports/inventory' },
      ]
    },
  ];

  const memberItems = [
    { text: 'Mi Perfil', icon: <PeopleIcon />, href: '/profile', roles: ['member'] },
    { text: 'Mi Historial', icon: <MedicalIcon />, href: '/my-history', roles: ['member'] },
    { text: 'Entrenamientos', icon: <FitnessIcon />, href: '/workouts', roles: ['member'] },
  ];

  return [...baseItems, ...adminItems, ...memberItems].filter(item => 
    item.roles.includes(userRole)
  );
};

export default function Sidebar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const menuItems = getMenuItems(user?.role || 'member');

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#000000',
          color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#FFFFFF',
          borderRight: `3px solid ${theme.palette.secondary.main}`,
        },
      }}
    >
      <Toolbar sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#000000',
        borderBottom: `2px solid ${theme.palette.secondary.main}`,
      }}>
        <Box display="flex" alignItems="center" width="100%" justifyContent="center">
          <img 
            src="/img/logo_claro_transparente.png" 
            alt="Logo" 
            style={{ height: 45, filter: 'brightness(0) invert(1)' }} 
          />
        </Box>
      </Toolbar>
      
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: `1px solid ${theme.palette.secondary.main}` }}>
        <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
          Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
          {user?.role || 'member'}
        </Typography>
      </Box>

      <List sx={{ pt: 1 }}>
        {menuItems.map((item, idx) => (
          <Box key={item.text}>
            {item.children ? (
              <>
                <ListItemButton 
                  onClick={() => toggleSection(item.text)}
                  sx={{
                    '&:hover': {
                      backgroundColor: `rgba(${theme.palette.secondary.main === '#FFD700' ? '255,215,0' : '255,255,255'}, 0.1)`,
                    },
                    borderLeft: openSections[item.text] ? `4px solid ${theme.palette.secondary.main}` : 'none',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: theme.palette.secondary.main,
                    minWidth: 40 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                  {openSections[item.text] ? 
                    <ExpandLess sx={{ color: theme.palette.secondary.main }} /> : 
                    <ExpandMore sx={{ color: theme.palette.secondary.main }} />
                  }
                </ListItemButton>
                <Collapse in={openSections[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <Link href={child.href} key={child.text} passHref legacyBehavior>
                        <ListItemButton 
                          sx={{ 
                            pl: 6,
                            '&:hover': {
                              backgroundColor: `rgba(${theme.palette.secondary.main === '#FFD700' ? '255,215,0' : '255,255,255'}, 0.1)`,
                              borderLeft: `2px solid ${theme.palette.secondary.main}`,
                            },
                          }}
                        >
                          {child.icon && (
                            <ListItemIcon sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              minWidth: 30,
                              fontSize: '1rem'
                            }}>
                              {child.icon}
                            </ListItemIcon>
                          )}
                          <ListItemText 
                            primary={child.text}
                            primaryTypographyProps={{ 
                              fontSize: '0.85rem',
                              color: 'rgba(255,255,255,0.9)'
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <Link href={item.href} key={item.text} passHref legacyBehavior>
                <ListItemButton
                  sx={{
                    '&:hover': {
                      backgroundColor: `rgba(${theme.palette.secondary.main === '#FFD700' ? '255,215,0' : '255,255,255'}, 0.1)`,
                      borderLeft: `4px solid ${theme.palette.secondary.main}`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: theme.palette.secondary.main,
                    minWidth: 40 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </Link>
            )}
            {idx < menuItems.length - 1 && (
              <Divider sx={{ 
                borderColor: 'rgba(255,255,255,0.1)',
                mx: 2,
                my: 0.5
              }} />
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
} 