import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Chip, Divider, CircularProgress, Alert, Stack, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { userAPI } from '../api/apiService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { id } = useParams(); // Get user ID from URL if viewing another user's profile
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userAPI.getProfile(id);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(err.response?.data?.detail || 'Failed to load profile');
        toast.error(err.response?.data?.detail || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={3}>
        <Alert severity="info">No profile information found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {profile.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{profile.first_name} {profile.last_name}</Typography>
            <Stack direction="row" spacing={1}>
              {profile.is_hr && <Chip label="HR" color="primary" />}
              {profile.is_line_manager && <Chip label="Line Manager" color="secondary" />}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Username</Typography>
            <Typography variant="body1">{profile.username}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1">{profile.email}</Typography>
          </Grid>
          {profile.manager && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
              <Typography variant="body1">{profile.manager.username} ({profile.manager.email})</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
            <Typography variant="body1">{format(new Date(profile.date_joined), 'PPP')}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;