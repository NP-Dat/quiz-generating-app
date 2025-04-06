import React from 'react';
import './css/App.css';
import Quiz from './Quiz';
import { AppBar, Toolbar, Typography, Container, Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create custom theme
const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
      }}>
        <CssBaseline />
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
          <Toolbar>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              Networking Quiz
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container 
          component="main" 
          sx={{ 
            py: 4, 
            flexGrow: 1,
            maxWidth: { 
              xs: '100%', // Full width on mobile
              md: '900px' // Fixed width on desktop
            } 
          }}
        >
          <Quiz />
        </Container>

        <Box component="footer" sx={{ py: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="body2" align="center">
            Test your knowledge!
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
