import { createTheme } from '@mui/material/styles';

const lightBackground = '#343a40';
const midBackground = '#121212'; 
const darkBackground = "#232323";
const orangePrimary = '#fb8c00'; 
const orangeSecondary = '#ef6c00'; 
const orangeLight = "#ffb74dx"

const myH3 = {
  h3: {
    color: orangeSecondary, 
    fontSize: '2rem',
    fontWeight: 700,
  }
};

const theme = createTheme({
  palette: {
    mode: 'dark', // Ensures that the background of components is dark
    primary: {
      main: orangePrimary,
    },
    secondary: {
      main: orangeSecondary,
    },
    background: {
      light: lightBackground,
      default: midBackground,
      dark: darkBackground,
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'JetBrains Mono, monospace',
    h1: {
      fontSize: '4.5rem',
      fontWeight: 700,
      color: orangeSecondary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: orangePrimary,
    },
    h3: myH3.h3,

    body1: {
      fontSize: '1.25rem',
      color: '#e0e0e0', 
    },
    button: {
      textTransform: 'none', 
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          margin: "0.5rem",
          color: myH3.h3.color,
          borderColor: myH3.h3.color,
          borderWidth: '2px',
          borderRadius: '15px',
          fontSize: myH3.h3.fontSize, 
          fontWeight: myH3.h3.fontWeight, 
          '&:hover': {
            backgroundColor: '#ffa726', 
            color: 'black', 
          }
        }
      }
    },
    MuiCard : {
      styleOverrides: {
        root: {
          margin: "1.5rem 0",
          borderRadius: '15px',
          background: darkBackground,
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: orangePrimary,
          '&:hover': {
            color: orangeSecondary,
          }
        }
      }
    }
  }
});

export default theme;
