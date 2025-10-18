import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Box, Toolbar, Typography } from '@mui/material';
import DataTable from '../../components/DataTable';
import { useEffect, useState } from 'react';
import { getMemberships } from '../../services/memberships';

export default function Memberships() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    getMemberships({ search, page, limit: pageSize }).then((data) => {
      setRows(data.items || data);
      setTotalRows(data.total || data.length || 0);
    });
  }, [search, page]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Toolbar />
        <Box p={4}>
          <Typography variant="h5" fontWeight={700} mb={2}>Membresías</Typography>
          <DataTable
            columns={[
              { field: 'id', headerName: 'ID', width: 70 },
              { field: 'user_id', headerName: 'Cliente', width: 150 },
              { field: 'type', headerName: 'Tipo', width: 120 },
              { field: 'start_date', headerName: 'Inicio', width: 150 },
              { field: 'end_date', headerName: 'Fin', width: 150 },
              { field: 'is_active', headerName: 'Estado', width: 100 },
            ]}
            rows={rows}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            totalRows={totalRows}
            pageSize={pageSize}
          />
        </Box>
      </Box>
    </Box>
  );
} 