'use client'
import React, { useState } from 'react';
import ResultGrid from './ResultGrid';
import InstructionBox from './InstructionBox';
import { FormControlLabel, Switch } from '@mui/material';
import './ResultPage.css';  // Make sure to import the CSS

const ResultContainer: React.FC = () => {
  const [showInstruction, setShowInstruction] = useState(false);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowInstruction(event.target.checked);
  };

  return (
    <div className="result-page-container">
      {/* Header */}
      <div className="header">
        <h1>Search Results</h1>
      </div>

      {/* Instruction Box Toggle */}
      <div className="instruction-box-toggle">
        <FormControlLabel
          control={
            <Switch
              checked={showInstruction}
              onChange={handleSwitchChange}
              color="primary"
            />
          }
          label="Show Instruction Box"
        />
      </div>
      {/* Data Grid */}
      <div className="data-grid-wrapper">
        <ResultGrid showInstruction={showInstruction} />
      </div>
    </div>
  );
};

export default ResultContainer;
