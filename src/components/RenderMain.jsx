import React, { useState, useEffect, useRef } from 'react';
import char from "../sources/chara.png";
import door from "../sources/door.png";
import spike from "../sources/spike.png";
import video1 from "../sources/video.mp4"; 
import skull from "../sources/skull.png";
import Queue from '../components/Queue';
import deathSound from '../sounds/dead.mp3';
import screamsound  from '../sounds/scream.mp3';
import bloodychar from "../sources/charaBad.png";
import backgroundMusic1 from '../sounds/defaultsong.mp3';
import darkbackgroundMusic from '../sounds/darkmain.mp3';
const RenderMain = ({ onBackToMenu }) => {
  const minContainerPercentage = 40;
  const maxContainerPercentage = 90;
  const maxScreenWidthForDefaultSize = 700;
  
  let containerSizePercentage;
  let squareSizePercentage;
  
  if (window.innerWidth > maxScreenWidthForDefaultSize) {
    // Tamaño predeterminado si la pantalla es más grande que maxScreenWidthForDefaultSize
    containerSizePercentage = 40;
    squareSizePercentage = 10;
  } else {
    // Calcular el tamaño basado en la lógica anterior
    containerSizePercentage = Math.min(maxContainerPercentage, Math.max(minContainerPercentage, (window.innerWidth / 10) * 2));
    
    // Calcular squareSizePercentage para que sea 10% del contenedor
    squareSizePercentage = 10 / (containerSizePercentage / 100);
  
    // Ajustar el tamaño del contenedor para que sea un múltiplo de 10
    containerSizePercentage = Math.floor(containerSizePercentage / 10) * 10;
  }
  
  // Calcular los tamaños reales
  let containerSize = Math.floor((window.innerWidth * containerSizePercentage) / 100);
  containerSize = Math.floor(containerSize / 10) * 10; // Redondear a la decena más cercana
  const squareSize = Math.floor(containerSize / 10);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isTouchMoveInProgress, setIsTouchMoveInProgress] = useState(false);
  const canvasRef = useRef(null);
  const characterRef = useRef(new Image());
  const [backgroundMusic, setBackgroundMusic] = useState(backgroundMusic1);
  const audioRef = useRef(new Audio(backgroundMusic));
  const doorRef = useRef(new Image());
  const [background, setbackground] = useState('white');
  const [block, setblock] = useState('brown');
  const [currentCharacterImage, setCurrentCharacterImage] = useState(char);
  const [wallDesigns] = useState(generateWallDesigns());
  const [GameOver, setGameOver]= useState(false);
  const [spikeDesigns]= useState(generateSpikeDesigns());
  const [showVideo, setShowVideo] = useState(false);
   const [videoUrl, setVideoUrl] = useState('');
   const [wallPositions, setWallPositions] = useState(generateRandomWalls(3, 6));
   const [spikePositions, setSpikePositions]=useState(generateRandomSpikes(2,6,wallPositions));
   const initialPositions = generateValidInitialPositions(wallPositions,spikePositions);
   const [characterPosition, setCharacterPosition] = useState(initialPositions.characterPosition);
  const [doorPosition, setDoorPosition] = useState(initialPositions.doorPosition);
  const [characterKey, setCharacterKey] = useState(0);
  const [level, setLevel] = useState(1);
  const [lastMoveTime, setLastMoveTime] = useState(0);
const resetGame = () => {
  setGameOver(true);

  // Probabilidad de reproducir otro sonido: 20% (puedes ajustar esto según tus necesidades)



  // También puedes realizar otras acciones de reinicio aquí según sea necesario
};

  

  const restartGame = () => {
    // Restablecer el estado del juego y volver al nivel 1
    audioRef.current.currentTime = 0;
    setGameOver(false);
    setLevel(0);
    handleLevelChange();

    // Otras lógicas de reinicio si es necesario
  };

  const exitToMenu = () => {
    // Salir al menú principal
    onBackToMenu();
  };
  function generateValidInitialPositions(walls, spikes) {
    let characterPosition, doorPosition, isOverlap;
  
    do {
      const positions = generateRandomPositionForCharacterAndDoor(walls, spikes);
      characterPosition = positions.characterPosition;
      doorPosition = positions.doorPosition;
  
      // Verificar si las posiciones iniciales colisionan con los muros
      const characterOverlapWithWalls = walls.some((wall) => {
        if (wall.bricks) {
          return wall.bricks.some((brick) => checkOverlap(characterPosition, brick));
        }
        return false;
      });
  
      const doorOverlapWithWalls = walls.some((wall) => {
        if (wall.bricks) {
          return wall.bricks.some((brick) => checkOverlap(doorPosition, brick));
        }
        return false;
      });
  
      // Verificar si las posiciones iniciales colisionan con los muros y espigas
      const characterOverlapWithSpikes = spikes.some((spike) => checkOverlap(characterPosition, spike));
      const doorOverlapWithSpikes = spikes.some((spike) => checkOverlap(doorPosition, spike));
  
      isOverlap =
        characterOverlapWithWalls ||
        doorOverlapWithWalls ||
        characterOverlapWithSpikes ||
        doorOverlapWithSpikes;
    } while (isOverlap);
  
    return { characterPosition, doorPosition };
  }
  
  
  
  function generateRandomPositionInSquare() {
    const squareX = Math.floor(Math.random() * (containerSize / squareSize));
    const squareY = Math.floor(Math.random() * (containerSize / squareSize));

    const x = squareX * squareSize;
    const y = squareY * squareSize;

    return { x, y };
  }
function checkOverlap(position, obstacle) {
  if (obstacle.bricks) {
    return obstacle.bricks.some((brick) =>
      position.x < brick.x + squareSize &&
      position.x + squareSize > brick.x &&
      position.y < brick.y + squareSize &&
      position.y + squareSize > brick.y
    );
  } else {
    // Considerar las coordenadas directas para las espigas
    return (
      position.x < obstacle.x + squareSize &&
      position.x + squareSize > obstacle.x &&
      position.y < obstacle.y + squareSize &&
      position.y + squareSize > obstacle.y
    );
  }
}

  
 function generateRandomWalls(minCount, maxCount) {
  const wallCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const walls = [];
  const minDistanceSquared = 2000; // Aumentamos la distancia mínima

  for (let i = 0; i < wallCount; i++) {
    let randomDesign, wall, isOverlap;

    do {
      randomDesign = wallDesigns[Math.floor(Math.random() * wallDesigns.length)];
      wall = generateRandomPositionInSquare();
      isOverlap = randomDesign && randomDesign.some(brick =>
        walls.some(existingWall =>
          checkOverlap(wall, existingWall)
        )
      );
    } while (isOverlap);

    // Guardar las coordenadas de cada ladrillo individual directamente
    const brickCoordinates = randomDesign.map(brick => ({
      x: wall.x + brick.x,
      y: wall.y + brick.y
    }));

    // Empujar un objeto que contiene las coordenadas de los ladrillos al array de paredes
    walls.push({ bricks: brickCoordinates });
  }

  return walls;
}
function generateRandomSpikes(minCount, maxCount, walls) {
  const spikeCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const spikes = [];

  for (let i = 0; i < spikeCount; i++) {
    let randomPosition, isOverlap;

    do {
      randomPosition = generateRandomPositionInSquare();
      // Verificar si hay superposición con los ladrillos de las paredes
      isOverlap = walls.some(wall => {
        if (wall.bricks) {
          return wall.bricks.some(brick => checkOverlap(randomPosition, brick));
        }
        return false;
      });

      // También verificar la superposición directa con las coordenadas de las espigas
      isOverlap = isOverlap || spikes.some(spike => checkOverlap(randomPosition, spike));
    } while (isOverlap);

    spikes.push(randomPosition);
  }

  return spikes;
}  // ...
  function generateRandomPositionForCharacterAndDoor(walls, spikes) {
    const minDistance = 300;
    let characterPosition, doorPosition, isOverlap;
  
    do {
      characterPosition = generateRandomPositionInSquare();
      doorPosition = generateRandomPositionInSquare();
  
      // Verificar superposición con los ladrillos de los muros
      const characterOverlapWithWalls = walls.some(wall =>
        wall.bricks.some(brick => checkOverlap(characterPosition, brick))
      );
      const doorOverlapWithWalls = walls.some(wall =>
        wall.bricks.some(brick => checkOverlap(doorPosition, brick))
      );
  
      // Verificar superposición con las espigas
      const characterOverlapWithSpikes = spikes.some(spike =>
        checkOverlap(characterPosition, spike)
      );
      const doorOverlapWithSpikes = spikes.some(spike =>
        checkOverlap(doorPosition, spike)
      );
  
      const distance = Math.hypot(
        doorPosition.x - characterPosition.x,
        doorPosition.y - characterPosition.y
      );
  
      isOverlap =
        characterOverlapWithWalls ||
        doorOverlapWithWalls ||
        characterOverlapWithSpikes ||
        doorOverlapWithSpikes ||
        distance < minDistance ||
        !isPathValid(characterPosition, doorPosition, walls, spikes);
    } while (isOverlap);
  
    return { characterPosition, doorPosition };
  }
  
  function isPathValid(start, end, walls, spikes) {

    return true;
  }
  
  function checkPathExists(start, end, walls) {
    const visited = new Set();
    const queue = new Queue();
  
    queue.enqueue(start);
    visited.add(JSON.stringify(start));
  
    while (!queue.isEmpty()) {
      const current = queue.dequeue();
  
      if (current.x === end.x && current.y === end.y) {
        // Se encontró un camino
        return true;
      }
  
      // Obtener vecinos
      const neighbors = [
        { x: current.x + squareSize, y: current.y },
        { x: current.x - squareSize, y: current.y },
        { x: current.x, y: current.y + squareSize },
        { x: current.x, y: current.y - squareSize },
      ];
  
      for (const neighbor of neighbors) {
        if (!visited.has(JSON.stringify(neighbor)) && !checkOverlap(neighbor, walls)) {
          queue.enqueue(neighbor);
          visited.add(JSON.stringify(neighbor));
        }
      }
    }
  
    // No se encontró un camino
    return false;
  }

  function generateWallDesigns() {
    const factor = squareSize ;
  
    return [
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 2 * factor, y: 0 },
        { x: 3 * factor, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 * factor },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 1 * factor, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 2 * factor, y: 2 * factor },
      ],
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 2 * factor, y: 2 * factor },
        { x: 3 * factor, y: 2 * factor },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 * factor },
        { x: 0, y: 2 * factor },
        { x: 0, y: 3 * factor },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 3 * factor, y: 1 * factor },
        { x: 2 * factor, y: 0 },
        { x: 2 * factor, y: 2 * factor },
      ],
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 2 * factor, y: 0 },
        { x: 3 * factor, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 * factor },
        { x: 0, y: 2 * factor },
        { x: 0, y: 3 * factor },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 3 * factor, y: 1 * factor },
      ],
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 2 * factor, y: 0 },
        { x: 2 * factor, y: 1 * factor },
        { x: 2 * factor, y: 2 * factor },
      ],
      [
        { x: 0, y: 0 },
        { x: 0.5 * factor, y: 1 * factor },
        { x: 1 * factor, y: 0 },
        { x: 1.5 * factor, y: 1 * factor },
        { x: 2 * factor, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 * factor },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 3 * factor, y: 1 * factor },
        { x: 3 * factor, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 2 * factor, y: 0 },
        { x: 1.5 * factor, y: 1 * factor },
        { x: 1 * factor, y: 2 * factor },
        { x: 0.5 * factor, y: 1 * factor },
      ],
      [
        { x: 0, y: 0 },
        { x: 1 * factor, y: 0 },
        { x: 1 * factor, y: 1 * factor },
        { x: 2 * factor, y: 1 * factor },
        { x: 2 * factor, y: 2 * factor },
        { x: 1 * factor, y: 2 * factor },
        { x: 1 * factor, y: 3 * factor },
        { x: 0, y: 3 * factor },
        { x: 0, y: 2 * factor },
        { x: -1 * factor, y: 2 * factor },
        { x: -1 * factor, y: 1 * factor },
        { x: 0, y: 1 * factor },
      ],
    ];
  }
  
  function generateSpikeDesigns() {
    return [
      [
        { x: 0, y: 0 },
        { x: squareSize, y: 0 },
        { x: 2*squareSize, y: 0 },
        { x: 3*squareSize, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: squareSize },
        { x: squareSize, y: squareSize },
        { x: 2*squareSize, y: squareSize },
        { x: squareSize, y: 0 },
      ]
  ];
  }

  function handleKeyPress(event) {
    const speed = squareSize;
    const now = Date.now();
  
    if (now - lastMoveTime < 100) {
      return;
    }
  
    setLastMoveTime(now);
  
    setCharacterPosition((prevPosition) => {
      const newPosition = { ...prevPosition };
  
      switch (event.key) {
        case 'a':
          newPosition.x = Math.max(prevPosition.x - speed, 0);
          break;
        case 'w':
          newPosition.y = Math.max(prevPosition.y - speed, 0);
          break;
        case 's':
          newPosition.y = Math.min(prevPosition.y + speed, containerSize - squareSize);
          break;
        case 'd':
          newPosition.x = Math.min(prevPosition.x + speed, containerSize - squareSize);
          break;
        default:
          return prevPosition;
      }
  
      // Verificar colisión con muros
      const isCollisionWithWalls = wallPositions.some((wall) => {
        if (wall.bricks) {
          return wall.bricks.some((brick) => checkOverlap(newPosition, brick));
        }
        return false;
      });
  
      if (isCollisionWithWalls) {
        // Si hay colisión con algún ladrillo de un muro, no actualizar la posición
        return prevPosition;
      }
  
      // Verificar colisión con pinchos
      const isCollisionWithSpikes = spikePositions.some((spike) => checkOverlap(newPosition, spike));
  
      if (isCollisionWithSpikes) {
        if (Math.random() < 0.2) {
          // Seleccionar aleatoriamente un sonido de muerte
          const deathAudio = new Audio(screamsound);
          deathAudio.play();
        } else {
          // Reproducir el sonido de muerte predeterminado
          const defaultDeathAudio = new Audio(deathSound);
          defaultDeathAudio.play();
        }
        
        // El personaje muere al tocar una spike
        resetGame(); // Puedes definir esta función para reiniciar el juego
        return prevPosition;
      }
  
      return newPosition;
    });
  
    setCharacterKey((prev) => prev + 1);
  }
  
  function handleTouchStart(event) {
    if (isTouchMoveInProgress) {
      return;
    }

    setTouchStartX(event.touches[0].clientX);
    setTouchStartY(event.touches[0].clientY);
  }

  // Función para manejar el final de un toque
  function handleTouchEnd() {
    setTouchStartX(null);
    setTouchStartY(null);
    setIsTouchMoveInProgress(false);
  }

  // Función para manejar el movimiento táctil
  function handleTouchMove(event) {
    if (!touchStartX || !touchStartY || isTouchMoveInProgress) {
      return;
    }

    setIsTouchMoveInProgress(true);

    const speed = squareSize;
    const now = Date.now();

    if (now - lastMoveTime < 100) {
      setIsTouchMoveInProgress(false);
      return;
    }

    setLastMoveTime(now);

    setCharacterPosition((prevPosition) => {
      const newPosition = { ...prevPosition };

      const deltaX = event.touches[0].clientX - touchStartX;
      const deltaY = event.touches[0].clientY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const directionX = deltaX > 0 ? 1 : -1;
        newPosition.x = Math.max(Math.min(prevPosition.x + directionX * speed, containerSize - squareSize), 0);
      } else {
        const directionY = deltaY > 0 ? 1 : -1;
        newPosition.y = Math.max(Math.min(prevPosition.y + directionY * speed, containerSize - squareSize), 0);
      }

      const isCollisionWithWalls = wallPositions.some((wall) => {
        if (wall.bricks) {
          return wall.bricks.some((brick) => checkOverlap(newPosition, brick));
        }
        return false;
      });

      const isCollisionWithSpikes = spikePositions.some((spike) => checkOverlap(newPosition, spike));

      if (isCollisionWithWalls || isCollisionWithSpikes) {
        return prevPosition;
      }

      return newPosition;
    });

    setCharacterKey((prev) => prev + 1);
    setIsTouchMoveInProgress(false);
  }
 
  


  function isCharacterTouchingDoor() {
    return (
      characterPosition.x < doorPosition.x + squareSize &&
      characterPosition.x + squareSize > doorPosition.x &&
      characterPosition.y < doorPosition.y + squareSize &&
      characterPosition.y + squareSize > doorPosition.y
    );
  }

  // ...
  useEffect(() => {
    if (isCharacterTouchingDoor()) {
      // Llamar a la función para manejar el cambio de nivel
      handleLevelChange();
    }
  }, [characterPosition, doorPosition, wallPositions, level]);

  const handleLevelChange = () => {
    console.log("Personaje tocando la puerta. Actualizando muros y generando nuevas posiciones...");
  
    // Actualizar muros antes de generar nuevas posiciones
    const newWallPositions = generateRandomWalls(3,6);
    const newSpikePositions = generateRandomSpikes(2, 6, newWallPositions);
    console.log(newSpikePositions);
    setWallPositions(newWallPositions);
    setSpikePositions(newSpikePositions);
    const { characterPosition, doorPosition } = generateRandomPositionForCharacterAndDoor(newWallPositions,newSpikePositions);
    console.log("Nuevas posiciones generadas:", characterPosition, doorPosition);


    setDoorPosition(doorPosition);
    setCharacterPosition(characterPosition);
    setLevel((prevLevel) => prevLevel + 1);
    setCurrentCharacterImage(char);
    const randomvalue =  Math.random() < ((level*1.5/100));
    if(randomvalue){
      setbackground('red');
      setblock('black');
      setCurrentCharacterImage(bloodychar);
      setBackgroundMusic(darkbackgroundMusic);
   
    }
    else {
      setblock('brown');
      setbackground('white');
      setBackgroundMusic(backgroundMusic1); // Reset color to default
    }

    const shouldShowVideo = Math.random() < ((level*2)/100); // Cambia esto según tus criterios
    setShowVideo(shouldShowVideo);
  
    if (shouldShowVideo) {
      const videoUrls = [video1];
      const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
      setVideoUrl(randomVideoUrl);
    }
  };
  useEffect(() => {
    if (showVideo) {
      const videoElement = document.getElementById("game-video");
  
      // Verificar el estado del video directamente
      const checkVideoEnd = () => {
        if (videoElement.currentTime >= videoElement.duration) {
          console.log("Video terminado. Continuando al siguiente video o nivel...");
          
          setLevel((prevLevel) => prevLevel -1);
          handleLevelChange();
        } else {
          // Si el video no ha terminado, sigue verificando
          requestAnimationFrame(checkVideoEnd);
        }
      };
  
      // Comenzar la verificación
      checkVideoEnd();
  
      return () => {
        // Puedes detener cualquier acción relacionada con la verificación aquí si es necesario
      };
    }
  }, [showVideo]);
  function fillPolygon(ctx, vertices) {
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
  
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
  
    ctx.closePath();
    ctx.fill();
  }
  
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    // Verificar si el canvas existe antes de continuar
    if (!canvas) {
      return;
    }
  
    const ctx = canvas.getContext('2d');
  
    // Limpiar el canvas
    ctx.clearRect(0, 0, containerSize, containerSize);
  
    // Dibujar cuadrados internos en rosado con bordes
    ctx.fillStyle = background;
    ctx.strokeStyle = 'gray';  // Color del borde
    ctx.lineWidth = 2;  // Ancho del borde
  
    for (let x = 0; x < containerSize; x += squareSize) {
      for (let y = 0; y < containerSize; y += squareSize) {
        ctx.fillRect(x, y, squareSize, squareSize);
        ctx.strokeRect(x, y, squareSize, squareSize);  // Dibujar el borde
      }
    }
  
    const characterImg = characterRef.current;
    characterImg.src = currentCharacterImage;
    characterImg.onload = () => {
      ctx.drawImage(characterImg, characterPosition.x, characterPosition.y, squareSize, squareSize);
    };
  
    const doorImg = doorRef.current;
    doorImg.src = door;
    doorImg.onload = () => {
      ctx.drawImage(doorImg, doorPosition.x, doorPosition.y, squareSize, squareSize);
    };
  
    ctx.fillStyle = block;
    wallPositions.forEach((wall) => {
      if (wall.bricks) {
        wall.bricks.forEach((brick) => {
          ctx.fillRect(brick.x, brick.y, squareSize, squareSize);
        });
      }
    });
  
    // Renderizar los pinchos
    ctx.fillStyle = 'gray'; // Cambia el color a gris
    spikePositions.forEach((spike) => {
      const spikeVertices = [
        { x: spike.x + (squareSize/2), y: spike.y }, // Punto superior
        { x: spike.x, y: spike.y + squareSize }, // Punto inferior izquierdo
        { x: spike.x + squareSize, y: spike.y + squareSize } // Punto inferior derecho
      ];
    
      fillPolygon(ctx, spikeVertices);
    });
  
    // Level rendering outside the canvas
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Nivel: ${level}`, 10, 30);
  
  }, [characterKey, doorPosition, wallPositions, spikePositions, level]);
  
  useEffect(() => {
    // Reproducir música de fondo al cargar el componente
    const playBackgroundMusic = () => {
      if (audioRef.current.paused) {
        audioRef.current.play().catch((error) => {
          console.error('Error al reproducir música de fondo:', error);
        });
      }
    };

    playBackgroundMusic();

    // Limpiar eventos al desmontar el componente
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [lastMoveTime]);
  return (
    <div className="flex items-center justify-center h-screen relative">
      {/* Resto del contenido del juego */}
      {showVideo ? (
        <video
          id="game-video"
          width="100%"
          height="100%"
          autoPlay
          controls={false}
          preload="auto"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <canvas
          ref={canvasRef}
          className="bg-white border-8 border-black cursor-pointer"
          width={containerSize}
          height={containerSize}
          onKeyDown={handleKeyPress}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        />
      )}
  
      {/* Pantalla de muerte */}
      {GameOver && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-white border-4 border-black p-8 text-center flex flex-col items-center w-500 h-500">
            <h1 className="text-3xl mb-4">¡You're dead!</h1>
            <img src={skull} width={80} height={50} className="mb-4" />
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-600 cursor-pointer w-32"
                onClick={restartGame}
              >
                Restart
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer w-32"
                onClick={exitToMenu}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
          <audio ref={audioRef} src={backgroundMusic} loop autoPlay />
    </div>
  );
  
        };

export default RenderMain;