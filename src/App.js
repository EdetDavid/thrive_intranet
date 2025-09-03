import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Toolbar } from '@mui/material';
import { authAPI } from './api/apiService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: { main: '#181344' },
    secondary: { main: '#ED1C24' },
    background: { default: '#ffffff', paper: '#f5f5f5' },
  },
});

const App = () => {
  const [user, setUser] = useState({ isHR: false, isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const response = await authAPI.getUserInfo();
      setUser({
        isHR: response?.is_hr || false,
        isAuthenticated: true
      });
    } catch (error) {
      setUser({ isHR: false, isAuthenticated: false });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Set up listener for storage events (for role changes)
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Don't show Navbar on the login page */}
      {location.pathname !== '/login' && (
        <>
          <Navbar isHR={user.isHR} setUser={setUser} />
          {/* Toolbar provides consistent spacing for the fixed AppBar so content isn't covered */}
          <Toolbar />
        </>
      )}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
  <Outlet context={{ user, setUser }} />
    </ThemeProvider>
  );
};

export default App;