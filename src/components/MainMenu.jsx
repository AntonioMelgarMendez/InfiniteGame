import React from 'react';
import gameLogo from '../sources/puzzlelogo.png';

const MainMenu = ({ onStartGame, onLeaderboard }) => {
  const containerSize = 500; // Tamaño del contenedor
  const logoSize = 30; // Tamaño del logo

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="bg-white border-4 border-black p-8 text-center flex flex-col items-center w-{width} h-{width}">
        <h1 className="text-2xl font-bold mb-4">Infinite Puzzle</h1>
        <div className="mb-8">
          <img src={gameLogo} alt="Game Logo" width={240} height={240} />
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={onStartGame}
            className="w-32 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Jugar
          </button>
          <button
            onClick={onLeaderboard}
            className="w-32 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
