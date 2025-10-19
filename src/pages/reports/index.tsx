import React from 'react';
import {
  Box,
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
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const reportCards = [
  {
    title: 'Reporte de Usuarios',
    description: 'Análisis demográfico, registros y estadísticas de usuarios',
    icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    href: '/reports/users',
    color: '#2E86AB'
  },
  {
    title: 'Reporte de Ingresos',
    description: 'Análisis de ventas, ingresos por plan y métodos de pago',
    icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    href: '/reports/revenue',
    color: '#28A745'
  },
  {
    title: 'Reporte de Picos',
    description: 'Análisis de horarios pico, ocupación y patrones de uso',
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
    href: '/reports/peaks',
    color: '#FFC107'
  },
  {
    title: 'Reporte de Inventario',
    description: 'Control de stock, movimientos y valoración de inventario',
    icon: <InventoryIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    href: '/reports/inventory',
    color: '#17A2B8'
  }
];

export default function Reports() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Box textAlign="center" mb={4}>
                <BarChartIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h1" gutterBottom>
                  📊 Centro de Reportes
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Análisis completo y visualización de datos del gimnasio
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {reportCards.map((card, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleCardClick(card.href)}
                        sx={{ height: '100%', p: 2 }}
                      >
                        <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                          <Box mb={2}>
                            {card.icon}
                          </Box>
                          <Typography variant="h5" component="h2" gutterBottom>
                            {card.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box mt={4} p={3} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="h6" gutterBottom>
                  💡 Características de los Reportes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      • <strong>Filtros de fecha:</strong> Análisis por períodos específicos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • <strong>Gráficos interactivos:</strong> Visualización clara de datos
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      • <strong>Exportación:</strong> Descarga en PDF y Excel
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • <strong>Tiempo real:</strong> Datos actualizados al momento
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
