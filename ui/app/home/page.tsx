"use client";
import React from "react";
import Image from "next/image";
import style from "../page.module.css"; // Assuming your CSS module file
import FeatureSlider from "../components/description";
import Grid from "@mui/material/Unstable_Grid2";
import { Box } from "@mui/material";

export default function HomePage() {
  return (
    <Grid
      container
      spacing={1} // Reduced spacing between grid items
      justifyContent="center" // Center horizontally
      alignItems="center" // Center vertically
      sx={{ height: "100vh" }} // Make sure container takes full viewport height
      className={style['home-container']}
    >
      {/* Logo Section */}
      <Grid xs={12} md={4}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Image
            src="/car.jpg"
            alt="Logo"
            width={300} // Adjusted size if needed
            height={200}
            className={style.logo}
          />
        </Box>
      </Grid>

      {/* Title Section */}
      <Grid xs={12} md={8}>
        <Box textAlign="left" pl={2} /* Added padding to bring text closer to image */>
          <h1>PaperMate</h1>
          <p>
            Your Gateway to Streamlined Research – Search, Analyse, and Excel in
            One Click.
          </p>
        </Box>
      </Grid>

      {/* Feature Slider Section */}
      <Grid xs={12}>
        <Box textAlign="center">
          <FeatureSlider />
        </Box>
      </Grid>
    </Grid>
  );
}
