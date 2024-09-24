'use client';
import React, { useState, useRef, useEffect  } from 'react';
import HomePage from './home/page'; //Make sure the path is correct
import Search from './search/page';
import Results from './results/page';
import style from './page.module.css';
import { useData } from './context/DataContext';

export default function Page() {
  const { data } = useData();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data && resultsRef.current) {
      const elementPosition = resultsRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition + resultsRef.current.offsetHeight -800, 
        behavior: 'smooth',
      });
    }
  }, [data]);

  return (
    <div className={style.main}>
      {/* display HomePage */}
      <div className={style['home-container']} id={"home"}>
        <HomePage />
      </div>
      {/* Display Search page*/}
      <div className={style['search-container']} id={"search"}>
        <Search /> {/* Pass a function that handles the click*/}
      </div>

      {/* Display the Results page according to the showResults status */}
      {data && (
        <div className={style['result-container']} ref={resultsRef} id={"results"}> {/* Make sure the class name is correct */}
          <Results />
        </div>
      )}
    </div>
  );
}
