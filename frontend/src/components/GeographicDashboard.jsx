import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Box, Grid, Paper, Typography, IconButton, Divider } from "@mui/material";
import { PieChart, LineChart } from "./ChartComponents";
import RefreshIcon from "@mui/icons-material/Refresh";
import "../styles/GeographicDashboard.css";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const GeographicDashboard = forwardRef((props, ref) => {
  const [datas, setDatas] = useState([]);

  useImperativeHandle(ref, () => ({
    setDatas: (newDatas) => {
        if (typeof newMessages === "function") {
          setDatas((prevDatas) => newMessages(newDatas));
        } else {
          setDatas(newDatas || []); // Ensure newMessages defaults to an empty array
        }
      },
    }));

  // Separate pie charts and line charts
  const pieCharts = datas.filter(data => data.chartType === "pie");
  const lineCharts = datas.filter(data => data.chartType === "line");
  return <div></div>

  // return (
  //   <Box sx={{ padding: 4, backgroundColor: "#f4f6f8", height: "100%" }}>
  //     <Grid container spacing={3}>
  //       {/* Render pie charts together */}
  //       {pieCharts.length > 0 &&
  //         pieCharts.map((data, index) => (
  //           <Grid item xs={12} sm={6} md={3} key={index}>
  //             <Paper elevation={3} sx={{ padding: 2 }}>
  //               <Typography variant="h6" align="center" gutterBottom>
  //                 Chart {index + 1}
  //               </Typography>
  //               <Box>
  //                 {/* Render chart based on chartType */}
  //                 {data.chartType === "pie" && <PieChart chartData={data} />}
  //               </Box>
  //             </Paper>
  //           </Grid>
  //         ))}
  
  //       {/* Render line charts together */}
  //       {lineCharts.length > 0 && (
  //         <Grid item xs={12}>
  //           <Paper elevation={4} sx={{ padding: 3 }}>
  //             <Typography variant="h6" align="center" gutterBottom>
  //               Line Charts
  //             </Typography>
  //             <Divider sx={{ marginY: 2 }} />
  //             <Box
  //               sx={{
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 flexWrap: "wrap",
  //                 gap: 3,
  //               }}
  //             >
  //               {lineCharts.map((data, index) => (
  //                 <Box key={index} sx={{ width: "50%" }}>
  //                   <LineChart chartData={data} />
  //                 </Box>
  //               ))}
  //             </Box>
  //           </Paper>
  //         </Grid>
  //       )}
  //     </Grid>
  //   </Box>
  // );

});
  

export default GeographicDashboard;