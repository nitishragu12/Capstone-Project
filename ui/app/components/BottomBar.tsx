import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../Bottom-Bar.css'; // Import the CSS file
import { useData } from '../context/DataContext';
import { useLoading } from '../context/LoadingContext';
import Progress from './Progress';

const BottomBar: React.FC = () => {
  const { data } = useData();
  const { loading, loadEvent } = useLoading();
  const [resultsAvailable, setResultsAvailable] = useState(false);

  useEffect(() => {
    // If data exists (indicating results are available), set resultsAvailable to true
    if (data && data.length > 0) {
      setResultsAvailable(true);
    } else {
      setResultsAvailable(false);
    }
  }, [data]); // Re-run the effect when data changes

  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bottom-bar">
      {/* Conditionally display loading indicator */}
      {loading ? <Progress eventName={loadEvent} /> : null}

      {/* Navigation Links */}
      <Link
        href="#home"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'home')}
      >
        Home
      </Link>

      <Link
        href="#search"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'search')}
      >
        Search
      </Link>

      {/* Conditionally render Result link with disabled style and behavior if results are not available */}
      <Link
        href="#results"
        className={`bottom-bar-option ${resultsAvailable ? '' : 'disabled'}`}
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
          if (!resultsAvailable) e.preventDefault(); // Block click if results are not available
          else handleScroll(e, 'results');
        }}
      >
        Result
      </Link>

      <Link
        href="#about"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'about')}
      >
        About
      </Link>
    </div>
  );
};

export default BottomBar;
