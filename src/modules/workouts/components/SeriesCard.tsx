import React from 'react';
import type { RoutineExercise } from '../../../shared/types/workout.types';

interface Props {
  series: RoutineExercise;
  index: number;
  onStartSet?: (seconds?: number) => void;
}

const SeriesCard: React.FC<Props> = ({ series, index, onStartSet }) => {
  const title = series.exercise?.name ?? `Ejercicio ${index + 1}`;
  const imageUrl = series.exercise?.instructions ?? '';
  const totalSeries = series.sets ?? 1;
  const currentSeriesLabel = `Serie ${Math.min(2, totalSeries)} de ${totalSeries}`; // placeholder for current series

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="w-full h-44 bg-gray-100 rounded-md overflow-hidden mb-4 flex items-center justify-center">
        {imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" /> : <div className="text-gray-400">Push Ups Exercise</div>}
      </div>

      <div className="text-center mb-3">
        <h4 className="font-bold text-lg">{title}</h4>
        <div className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1">{currentSeriesLabel}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-3 flex items-center justify-center">
        <div className="flex items-center gap-6">
          <button className="w-10 h-10 rounded-full border flex items-center justify-center">-</button>
          <div className="text-2xl font-semibold">{series.repsMin ?? 0}</div>
          <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">+</button>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button onClick={() => onStartSet?.(series.restSeconds)} className="bg-orange-500 text-white px-6 py-3 rounded-full text-lg">Start</button>
      </div>
    </div>
  );
};

export default SeriesCard;
