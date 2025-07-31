import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Box,
  useMediaQuery
} from "@mui/material";
import { toast } from "react-toastify";
import { userAPI } from "../api/apiService";
import Navbar from "../components/Navbar";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallScreen = useMediaQuery('(max-width:1024px)');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userAPI.list();
      setUsers(Array.isArray(response) ? response : response.results || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleHRChange = async (userId, isHR) => {
    try {
      const response = await userAPI.updateHR(userId, isHR);
      toast.success(response.detail || "HR privilege updated");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_hr: isHR } : user
        )
      );
    } catch (err) {
      console.error('Error updating HR privilege:', err);
      toast.error(err.response?.data?.detail || "Failed to update HR privilege");
    }
  };

  return (
    <>
      <Navbar isHR={true} />
      <Container maxWidth="lg" sx={{ 
        mt: { xs: 7, sm: 10 }, 
        px: { xs: 1, sm: 2, md: 3 },
        maxWidth: { xl: '1400px' }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h4" component="h1" sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
          }}>
            Admin Panel
          </Typography>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : isMobile ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)'
            },
            gap: { xs: 2, sm: 3 }
          }}>
            {users.map((user) => (
              <Card key={user.id} sx={{ 
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600 
                  }}>
                    {user.username}
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <strong>Email:</strong>&nbsp;{user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <strong>First Name:</strong>&nbsp;{user.first_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <strong>Last Name:</strong>&nbsp;{user.last_name}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    mt: 2, 
                    pt: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>HR Privilege</Typography>
                    <Switch
                      checked={user.is_hr}
                      onChange={(e) => handleHRChange(user.id, e.target.checked)}
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Paper sx={{ 
            width: '100%', 
            overflow: 'hidden',
            boxShadow: 2,
            '& .MuiTableCell-root': {
              px: { xs: 1, sm: 2, md: 3 },
              py: { xs: 1.5, sm: 2 },
              '&:first-of-type': {
                pl: { xs: 2, sm: 3 }
              },
              '&:last-of-type': {
                pr: { xs: 2, sm: 3 }
              }
            }
          }}>
            <TableContainer sx={{ maxHeight: '70vh' }}>
              <Table stickyHeader sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      Username
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      Last Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      HR Privilege
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={user.is_hr}
                          onChange={(e) => handleHRChange(user.id, e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default AdminPanel;
