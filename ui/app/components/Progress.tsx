import React, { useEffect, useRef } from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { io, Socket } from 'socket.io-client';

const Overlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: 'rgba(18, 18, 18, 0.9)',
  ...theme.applyStyles('light', {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  }),
}));

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size={"3rem"} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

interface ProgressProps {
  eventName: string; // Add an event name prop to listen to specific events
}

export default function Progress({ eventName }: ProgressProps) {
  const [progress, setProgress] = React.useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http//localhost:5000', {
      transports: ['websocket'],
    });
    const socket = socketRef.current;

    // Listen to the event passed as a prop
    socket.on(eventName, (data: any) => {
      setProgress(data.progress);
    });

    return () => {
      // Cleanup the listener on unmount
      socket.off(eventName);
    };
  }, [eventName]);

  return (
    <Overlay>
      <CircularProgressWithLabel value={progress} />
    </Overlay>
  );
}
