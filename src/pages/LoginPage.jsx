import { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { authAPI } from "../api/apiService";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Logo from "../assets/logo/logo.png";

const LoginPage = () => {
  const [loginCredentials, setLoginCredentials] = useState({
    email: "", // Changed from username to email
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useOutletContext();

  // Redirect authenticated users away from login
  useEffect(() => {
    if (user && user.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access, refresh } = await authAPI.login({
        // Modify the payload to match what your backend expects
        // Some backends expect 'email' while others expect 'username' but accept email
        // You might need to adjust this based on your backend requirements
        username: loginCredentials.email, // Or use email: loginCredentials.email
        password: loginCredentials.password,
      });
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const userInfo = await authAPI.getUserInfo();
      setUser({
  isHR: userInfo?.is_hr || false,
  isLineManager: userInfo?.is_line_manager || false,
        isAuthenticated: true,
      });
      toast.success("Login successful! Welcome to Thrive HR Intranet.");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        > 
          <img
            src={Logo}
            alt="Company Logo"
            style={{ width: "80px", height: "80px", marginBottom: "16px" }}
          />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "#181344",
              fontWeight: "bold",
              mt: 1,
            }}
          >
            Thrive Intranet Portal
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address" // Changed from Username to Email Address
            name="email" // Changed from username to email
            type="email" // Added type="email" for better validation
            value={loginCredentials.email}
            onChange={handleCredentialChange}
            autoComplete="email" // Changed from username to email
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={loginCredentials.password}
            onChange={handleCredentialChange}
            autoComplete="current-password"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              backgroundColor: "#181344",
              "&:hover": {
                backgroundColor: "#0f0b2b",
              },
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
