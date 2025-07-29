import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Navbar = ({ isHR }) => {
  const navigate = useNavigate();
  const { setUser } = useOutletContext();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser({ isHR: false, isAuthenticated: false });
    navigate('/login', { replace: true });
  };

  return (
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;