import { useEffect, useRef, useState } from 'react';

export function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => Math.max(0, s - 1));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const start = (secs?: number) => {
    if (typeof secs === 'number') setSeconds(secs);
    setRunning(true);
  };

  const pause = () => setRunning(false);
  const reset = (secs = 0) => { setSeconds(secs); setRunning(false); };

  return { seconds, running, start, pause, reset, setSeconds };
}
