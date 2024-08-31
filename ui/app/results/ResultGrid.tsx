'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Paper, Switch } from '@mui/material';

interface Result {
  title: string;
  abstract: string;
  author: string;
  publication: string;
  publish_date: string;
  relevance: number | null;
  synopsis: string;
}

// Define grid columns
const genColDefs = (): GridColDef[] => {
  const resultKeys: (keyof Result)[] = [
    'title',
    'abstract',
    'author',
    'publication',
    'publish_date',
    'relevance',
    'synopsis'
  ];

  return resultKeys.map((key) => {
    const baseColumn: GridColDef = {
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      width: 100,
      sortable: true,
    };
  
    if (key === 'abstract' || key === 'synopsis') {
      baseColumn.width = 250; // Wider columns for long text
    }
  
    if (key === 'relevance') {
      baseColumn.type = 'number'; // Set type for numeric fields
    }
  
    return baseColumn;
  });
};

export default function ResultGrid() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if data exists in sessionStorage
    const storedData = sessionStorage.getItem('papersData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setRows(parsedData);
      setLoading(false);
    } else {
      // const fetchData = async () => {
      //   try {
      //     const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
      //     const response = await fetch(`${baseApiUrl}/papers/search?query=crash`);
      //     const data = await response.json();
      //     const formattedData = data.map((item: Result, index: number) => ({
      //       id: index + 1, // Unique ID for each row
      //       ...item,
      //     }));
      //     setRows(formattedData);
      //     setLoading(false);
      //     // Store data in sessionStorage
      //     sessionStorage.setItem('papersData', JSON.stringify(formattedData));
      //   } catch (error) {
      //     console.error('Error fetching data:', error);
      //   }
      // };

      // fetchData();
    }
  }, []);

  return (
    <div style={{ height: 350, width: '100%' }}>
      <Paper>
        <DataGrid
          rows={rows}
          columns={genColDefs()}
          initialState={{
            pagination: { 
              paginationModel: {pageSize: 5}
             },
          }}
          loading={loading}
          getRowId={(row) => row.doi}
          disableColumnMenu
          disableRowSelectionOnClick
        />
      </Paper>
    </div>
  );
}