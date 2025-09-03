import React, { useState } from 'react';
import { TextField, Button, Box, MenuItem } from '@mui/material';
import { leaveAPI } from '../../api/apiService';
import { toast } from 'react-toastify';

const leaveTypes = [
  'Annual',
  'Sick',
  'Unpaid',
  'Maternity',
  'Paternity',
];

const LeaveForm = ({ onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState(leaveTypes[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveAPI.create({ start_date: startDate, end_date: endDate, leave_type: leaveType, reason });
      toast.success('Leave request submitted');
      setStartDate('');
      setEndDate('');
      setReason('');
      onSuccess && onSuccess();
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
      <TextField label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
      <TextField select label="Leave Type" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
        {leaveTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} multiline rows={4} />
      <Button type="submit" variant="contained" disabled={submitting}>Submit Request</Button>
    </Box>
  );
};

export default LeaveForm;
