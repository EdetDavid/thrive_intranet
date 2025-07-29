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
} from "@mui/material";
import { toast } from "react-toastify";
import { userAPI } from "../api/apiService";
import Navbar from "../components/Navbar";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
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
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>HR Privilege</TableCell>
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
