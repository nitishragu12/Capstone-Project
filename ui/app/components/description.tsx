'use client';
import React, { useState } from 'react';
import { Box, Button, Typography, Slide } from '@mui/material';

export default function FeatureSlider() {
  const features = [
    {
      title: "Automated Literature Scanning",
      description: "Utilize advanced Large Language Models to automatically scan and analyze recent road safety literature."
    },
    {
      title: "Relevance Scoring",
      description: "Score articles based on their relevance to road safety, allowing for more efficient literature reviews."
    },
    {
      title: "Summarization",
      description: "Generate concise summaries of articles, highlighting key findings and insights."
    },
    {
      title: "Customizable Interface",
      description: "Interact with the scanning tool through an intuitive and customizable interface tailored to your needs."
    },
    {
      title: "Export Options",
      description: "Easily export results into spreadsheets format for delivery to stakeholders."
    },
  ];

  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0); // Track the current feature being displayed

  // Function to handle sliding to the next feature
  const handleNext = () => {
    setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
  };

  // Function to handle sliding to the previous feature
  const handlePrev = () => {
    setCurrentFeatureIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  };

  return (
    <Box sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Button to slide left */}
      <Button variant="outlined" onClick={handlePrev} sx={{ minWidth: 50, mx: 1 }}>
        {"<"}
      </Button>

      {/* Feature Sliding Section */}
      <Box sx={{ width: '60%', textAlign: 'center', mx: 1 }} >
        <Slide in={true} direction="left" mountOnEnter unmountOnExit>
          <Box key={currentFeatureIndex} sx={{ transition: 'transform 0.01s ease' }}>
            <Typography variant="h5" gutterBottom>
              {features[currentFeatureIndex].title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {features[currentFeatureIndex].description}
            </Typography>
          </Box>
        </Slide>
      </Box>

      {/* Button to slide right */}
      <Button variant="outlined" onClick={handleNext} sx={{ minWidth: 50, mx: 1 }}>
        {">"}
      </Button>
    </Box>
  );
}
