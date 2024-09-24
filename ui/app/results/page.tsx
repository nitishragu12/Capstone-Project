'use client'
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import style from '../page.module.css';
import ResultGrid from './ResultGrid';


export default function Results() {
  return (
    <>
      <div className={style.main}>
        <div className={style["papermate-container"]}>
          <Header />
          <ResultGrid />
          <Footer />
        </div>
      </div>
    </>
  );
}