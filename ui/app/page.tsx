'use client';
import React, { useState, useRef, useEffect } from 'react';
import HomePage from './home/page'; // Ensure the path is correct
import Search from './search/page';
import Results from './results/page';
import About from './about/page'; // Import the About component
import style from './page.module.css';
import { useData } from './context/DataContext';
import BottomBar from './components/BottomBar';

export default function Page() {
  const { data } = useData();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data && resultsRef.current) {
      const elementPosition = resultsRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition + resultsRef.current.offsetHeight - 800,
        behavior: 'smooth',
      });
    }
  }, [data]);

  return (
    <div className={style.main}>
      {/* Display HomePage */}
      <div className={style['home-container']} id={"home"}>
        <HomePage />
      </div>

      {/* Search Page Container */}
      <div className={style['searchpage-container']} ref={resultsRef} id={"search"}>
        {/* Pass padding via CSS variable or props */}
        <div className={style['search-container']} style={{ '--padding': '3rem' } as React.CSSProperties}>
          <Search /> {/* Render the Search component here */}
        </div>
      </div>

      {/* Display the Results page according to the showResults status */}
      {data && (
        <div className={style['result-container']} ref={resultsRef} id={"results"}>
          <Results />
        </div>
      )}

      {/* Include the About section at the end */}
      <div className={style['about-container']} id={"about"}>
        <About />
      </div>

      <BottomBar />
    </div>
  );
}
