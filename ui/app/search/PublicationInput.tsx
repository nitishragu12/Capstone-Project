import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function InputFileUpload({ onChange, className }: { 
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; 
  className?: string; 
}) {
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      className={className}
    >
      Import CSV
      <VisuallyHiddenInput type="file" accept=".csv" onChange={onChange} />
    </Button>
  );
}