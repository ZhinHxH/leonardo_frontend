import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  timeout?: number; // Timeout en segundos
  onTimeout?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Cargando...", 
  timeout = 10,
  onTimeout 
}) => {
  const [progress, setProgress] = useState(0);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + (100 / (timeout * 10));
        
        if (newProgress >= 100) {
          setTimeoutReached(true);
          if (onTimeout) {
            onTimeout();
          }
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [timeout, onTimeout]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#f8fafc' }}
    >
      <Box textAlign="center" mb={4}>
        <img 
          src="/img/logo_claro_transparente.png" 
          alt="Logo" 
          style={{ height: 60, marginBottom: 20 }} 
        />
        <Typography variant="h6" color="primary" gutterBottom>
          Sistema de Gestión Gimnasio
        </Typography>
      </Box>

      <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
      
      <Typography variant="body1" color="text.secondary" mb={2}>
        {message}
      </Typography>

      <Box width={200} mb={2}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        {timeoutReached ? 'Verificando conexión...' : `${Math.round(progress)}%`}
      </Typography>

      {timeoutReached && (
        <Typography variant="body2" color="warning.main" mt={2}>
          La carga está tomando más tiempo del esperado
        </Typography>
      )}
    </Box>
  );
};






