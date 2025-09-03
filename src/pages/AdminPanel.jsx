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
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Tooltip,
  Stack,
  Divider,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { userAPI } from "../api/apiService";
import Navbar from "../components/Navbar";
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [chosenManager, setChosenManager] = useState('');

  const fetchAllUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userAPI.list();
      const list = Array.isArray(response) ? response : response.results || [];
      setUsers(list);
      setAvailableManagers(list.filter(u => u.is_line_manager));
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', first_name: '', last_name: '' });
  const [processing, setProcessing] = useState(false);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);

  const handleCreateUser = async () => {
    setProcessing(true);
    try {
      // backend sets default password to Thrive@123
      await userAPI.createUser(newUser);
      toast.success('User created with default password');
      setNewUser({ username: '', email: '', first_name: '', last_name: '' });
      handleAddClose();
      fetchAllUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchAllUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

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

  const handleLineManagerChange = async (userId, isLineManager) => {
    try {
      const response = await userAPI.updateLineManager(userId, isLineManager);
      toast.success(response.detail || "Line manager privilege updated");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_line_manager: isLineManager } : user
        )
      );
    } catch (err) {
      console.error('Error updating line manager privilege:', err);
      toast.error(err.response?.data?.detail || "Failed to update line manager privilege");
    }
  };

  return (
    <>
      <Container maxWidth={false} sx={{ mt: { xs: 7, sm: 10 }, px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '1800px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }, fontWeight: 700, letterSpacing: 1 }}>
            Admin Panel
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Add User">
              <IconButton color="primary" onClick={handleAddOpen} sx={{ ml: 2, bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }} aria-label="add-user">
                <AddIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Assign Manager to selected users">
              <IconButton color="secondary" onClick={() => { if (selectedIds.length===0){ toast.info('Select users first'); } else { setChosenManager(''); setManagerDialogOpen(true);} }} sx={{ ml: 1 }} aria-label="assign-manager">
                <PeopleAltIcon />
              </IconButton>
            </Tooltip>

            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>{selectedIds.length} selected</Typography>
          </Stack>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress size={48} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : isMobile ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
            {users.map((user) => (
              <Card key={user.id} sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'visible', background: '#f9f9fb' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.2rem' } }}>{user.username}</Typography>
                    {user.is_hr && <Chip label="HR" color="primary" size="small" sx={{ fontWeight: 600 }} />}
                    {user.is_line_manager && <Chip label="Line Manager" color="secondary" size="small" sx={{ fontWeight: 600 }} />}
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary"><strong>Email:</strong> {user.email}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>First Name:</strong> {user.first_name}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Last Name:</strong> {user.last_name}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                    <Tooltip title="Delete User">
                      <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Tooltip title="Toggle HR Privilege">
                        <Chip label="HR" color={user.is_hr ? 'primary' : 'default'} size="small" sx={{ fontWeight: 600 }} onClick={() => handleHRChange(user.id, !user.is_hr)} clickable />
                      </Tooltip>
                      <Switch checked={user.is_hr} onChange={(e) => handleHRChange(user.id, e.target.checked)} color="primary" />
                      <Tooltip title="Toggle Line Manager">
                        <Chip label="Line Manager" color={user.is_line_manager ? 'secondary' : 'default'} size="small" sx={{ fontWeight: 600 }} onClick={() => handleLineManagerChange(user.id, !user.is_line_manager)} clickable />
                      </Tooltip>
                      <Switch checked={user.is_line_manager} onChange={(e) => handleLineManagerChange(user.id, e.target.checked)} color="secondary" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: '#f9f9fb' }}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <TableContainer sx={{ maxHeight: '70vh' }}>
                  <Table stickyHeader sx={{ minWidth: { xs: 700, sm: 900, md: 1100 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 48 }} />
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'background.paper', fontSize: '1rem' }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'background.paper', fontSize: '1rem' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'background.paper', fontSize: '1rem' }}>First Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'background.paper', fontSize: '1rem' }}>Last Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'background.paper', fontSize: '1rem' }}>Roles</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'background.paper', fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s' }}>
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={selectedIds.includes(user.id)} onChange={() => setSelectedIds(prev => prev.includes(user.id) ? prev.filter(x=>x!==user.id) : [...prev, user.id])} />
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {user.is_hr && <Chip label="HR" color="primary" size="small" sx={{ fontWeight: 600 }} />}
                          {user.is_line_manager && <Chip label="Line Manager" color="secondary" size="small" sx={{ fontWeight: 600 }} />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Tooltip title="Toggle HR Privilege">
                            <Switch checked={user.is_hr} onChange={(e) => handleHRChange(user.id, e.target.checked)} color="primary" />
                          </Tooltip>
                          <Tooltip title="Toggle Line Manager">
                            <Switch checked={user.is_line_manager} onChange={(e) => handleLineManagerChange(user.id, e.target.checked)} color="secondary" />
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        </TableContainer>
        </Box>
      </Paper>
        )}
      </Container>

      <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
        <DialogTitle>Create User (default password set to Thrive@123)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Username" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} fullWidth />
            <TextField label="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} fullWidth />
            <TextField label="First name" value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} fullWidth />
            <TextField label="Last name" value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} disabled={processing}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={processing || !newUser.username}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={managerDialogOpen} onClose={() => setManagerDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Manager to Selected Users</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Selected users: {selectedIds.length}</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
              {users.filter(u => selectedIds.includes(u.id)).map(u => (
                <Chip key={u.id} label={`${u.username}${u.first_name ? ` (${u.first_name})` : ''}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Stack>

            <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
              <InputLabel id="manager-select-label">Choose manager</InputLabel>
              <Select
                labelId="manager-select-label"
                id="manager-select"
                value={chosenManager}
                label="Choose manager"
                onChange={(e) => setChosenManager(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {availableManagers.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.username}{m.first_name ? ` (${m.first_name})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManagerDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!chosenManager) { toast.error('Please pick a manager'); return; }
            try {
              setProcessing(true);
              await Promise.all(selectedIds.map(id => userAPI.setManager(id, chosenManager)));
              toast.success('Manager assigned to selected users');
              setSelectedIds([]);
              fetchAllUsers();
              setManagerDialogOpen(false);
            } catch (err) {
              console.error(err);
              toast.error('Failed to assign manager');
            } finally { setProcessing(false); }
          }} disabled={processing || !chosenManager}>Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminPanel;
