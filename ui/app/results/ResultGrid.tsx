import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import { Paper, Box } from '@mui/material';
import { useData } from '../context/DataContext';
import { useMessage } from '../context/MessageContext';
import { useLoading } from '../context/LoadingContext';
import InstructionBox from './InstructionBox';
import PaperDetail from './PaperDetail';
import './ResultPage.css';

const genColDefs = (data: any[]): GridColDef[] => {
  if (!data || data.length === 0) return [];

  const resultKeys = Object.keys(data[0]);

  return resultKeys
    .filter((key) => key !== 'mutation')
    .map((key) => {
      const baseColumn: GridColDef = {
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        flex: 1,
        sortable: true,
      };

      return baseColumn;
    });
};

interface ResultGridProps {
  showInstruction: boolean;
}

const ResultGrid: React.FC<ResultGridProps> = ({ showInstruction }) => {
  const { setMessage } = useMessage();
  const { data, setData } = useData();
  const { loading } = useLoading();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [open, setOpen] = useState<boolean | null>(false);

  useEffect(() => {
    if (Array.isArray(data)) {
      setRows(data);
    } else {
      setRows([]);
    }
  }, [data]);

  const handleRowClick = (params: any) => {
    setOpen(true);
    setSelectedRow(params.row);
  };

  return (
    <div className="result-grid-container">
      {/* DataGrid Container */}
      <div className="result-grid-wrapper">
        <Paper className="result-grid-paper">
          {open && <PaperDetail open={open} onClick={() => { setOpen(false); }} row={selectedRow} />}
          <DataGrid
            rows={rows}
            columns={genColDefs(data as any[])}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            loading={loading}
            slotProps={{
              loadingOverlay: {
                variant: 'skeleton',
                noRowsVariant: 'skeleton',
              },
            }}
            getRowId={(row) => row.doi}
            disableRowSelectionOnClick
            disableColumnMenu={true}
            slots={{
              toolbar: GridToolbar
            }}
            className="data-grid-style"
            onRowClick={handleRowClick}
          />
        </Paper>
      </div>

      {/* Instruction Box Container */}
      {showInstruction && (
        <div className="result-grid-instruction">
          <InstructionBox />
        </div>
      )}
    </div>
  );
};

export default ResultGrid;
