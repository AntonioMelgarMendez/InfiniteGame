// App.js
import React, { useState } from 'react';
import RenderMain from './components/RenderMain';
import MainMenu from './components/MainMenu';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  return (
    <div>
      {gameStarted ? (
        <RenderMain onBackToMenu={handleBackToMenu} />
      ) : (
        <MainMenu onStartGame={handleStartGame} />
      )}
    </div>
  );
};

export default App;
