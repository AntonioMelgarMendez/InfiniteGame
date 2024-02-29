import React from 'react';
import './style.css';

const Leaderboard = ({ leaderboardData }) => {
  const robohashBaseUrl = 'https://robohash.org/';

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div className="w-80 h-80 flex flex-col border-8 border-black">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 p-4 bg-white border-b-8 border-black text-center">
          Leaderboard
        </h1>
        <div className="flex-1 bg-white overflow-y-auto p-4 overflow-hidden">
          <ul className="list-none p-0">
            {leaderboardData.map((entry, index) => (
              <li
                key={index}
                className={`border-b border-gray-400 p-4 ${
                  index === 0 ? 'bg-yellow-200' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : ''
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={`${robohashBaseUrl}${entry.name}-${entry.level}.png`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div>
                    <span className="text-lg font-semibold text-gray-700">{entry.name}</span>
                    <br />
                    <span className="text-sm text-gray-500">Nivel: {entry.level}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
