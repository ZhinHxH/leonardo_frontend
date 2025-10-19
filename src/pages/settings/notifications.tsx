import React from 'react';
import { Box, Paper } from '@mui/material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import NotificationSettingsDashboard from '../../components/NotificationSettings';

const NotificationSettingsPage: React.FC = () => {
  return (
    <AdminRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Box sx={{ mt: 8 }}>
            <NotificationSettingsDashboard />
          </Box>
        </Box>
      </Box>
    </AdminRoute>
  );
};

export default NotificationSettingsPage;
