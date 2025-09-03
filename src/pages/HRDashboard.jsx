import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Grid, Chip } from '@mui/material';
import { leaveAPI } from '../api/apiService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

const HRDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveAPI.list();
      // ensure array
      const list = Array.isArray(data) ? data : data.results || [];
      setLeaves(list);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApprove = async (id) => {
    try { await leaveAPI.approve(id); fetchLeaves(); } catch (e) { console.error(e); }
  };

  const handleReject = async (id) => {
    try { await leaveAPI.reject(id); fetchLeaves(); } catch (e) { console.error(e); }
  };

  // calendar data for this month
  const now = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });

  const leavesByDate = {};
  leaves.filter(l => l.status === 'approved').forEach(l => {
    const s = new Date(l.start_date);
    const e = new Date(l.end_date);
    days.forEach(d => {
      if (isWithinInterval(d, { start: s, end: e })) {
        const key = format(d, 'yyyy-MM-dd');
        leavesByDate[key] = leavesByDate[key] || [];
        leavesByDate[key].push(l.user.username || l.user);
      }
    });
  });

  const pending = leaves.filter(l => l.status === 'pending');

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>HR Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Pending Leave Requests</Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pending.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.user.username}</TableCell>
                      <TableCell>{p.leave_type}</TableCell>
                      <TableCell>{p.start_date}</TableCell>
                      <TableCell>{p.end_date}</TableCell>
                      <TableCell sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.reason}</TableCell>
                      <TableCell>
                        <Button size="small" color="primary" onClick={() => handleApprove(p.id)}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleReject(p.id)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Calendar - {format(now, 'MMMM yyyy')}</Typography>
            <Grid container spacing={1} sx={{ overflowX: 'auto' }}>
              {days.map(d => {
                const key = format(d, 'yyyy-MM-dd');
                const items = leavesByDate[key] || [];
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={key}>
                    <Paper variant="outlined" sx={{ p: 1, minHeight: { xs: 80, sm: 60 } }}>
                      <Typography variant="caption">{format(d, 'd')}</Typography>
                      <Box>
                        {items.slice(0,3).map((u, i) => (
                          <Chip
                            key={i}
                            label={typeof u === 'string' ? u : (u && u.username) || String(u)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        ))}
                        {items.length > 3 && <Typography variant="caption">+{items.length - 3}</Typography>}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
