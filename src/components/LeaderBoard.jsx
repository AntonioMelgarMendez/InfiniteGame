// Leaderboard.js
import React from 'react';

const Leaderboard = ({ leaderboardData }) => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="w-500 h-400 bg-white border-8 border-black p-8 text-center overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
        <ul className="list-none p-0">
          {leaderboardData.map((entry, index) => (
            <li key={index} className="border-b border-black p-2">
              {/* Mostrar los datos de cada entrada del leaderboard */}
              {entry.name} - Nivel: {entry.level}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;

