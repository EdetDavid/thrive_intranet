import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ isHR }) => {
  const navigate = useNavigate();
  const { setUser } = useOutletContext();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser({ isHR: false, isAuthenticated: false });
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
            sx={{ flexGrow: 1, color: '#ffffff', cursor: 'pointer' }}
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
          <ListItem button onClick={() => { navigate('/'); setDrawerOpen(false); }}>
            <ListItemText primary="Home" />
          </ListItem>
          {isHR && (
            <ListItem button onClick={() => { navigate('/admin'); setDrawerOpen(false); }}>
              <ListItemText primary="Admin Panel" />
            </ListItem>
          )}
          <ListItem button onClick={() => { handleLogout(); setDrawerOpen(false); }}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;