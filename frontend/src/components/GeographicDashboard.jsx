import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import RegionMap from "./RegionMap";
import { PieChart, LineChart } from "./ChartComponents";

const GeographicDashboard = forwardRef(({loadSession, selectedRegion}, ref) => {
  const [datas, setDatas] = useState([]);

  useImperativeHandle(ref, () => ({
    setDatas: (newDatas) => {
      setDatas(newDatas || []);
    }
  }));

  useEffect(() => {
      loadSession();
      console.log(selectedRegion);
    }, [selectedRegion]);

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f4f6f8", height: "100%" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Geographic Dashboard
      </Typography>
      <RegionMap selectedRegion={selectedRegion} />
      <Grid container spacing={3} sx={{ marginTop: 4 }}>
        {datas.map((data, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6" align="center" gutterBottom>
                {data.chartType === "pie" ? "Pie Chart" : "Line Chart"} {index + 1}
              </Typography>
              {data.chartType === "pie" ? (
                <PieChart chartData={data} />
              ) : (
                <LineChart chartData={data} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

export default GeographicDashboard;
