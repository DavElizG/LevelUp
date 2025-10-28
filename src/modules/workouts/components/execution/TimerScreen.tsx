import React from 'react';
import { useTimer } from '../../hooks/useTimer';

interface Props {
  initialSeconds?: number;
  onClose?: () => void;
}

const format = (s: number) => {
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const TimerScreen: React.FC<Props> = ({ initialSeconds = 60, onClose }) => {
  const { seconds, running, start, pause, reset, setSeconds } = useTimer(initialSeconds);

  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-between mb-4">
        <button onClick={onClose} className="text-gray-600">←</button>
        <h3 className="text-lg font-semibold">Descanso</h3>
        <div style={{ width: 24 }} />
      </div>

      <div className="w-full flex items-center justify-center mb-6">
        <div className="w-48 h-48 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="text-2xl font-semibold">{format(seconds)}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 justify-center">
        {!running ? (
          <button onClick={() => start()} className="p-3 bg-black text-white rounded-full">Play</button>
        ) : (
          <button onClick={pause} className="p-3 bg-gray-200 rounded-full">Pause</button>
        )}
        <button onClick={() => reset(initialSeconds)} className="p-3 bg-gray-100 rounded-full">Reset</button>
        <button onClick={() => setSeconds(s => s + 10)} className="p-3 bg-gray-100 rounded-full">+10s</button>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <button onClick={onClose} className="w-full bg-orange-500 text-white py-3 rounded">Continuar entrenamiento</button>
      </div>
    </div>
  );
}

export default TimerScreen;
