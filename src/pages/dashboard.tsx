import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DashboardCards from '../components/DashboardCards';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { Box, Toolbar } from '@mui/material';

export default function Dashboard() {
  // Activar refresh automático de token
  useTokenRefresh();

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <DashboardCards />
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
} 