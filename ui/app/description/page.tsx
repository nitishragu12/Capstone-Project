import React from 'react';
import { Paper, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';

const Description = () => {
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
    {
      title: "User-Friendly Design",
      description: "Designed with user experience in mind to ensure easy navigation and interaction."
    },
  ];

  return (
    <Paper elevation={0} sx={{ padding: 3, marginTop: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Features of Our App
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <List>
            {features.map((feature, index) => (
              <ListItem key={index}>
                <ListItemText primary={feature.title} secondary={feature.description} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Description;
