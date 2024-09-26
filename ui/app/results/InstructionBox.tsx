import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  InputAdornment,
  IconButton,
  TextField,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Tooltip,
  Divider
} from '@mui/material';
import { getChatHistory, giveInstruction } from '../actions';
import { useData } from '../context/DataContext';
import { useLoading } from '../context/LoadingContext';
import { useError } from '../context/ErrorContext';

const columns: GridColDef[] = [
  {
    field: 'instruction',
    headerName: 'Instruction',
    flex: 1,
    renderCell: (params) => (
      <Tooltip title={params.row.timestamp} placement="top" arrow>
        <span>{params.value}</span>
      </Tooltip>
    ), // Show timestamp in tooltip on hover
  }
];

// New InputContainer component
function InputContainer({ inputValue, onChange, onSubmit }: { inputValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSubmit: () => void }) {
  return (
    <Box component="div">
      <TextField
        placeholder="Add Instruction"
        variant="standard"
        multiline
        minRows={1}
        maxRows={5}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onSubmit}>
                ⏎
              </IconButton>
            </InputAdornment>
          ),
        }}
        value={inputValue}
        onChange={onChange}
        onKeyPress={(e: any) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();  // Prevents Enter from creating a new line
            onSubmit();
          }
        }}
        fullWidth
      />
    </Box>
  );
}

export default function InstructionBox() {
  const [rows, setRows] = React.useState<{ id: number; instruction: string ;timestamp: string}[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [selectedInstruction, setSelectedInstruction] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data, setData } = useData();
  const { setError } = useError();
  const { loading, setLoading } = useLoading();

  React.useEffect(() => {
    const sessionData = sessionStorage.getItem('chatHistory') as string;
    setRows(sessionData ? JSON.parse(sessionData) : []);
    if (!sessionData) {
      getChatHistory()
        .then((response) => {
          const chatHistory = response.data.map((instruction: string, index: number) => ({
            id: index,
            instruction,
            timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' }), // Add timestamp in Perth timezone
          }));
          sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
          setRows(chatHistory);
        })
        .catch(error => {
          console.log('Error fetching chat history:', error);
          setError(`${error.response.data.error}: ${error.response.data.message}`);
        });
    }
  }, [setError]);

  const handleSend = () => {
    if (inputValue.trim()) {
      setLoading(true, "chat-progress");
      const timestamp = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' });
      setRows((prevRows) => {
        const newRows = prevRows ? [...prevRows] : [];
        const newId = newRows.length ? newRows[newRows.length - 1].id + 1 : 0;
        newRows.push({ id: newId, instruction: inputValue, timestamp });
        sessionStorage.setItem('chatHistory', JSON.stringify(newRows));
        return newRows;
      });
      setInputValue('');
      giveInstruction(inputValue)
        .then((response) => {
          setData(response.data.papers);
          setLoading(false);
        })
        .catch((error) => {
          setError(`${error.response.data.error}: ${error.response.data.message}`);
          setLoading(false);
        });
    }
  };

  const handleRowClick = (params: any) => {
    setSelectedInstruction(params.row.instruction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Paper className="result-grid-instruction">
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        disableColumnSelector={true}
        hideFooter
        onRowClick={handleRowClick}
      />
      <InputContainer
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleSend}
      />
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Instruction Details:</DialogTitle>
        <Divider />
        <DialogContent>
          <Box>{selectedInstruction}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
