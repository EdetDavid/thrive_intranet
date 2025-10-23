import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/apiService';

const Navbar = ({ isHR, setUser }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const info = await authAPI.getUserInfo();
        if (mounted && info?.username) setUsername(info.username);
      } catch (e) {
        // ignore - user may be unauthenticated
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // setUser may be passed from App; check before calling
    if (typeof setUser === 'function') {
      setUser({ isHR: false, isAuthenticated: false });
    }
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AppBar 
        position="fixed"
        sx={{ 
          backgroundColor: '#181344',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              flexGrow: 1,
              color: '#ffffff',
              cursor: 'pointer',
              maxWidth: { xs: '60%', sm: '70%', md: '80%' },
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            onClick={() => navigate('/')}
          >
            Thrive Holdings HR Intranet {isHR && '(Admin)'}
          </Typography>
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {isHR && (
                <Button
                  onClick={() => navigate('/admin')}
                  sx={{
                    color: '#fff',
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#115293' },
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    mr: 2
                  }}
                >
                  Admin Panel
                </Button>
              )}
              {isHR && (
                <Button
                  onClick={() => navigate('/hr')}
                  sx={{
                    color: '#fff',
                    backgroundColor: '#9c27b0',
                    '&:hover': { backgroundColor: '#7b1fa2' },
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    mr: 2
                  }}
                >
                  HR Dashboard
                </Button>
              )}
              <Button
                onClick={() => navigate('/leaves')}
                sx={{
                  color: '#fff',
                  backgroundColor: '#2e7d32',
                  '&:hover': { backgroundColor: '#256322' },
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mr: 2
                }}
              >
                Leaves
              </Button>
              {username && (
                <Button
                  onClick={() => navigate('/profile')}
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    mr: 2,
                    display: { xs: 'none', sm: 'flex' },
                    textTransform: 'none'
                  }}
                >
                  {username}
                </Button>
              )}
              {username && (
                <Typography variant="body2" sx={{ color: '#fff', mr: 1, fontWeight: 600, display: { xs: 'inline', sm: 'none' } }}>{username.charAt(0).toUpperCase()}</Typography>
              )}
              <Button 
                onClick={handleLogout}
                sx={{ 
                  color: '#fff', 
                  backgroundColor: '#ED1C24',
                  '&:hover': { backgroundColor: '#c4181f' },
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 1
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 220 } }}
      >
        <List>
          {username && (
            <ListItem button onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>
              <ListItemText primary={username} secondary="View Profile" />
            </ListItem>
          )}
          <ListItem button onClick={() => { navigate('/'); setDrawerOpen(false); }}>
            <ListItemText primary="Home" />
          </ListItem>
          {isHR && (
            <ListItem button onClick={() => { navigate('/admin'); setDrawerOpen(false); }}>
              <ListItemText primary="Admin Panel" />
            </ListItem>
          )}
          {isHR && (
            <ListItem button onClick={() => { navigate('/hr'); setDrawerOpen(false); }}>
              <ListItemText primary="HR Dashboard" />
            </ListItem>
          )}
          <ListItem button onClick={() => { navigate('/leaves'); setDrawerOpen(false); }}>
            <ListItemText primary="Leaves" />
          </ListItem>
          <ListItem button onClick={() => { handleLogout(); setDrawerOpen(false); }}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
