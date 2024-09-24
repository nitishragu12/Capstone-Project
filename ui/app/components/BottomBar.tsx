// bottom-bar.tsx
import React from 'react';
import Link from 'next/link';
import '../Bottom-Bar.css'; // Import the CSS file
import { useData } from '../context/DataContext';
import { CircularProgress, Typography, Box } from '@mui/material'; // Import necessary components

interface BottomBarProps {
  loading: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({ loading }) => {
  const { data } = useData();
  const resultsEnabled = data !== null;

  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bottom-bar">
      {/* Conditionally display loading indicator or traffic light */}
      {loading ? (
        <div className="loading-container">
          <CircularProgress size={20} color="inherit" />
          <Typography variant="body2" sx={{ marginLeft: 1 }}>
            Loading...
          </Typography>
        </div>
      ) : (
        <div className="traffic-light">
          <div className="light red"></div>
          <div className="light yellow"></div>
          <div className="light green"></div>
        </div>
      )}

      {/* Navigation Links */}
      <Link href="#home"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'home')}
      >
        Home
      </Link>
      <Link href="#search"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'search')}
      >
        Search
      </Link>

      {/* Conditionally disable the Results option */}
      <Link
        href={resultsEnabled ? "#results" : "#"}
        className={`bottom-bar-option ${resultsEnabled ? '' : 'disabled'}`}
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'results')}
      >
        Results
      </Link>
    </div>
  );
};

export default BottomBar;
