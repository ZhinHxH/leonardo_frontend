import * as React from 'react';
import { 
  Box, 
  TextField, 
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (params: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  search: string;
  setSearch: (value: string) => void;
  page?: number;
  setPage?: (value: number) => void;
  totalRows?: number;
  pageSize?: number;
}

export default function DataTable({ 
  columns, 
  rows, 
  search, 
  setSearch, 
  page = 1, 
  setPage, 
  totalRows = 0, 
  pageSize = 10 
}: DataTableProps) {
  const handlePageChange = (_: any, value: number) => {
    if (setPage) setPage(value);
  };

  // Filtrar filas basado en la búsqueda
  const filteredRows = rows.filter(row => {
    if (!search) return true;
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Paginar las filas si no hay paginación externa
  const paginatedRows = setPage 
    ? filteredRows 
    : filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Box>
      <TextField
        label="Buscar"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />
      
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.field}
                  sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    width: column.width,
                    flex: column.flex
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No se encontraron resultados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => (
                <TableRow key={row.id || index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {column.renderCell 
                        ? column.renderCell({ row, value: row[column.field] })
                        : row[column.field]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {setPage && totalRows > pageSize && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(totalRows / pageSize)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
} 