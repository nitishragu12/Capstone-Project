// app/about.tsx (or pages/about.tsx based on your structure)

"use client"; // Ensure this page can use client components
import React from 'react';
import { Box, Typography, Link, Card, CardHeader, CardContent } from '@mui/material';
import Grid from "@mui/material/Unstable_Grid2";

const About = () => {
  const groupMembers = [
    { id: "23856227", name: "Ziqi Chen", username: "ziqichen55555", github: "https://github.com/ziqichen55555", avatar: "https://avatars.githubusercontent.com/u/130896453?s=60&v=4" },
    { id: "24139368", name: "Krish Goti", username: "krishgoti2002", github: "https://github.com/krishgoti2002", avatar: "https://avatars.githubusercontent.com/u/77385930?s=60&v=4" },
    { id: "23740534", name: "Chung Hei Tse", username: "maxtse25", github: "https://github.com/maxtse25", avatar: "https://avatars.githubusercontent.com/u/98444048?s=60&v=4" },
    { id: "23926903", name: "Shijun Shao", username: "Halffancyy", github: "https://github.com/Halffancyy", avatar: "https://avatars.githubusercontent.com/u/129271532?s=60&v=4" },
    { id: "23799876", name: "Hui-Ling Huang", username: "somni1oquist", github: "https://github.com/somni1oquist", avatar: "https://avatars.githubusercontent.com/u/145635256?s=60&v=4" },
    { id: "23689789", name: "Nitish Raguraman", username: "nitishragu12", github: "https://github.com/nitishragu12", avatar: "https://avatars.githubusercontent.com/u/69626001?s=60&v=4" },
  ];

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <h1>About</h1>
      
      <Typography variant="body1">
        This project involves automating the literature scanning process for the Western Australian Centre for Road Safety Research (WACRSR) using Large Language Models (LLMs). 
        The goal is to reduce the time-intensive manual effort of reviewing road safety literature by creating a system that efficiently retrieves, processes, and displays relevant articles. 
        Key features include an advanced search interface allowing users to filter by keywords, date ranges, authors, and more. 
        The system integrates a cost-effective LLM to extract and summarize critical information, presenting results in a user-friendly format. 
        It also offers an export function for downloading data in CSV format. 
        The project is built using Python and React, with future deployment planned via Docker.
        Security measures, such as API key protection and logging practices, ensure the system remains secure. 
        Through this automated approach, the WACRSR aims to streamline research efforts and increase productivity.
      </Typography>
      
      <h3>Group Members</h3>

      <Grid container spacing={2} justifyContent="center">
        {groupMembers.map((member) => (
          <Grid key={member.id} xs={6} md={4}>
            <Card>
              <CardHeader
                avatar={<img src={member.avatar} alt={member.name} style={{ borderRadius: "50%", width: 60, height: 60 }} />}
                title={member.name}
                subheader={
                  <Link href={member.github} target="_blank" rel="noopener noreferrer">
                    {member.username}
                  </Link>
                }
              />
              {/* <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  This impressive paella is a perfect party dish and a fun meal to cook
                  together with your guests. Add 1 cup of frozen peas along with the mussels,
                  if you like.
                </Typography>
              </CardContent> */}
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        &copy; 2024 PaperMate. All rights reserved.
      </Typography>
    </Box>
  );
};

export default About;
