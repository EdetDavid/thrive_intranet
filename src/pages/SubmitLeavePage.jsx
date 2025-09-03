import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LeaveForm from '../components/Leaves/LeaveForm';

const SubmitLeavePage = () => {
  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Submit Leave Request</Typography>
      <Box sx={{ maxWidth: 600 }}>
        <LeaveForm onSuccess={() => { /* optionally navigate or show message */ }} />
      </Box>
    </Container>
  );
};

export default SubmitLeavePage;
