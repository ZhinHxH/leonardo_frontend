import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Paleta de colores personalizada: Negro, Dorado y Blanco
const goldColor = '#FFD700';
const darkGoldColor = '#B8860B';
const lightGoldColor = '#FFEF94';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Negro
      light: '#333333',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: goldColor, // Dorado
      light: lightGoldColor,
      dark: darkGoldColor,
      contrastText: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F9FA',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: '#000000' },
    h2: { fontWeight: 700, color: '#000000' },
    h3: { fontWeight: 600, color: '#000000' },
    h4: { fontWeight: 600, color: '#000000' },
    h5: { fontWeight: 500, color: '#000000' },
    h6: { fontWeight: 500, color: '#000000' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          borderRight: `2px solid ${goldColor}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: goldColor,
          color: '#000000',
          '&:hover': {
            borderColor: darkGoldColor,
            backgroundColor: lightGoldColor,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontWeight: 700,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: goldColor,
            color: '#000000',
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: goldColor, // Dorado como primario en tema oscuro
      light: lightGoldColor,
      dark: darkGoldColor,
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFFFFF', // Blanco como secundario
      light: '#F5F5F5',
      dark: '#E0E0E0',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: '#333333',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: '#FFFFFF' },
    h2: { fontWeight: 700, color: '#FFFFFF' },
    h3: { fontWeight: 600, color: '#FFFFFF' },
    h4: { fontWeight: 600, color: '#FFFFFF' },
    h5: { fontWeight: 500, color: '#FFFFFF' },
    h6: { fontWeight: 500, color: '#FFFFFF' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: goldColor,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E1E1E',
          color: '#FFFFFF',
          borderRight: `2px solid ${goldColor}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: goldColor,
          color: '#000000',
          '&:hover': {
            backgroundColor: darkGoldColor,
          },
        },
        outlined: {
          borderColor: goldColor,
          color: goldColor,
          '&:hover': {
            borderColor: lightGoldColor,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#000000',
            color: goldColor,
            fontWeight: 700,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: goldColor,
            color: '#000000',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          backgroundImage: 'none',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar tema guardado del localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('gym-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('gym-theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};









