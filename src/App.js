// App.js
import React, { useState } from 'react';
import RenderMain from './components/RenderMain';
import MainMenu from './components/MainMenu';
import Leaderboard from './components/LeaderBoard';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]); // Agrega este estado

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setShowLeaderboard(false);
  };

  const handleLeaderboard = () => {
    // Simula datos de leaderboard, reemplázalos con tu lógica de obtención de datos reales
    const fakeLeaderboardData = [
      { name: 'Usuario1', level: 10 },
      { name: 'Usuario2', level: 8 },
      { name: 'Usuario3', level: 6 },
      {name:'Usuario4', level:7},
      {name:'Usuario10',level:10},
      
      // ... más datos ...
    ];

    setShowLeaderboard(true);
    setLeaderboardData(fakeLeaderboardData);
  };

  return (
    <div>
      {gameStarted ? (
        <RenderMain onBackToMenu={handleBackToMenu} />
      ) : (
        showLeaderboard ? (
          <Leaderboard leaderboardData={leaderboardData} />
        ) : (
          <MainMenu onStartGame={handleStartGame} onLeaderboard={handleLeaderboard} />
        )
      )}
    </div>
  );
};

export default App;
