import React from 'react';
import LeaveRequests from '../components/Leaves/LeaveRequests';
import { Box, Grid } from '@mui/material';

const LeavePage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <LeaveRequests />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeavePage;
