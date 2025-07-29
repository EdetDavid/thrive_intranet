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
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userAPI.list();
      // Handle paginated or direct array response
      const userList = Array.isArray(response) ? response : response.results || [];
      setUsers(userList);
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleHRChange = async (userId, isHR) => {
    try {
      await userAPI.updateHR(userId, isHR);
      toast.success("HR privilege updated");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_hr: isHR } : user
        )
      );
    } catch (err) {
      toast.error("Failed to update HR privilege");
    }
  };

  return (
    <>
      <Navbar isHR={true} />
      <Container maxWidth="md" sx={{ mt: { xs: 7, sm: 10 }, px: { xs: 0.5, sm: 2 } }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {users.map((user) => (
              <Card key={user.id} sx={{ mb: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    First Name: {user.first_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Name: {user.last_name}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">HR Privilege:</Typography>
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
          <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 120 }}>Username</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Email</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>First Name</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Last Name</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>HR Privilege</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.is_hr}
                        onChange={(e) =>
                          handleHRChange(user.id, e.target.checked)
                        }
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default AdminPanel;
