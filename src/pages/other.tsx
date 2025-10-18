import { Box, Button, Card, CardContent, TextField, Typography, Link } from '@mui/material';
import Image from 'next/image';

export default function Login() {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#ffffff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 2
    }}>
      <Card sx={{ 
        width: '100%', 
        maxWidth: 450, 
        borderRadius: 3, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <CardContent sx={{ padding: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Image
              src="/img/logo_claro_transparente.png" 
              alt="Logo" 
              width={200} 
              height={50} 
              style={{ marginBottom: 16 }}
            />
            <Typography 
              variant="body1" 
              align="center"
              sx={{ 
                fontStyle: 'italic',
                color: '#000000',
                fontSize: '1rem',
                opacity: 0.8
              }}
            >
              Donde el cuerpo logra lo que la mente cree
            </Typography>
          </Box>

          {/* Formulario */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField 
              label="Correo Electrónico" 
              type="email" 
              fullWidth 
              required 
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fafafa',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff'
                  }
                }
              }}
            />
            <TextField 
              label="Contraseña" 
              type="password" 
              fullWidth 
              required 
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fafafa',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff'
                  }
                }
              }}
            />
            
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: '#000000',
                color: '#fbc02d',
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: '#333333',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              Ingresar
            </Button>
          </Box>

          {/* Enlaces */}
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              color: '#666666',
              fontSize: '0.875rem',
              mt: 2
            }}
          >
            ¿Olvidaste tu contraseña?{' '}
            <Link 
              href="#" 
              underline="hover"
              sx={{ 
                color: '#000000',
                fontWeight: 500,
                '&:hover': {
                  color: '#fbc02d'
                }
              }}
            >
              Recupérala aquí
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 