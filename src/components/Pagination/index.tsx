import React from 'react';
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  loading?: boolean;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100]
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botón primera página
    if (startPage > 1) {
      pages.push(
        <Button
          key="first"
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(1)}
          disabled={loading}
        >
          1
        </Button>
      );
      
      if (startPage > 2) {
        pages.push(
          <Typography key="ellipsis1" variant="body2" sx={{ px: 1 }}>
            ...
          </Typography>
        );
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "contained" : "outlined"}
          size="small"
          onClick={() => handlePageChange(i)}
          disabled={loading}
          sx={{ minWidth: 40 }}
        >
          {i}
        </Button>
      );
    }

    // Botón última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Typography key="ellipsis2" variant="body2" sx={{ px: 1 }}>
            ...
          </Typography>
        );
      }
      
      pages.push(
        <Button
          key="last"
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(totalPages)}
          disabled={loading}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      flexWrap="wrap"
      gap={2}
      sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}
    >
      {/* Información de elementos */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="text.secondary">
          Mostrando <strong>{startItem}-{endItem}</strong> de <strong>{totalItems}</strong> elementos
        </Typography>
        
        {showItemsPerPage && onItemsPerPageChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Por página</InputLabel>
            <Select
              value={itemsPerPage}
              label="Por página"
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={loading}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Controles de navegación */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* Botón primera página */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<FirstPage />}
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || loading}
        >
          Primera
        </Button>

        {/* Botón página anterior */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<NavigateBefore />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          Anterior
        </Button>

        {/* Números de página */}
        <Box display="flex" gap={0.5}>
          {renderPageNumbers()}
        </Box>

        {/* Botón página siguiente */}
        <Button
          variant="outlined"
          size="small"
          endIcon={<NavigateNext />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          Siguiente
        </Button>

        {/* Botón última página */}
        <Button
          variant="outlined"
          size="small"
          endIcon={<LastPage />}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
        >
          Última
        </Button>
      </Box>

      {/* Información adicional */}
      <Box display="flex" alignItems="center" gap={1}>
        <Chip 
          label={`Página ${currentPage} de ${totalPages}`} 
          size="small" 
          variant="outlined"
        />
        {loading && (
          <Chip 
            label="Cargando..." 
            size="small" 
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
};
