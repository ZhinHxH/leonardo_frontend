import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Paper,
  Toolbar
} from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { ProtectedRoute } from '../../components/ProtectedRoute';

const reportCards = [
  {
    title: 'Reporte de Usuarios',
    description: 'Análisis detallado de usuarios registrados, edades, géneros y patrones de uso',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    href: '/reports/users',
    color: '#4A90E2',
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
  },
  {
    title: 'Reporte de Ingresos',
    description: 'Análisis de ingresos por ventas, planes de membresía y pagos diarios',
    icon: <MoneyIcon sx={{ fontSize: 40 }} />,
    href: '/reports/revenue',
    color: '#7ED321',
    gradient: 'linear-gradient(135deg, #7ED321 0%, #5BA317 100%)'
  },
  {
    title: 'Reporte de Picos',
    description: 'Gráficos de picos de asistencia, comparativas de edades y tiempo promedio',
    icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
    href: '/reports/peaks',
    color: '#F5A623',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #D18B1C 100%)'
  },
  {
    title: 'Reporte de Inventario',
    description: 'Cálculos de inventario, movimientos, stock bajo y valor total',
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    href: '/reports/inventory',
    color: '#BD10E0',
    gradient: 'linear-gradient(135deg, #BD10E0 0%, #9B0DB8 100%)'
  }
];

export default function ReportsIndex() {
  const router = useRouter();
  const { theme } = useTheme();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          📊 Centro de Reportes
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Análisis completo y visualización de datos del gimnasio
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {reportCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={4}
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleCardClick(card.href)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      background: card.gradient,
                      borderRadius: '12px',
                      p: 2,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {card.icon}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#333'
                    }}
                  >
                    {card.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      flexGrow: 1,
                      lineHeight: 1.6
                    }}
                  >
                    {card.description}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      mt: 2,
                      pt: 2,
                      borderTop: `2px solid ${card.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: card.color,
                        fontWeight: 600
                      }}
                    >
                      Ver Reporte
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: card.color,
                        fontWeight: 600
                      }}
                    >
                      →
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper 
        elevation={2} 
        sx={{ 
          mt: 4, 
          p: 3,
          background: theme.palette.mode === 'dark' ? '#1E1E1E' : '#F8F9FA'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          💡 Características de los Reportes
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              • <strong>Filtros de fecha:</strong> Selecciona períodos específicos para análisis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Gráficos interactivos:</strong> Visualizaciones con tonos sobrios y profesionales
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              • <strong>Exportación:</strong> Descarga reportes en PDF y Excel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Tiempo real:</strong> Datos actualizados automáticamente
            </Typography>
          </Grid>
        </Grid>
      </Paper>
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
