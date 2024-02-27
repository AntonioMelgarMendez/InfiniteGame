import React, { useEffect, useRef } from 'react';
import gameLogo from '../sources/puzzlelogo.png';
import backgroundMusic from '../sounds/main.mp3';

const MainMenu = ({ onStartGame, onLeaderboard }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    // Intentar reproducir música al cargar la página
    const playAudio = () => {
      if (audio.paused) {
        audio.play().catch((error) => {
          // Manejar cualquier error aquí
          console.error('Error al reproducir audio:', error);
        });
      }
    };

    // Autoclic invisible al cargar la página
    playAudio();

    // Agregar el evento 'click' al contenedor principal
    const mainContainer = document.getElementById('main-container');
    mainContainer.addEventListener('click', playAudio);

    return () => {
      // Limpiar el evento al desmontar el componente
      mainContainer.removeEventListener('click', playAudio);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []); 

  return (
    <div id="main-container" className="h-screen w-screen flex items-center justify-center">
      <div className="bg-white border-8 border-black p-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Infinite Puzzle</h1>
        <div className="mb-8">
          <img src={gameLogo} alt="Game Logo" width={240} height={240} />
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={onStartGame}
            className="w-32 bg-black text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none"
          >
            Play
          </button>
          <button
            onClick={onLeaderboard}
            className="w-32 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none"
          >
            Leaderboard
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={backgroundMusic} loop />
    </div>
  );
};

export default MainMenu;
