import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Avatar, Grid, Paper, Stack, Chip, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Tooltip, useMediaQuery } from '@mui/material';
import { leaveAPI } from '../../api/apiService';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI, userAPI } from '../../api/apiService';
import ApproveIcon from '@mui/icons-material/CheckCircleOutline';
import RejectIcon from '@mui/icons-material/CancelOutlined';
import { useNavigate } from 'react-router-dom';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isHR, setIsHR] = useState(false);
  const [isLineManager, setIsLineManager] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');

  const load = async () => {
    setLoading(true);
    try {
      // check for optional user query param to filter leaves
      const params = new URLSearchParams(location.search);
      const userFilter = params.get('user');
      const data = await leaveAPI.list(userFilter);
      const list = Array.isArray(data) ? data : data.results || [];
      setRequests(list);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const info = await authAPI.getUserInfo();
        if (!mounted) return;
        setCurrentUser(info);
        setIsHR(!!info?.is_hr);
        setIsLineManager(!!info?.is_line_manager);
        // fetch users if manager or hr to show subordinate lists
        if (info?.is_line_manager || info?.is_hr) {
          try {
            const resp = await userAPI.list();
            const users = Array.isArray(resp) ? resp : resp.results || [];
            if (mounted) setAllUsers(users);
          } catch (e) {
            console.error('Failed to fetch users', e);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, []);

  const handleApprove = async (id) => {
    try {
      await leaveAPI.approve(id);
      toast.success('Approved');
      load();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.detail || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveAPI.reject(id);
      toast.success('Rejected');
      load();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.detail || 'Failed to reject');
    }
  };

  const openConfirm = (action, request) => {
    setConfirmAction(action);
    setConfirmRequest(request);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmRequest(null);
  };

  const performConfirm = async () => {
    if (!confirmAction || !confirmRequest) return closeConfirm();
    // double-check authorization client-side before attempting the action
    if (!canActOn(confirmRequest)) {
      toast.error('You are not authorized to perform that action.');
      return closeConfirm();
    }
    try {
      if (confirmAction === 'approve') await handleApprove(confirmRequest.id);
      if (confirmAction === 'reject') await handleReject(confirmRequest.id);
    } finally {
      closeConfirm();
    }
  };

  // Filter by status then group requests by user
  const filteredRequests = requests.filter(r => filterStatus === 'all' ? true : r.status === filterStatus);
  const grouped = filteredRequests.reduce((acc, r) => {
    const userId = r.user?.id || r.user;
    acc[userId] = acc[userId] || { user: r.user, requests: [] };
    acc[userId].requests.push(r);
    return acc;
  }, {});

  // build manager -> subordinates mapping (for HR view)
  const managersMap = allUsers.reduce((acc, u) => {
    const mId = u.manager?.id || null;
    acc[mId] = acc[mId] || [];
    acc[mId].push(u);
    return acc;
  }, {});

  const canActOn = (r) => {
    if (isHR) return true;
    if (isLineManager && currentUser) {
      return r.user?.manager?.id === currentUser.id;
    }
    return false;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Leave Requests</Typography>
      {loading && <Typography>Loading...</Typography>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Filter:</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select labelId="status-filter-label" value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
  <Box sx={{ flex: 1 }} />
  <Button variant="outlined" onClick={() => navigate('/submit-leave')}>Submit Leave</Button>
  {isLineManager && <Button variant="contained" onClick={() => navigate('/my-team') } sx={{ ml: 1 }}>My Team</Button>}
  {/* HR already has a link in the navbar — don't show duplicate button here */}
      </Stack>

      <Grid container spacing={2}>
        {Object.values(grouped).map(({ user, requests: userRequests }) => (
          <Grid item xs={12} key={user?.id || user}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{(user?.username || 'U').charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{user?.username}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.first_name} {user?.last_name} • {user?.email}</Typography>
                  </Box>
                  <Box>
                    <Chip label={`${userRequests.length} request(s)`} />
                  </Box>
                </Stack>
                <Divider sx={{ my: 1 }} />

                {userRequests.map(r => (
                  <Paper key={r.id} sx={{ p: 1, mb: 1 }} variant="outlined">
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
                      <Box sx={{ mb: { xs: 1, sm: 0 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.leave_type} • {r.start_date} → {r.end_date}</Typography>
                        <Typography variant="body2" color="text.secondary">{r.reason}</Typography>
                        <Typography variant="caption" color="text.secondary">Status: <strong>{r.status}</strong></Typography>
                      </Box>
                      <Box>
                        {canActOn(r) ? (
                          <>
                            <Tooltip title="Approve">
                              <IconButton color="success" onClick={() => openConfirm('approve', r)} aria-label="approve" size={isMobile ? 'small' : 'medium'}>
                                <ApproveIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton color="error" onClick={() => openConfirm('reject', r)} aria-label="reject" size={isMobile ? 'small' : 'medium'}>
                                <RejectIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>{confirmAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to {confirmAction} the leave request for <strong>{confirmRequest?.user?.username}</strong> ({confirmRequest?.start_date} → {confirmRequest?.end_date})?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button color={confirmAction === 'approve' ? 'success' : 'error'} variant="contained" onClick={performConfirm}>{confirmAction === 'approve' ? 'Approve' : 'Reject'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveRequests;
