import React from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Box, Grid, Paper, Typography } from '@mui/material';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const ChartDashboard = () => {
  // Generate random data for Pie Charts
  const generatePieData = () => ({
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
    datasets: [
      {
        data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  });

  // Generate random data for Line Chart
  const generateLineData = () => ({
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Dataset 1',
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  });

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Graphiques
      </Typography>
      <Grid container spacing={3}>
        {/* 4 Pie Charts */}
        {[1, 2, 3, 4].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Camembert {index + 1}
              </Typography>
              <Pie data={generatePieData()} />
            </Paper>
          </Grid>
        ))}

        {/* Line Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Graphique de Courbes
            </Typography>
            <Line data={generateLineData()} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartDashboard;
