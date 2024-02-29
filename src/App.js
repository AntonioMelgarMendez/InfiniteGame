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
      { name: 'Daniel', level: 99, avatar: {} },
      { name: 'Ozuna', level: 78, avatar: {} },
      { name: 'Travis', level: 70, avatar: {} },
      { name: 'DevilMan', level: 66, avatar: {} },
      { name: 'Maradona', level: 10, avatar: {} },
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
