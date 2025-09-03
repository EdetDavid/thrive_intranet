import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Stack, Button, Divider } from '@mui/material';
import { userAPI, authAPI } from '../api/apiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const info = await authAPI.getUserInfo();
        if (!mounted) return;
        setCurrentUser(info);
        // Request server-filtered list for the manager
        const resp = await userAPI.listByManager(info.id);
        const users = resp?.results || [];
        if (!mounted) return;
        setTeam(users);
      } catch (e) {
        console.error(e);
        toast.error(e.response?.data?.detail || 'Failed to load team');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ m: 2 }}>My Team</Typography>
      {loading && <Typography>Loading...</Typography>}
      {!loading && team.length === 0 && <Typography>No team members found.</Typography>}
      <Stack spacing={2}>
        {team.map(member => (
          <Paper key={member.id} sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>{(member.username || 'U').charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{member.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{member.first_name} {member.last_name} • {member.email}</Typography>
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button fullWidth size="small" variant="outlined" onClick={() => navigate(`/leaves?user=${member.id}`)}>View Leaves</Button>
                <Button fullWidth size="small" variant="contained" onClick={() => navigate(`/profile/${member.id}`)}>Profile</Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default MyTeam;
