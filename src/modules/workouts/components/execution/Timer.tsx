import React from 'react';
import { useTimer } from '../../hooks/useTimer';

interface Props {
  initialSeconds?: number;
}

const format = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const Timer: React.FC<Props> = ({ initialSeconds = 60 }) => {
  const { seconds, running, start, pause, reset } = useTimer(initialSeconds);

  return (
    <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center space-y-4">
      <div className="text-3xl font-mono">{format(seconds)}</div>
      <div className="flex space-x-3">
        {!running ? (
          <button onClick={() => start()} className="px-4 py-2 bg-orange-500 text-white rounded">Play</button>
        ) : (
          <button onClick={pause} className="px-4 py-2 bg-gray-200 rounded">Pause</button>
        )}
        <button onClick={() => reset(initialSeconds)} className="px-4 py-2 bg-gray-100 rounded">Reset</button>
      </div>
    </div>
  );
};

export default Timer;
