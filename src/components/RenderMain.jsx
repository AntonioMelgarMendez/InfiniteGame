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
const RenderMain = ({ onBackToMenu }) => {
  const containerSize = 500;
  const squareSize = 50; // Tamaño de los cuadrados internos
  const canvasRef = useRef(null);
  const characterRef = useRef(new Image());
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
      position.x < brick.x + 50 &&
      position.x + 50 > brick.x &&
      position.y < brick.y + 50 &&
      position.y + 50 > brick.y
    );
  } else {
    // Considerar las coordenadas directas para las espigas
    return (
      position.x < obstacle.x + 50 &&
      position.x + 50 > obstacle.x &&
      position.y < obstacle.y + 50 &&
      position.y + 50 > obstacle.y
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
}



  
  // ...
  function generateRandomPositionForCharacterAndDoor(walls, spikes) {
    const minDistance = 300;
    let characterPosition, doorPosition, isOverlap;
    let allBricks = walls.flatMap(w => w.bricks || []);
  
    do {
      characterPosition = generateRandomPositionInSquare();
      doorPosition = generateRandomPositionInSquare();
  
      // Verificar superposición con los ladrillos de los muros
      const characterOverlapWithWalls = allBricks.some(brick =>
        brick && checkOverlap(characterPosition, brick)
      );
      const doorOverlapWithWalls = allBricks.some(brick =>
        brick && checkOverlap(doorPosition, brick)
      );
  
      // Verificar superposición con las espigas
      const characterOverlapWithSpikes = spikes.some(spike => checkOverlap(characterPosition, spike));
      const doorOverlapWithSpikes = spikes.some(spike => checkOverlap(doorPosition, spike));
  
      const distance = Math.hypot(
        doorPosition.x - characterPosition.x,
        doorPosition.y - characterPosition.y
      );
  
      isOverlap = characterOverlapWithWalls ||
        doorOverlapWithWalls ||
        characterOverlapWithSpikes ||
        doorOverlapWithSpikes ||
        distance < minDistance;
    } while (isOverlap);
  
    return { characterPosition, doorPosition, allBricks };
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
    return [
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 150, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 50, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
      ],
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 150, y: 100 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 50 },
        { x: 0, y: 100 },
        { x: 0, y: 150 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 150, y: 50 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 150, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 150, y: 100 },
      ],
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
      ],
          [
      { x: 0, y: 0 },
      { x: 25, y: 50 },
      { x: 50, y: 0 },
      { x: 75, y: 50 },
      { x: 100, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 50 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 75, y: 50 },
      { x: 50, y: 100 },
      { x: 25, y: 50 },
    ],
    [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 50 },
    { x: 100, y: 50 },
    { x: 100, y: 100 },
    { x: 50, y: 100 },
    { x: 50, y: 150 },
    { x: 0, y: 150 },
    { x: 0, y: 100 },
    { x: -50, y: 100 },
    { x: -50, y: 50 },
    { x: 0, y: 50 },
  ]
    ];
  }
  function generateSpikeDesigns() {
    return [
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 150, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 50, y: 0 },
      ]
  ];
  }

  function handleKeyPress(event) {
    const speed = 50;
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
          newPosition.y = Math.min(prevPosition.y + speed, containerSize - 50);
          break;
        case 'd':
          newPosition.x = Math.min(prevPosition.x + speed, containerSize - 50);
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
  
  
  


  function isCharacterTouchingDoor() {
    return (
      characterPosition.x < doorPosition.x + 50 &&
      characterPosition.x + 50 > doorPosition.x &&
      characterPosition.y < doorPosition.y + 50 &&
      characterPosition.y + 50 > doorPosition.y
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
    }
    else {
      setblock('brown');
      setbackground('white'); // Reset color to default
    }

    const shouldShowVideo = Math.random() < ((level/100)); // Cambia esto según tus criterios
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
      ctx.drawImage(characterImg, characterPosition.x, characterPosition.y, 50, 50);
    };
  
    const doorImg = doorRef.current;
    doorImg.src = door;
    doorImg.onload = () => {
      ctx.drawImage(doorImg, doorPosition.x, doorPosition.y, 50, 50);
    };
  
    ctx.fillStyle = block;
    wallPositions.forEach((wall) => {
      if (wall.bricks) {
        wall.bricks.forEach((brick) => {
          ctx.fillRect(brick.x, brick.y, 50, 50);
        });
      }
    });
  
    // Renderizar los pinchos
    ctx.fillStyle = 'gray'; // Cambia el color a gris
    spikePositions.forEach((spike) => {
      const spikeVertices = [
        { x: spike.x + 25, y: spike.y }, // Punto superior
        { x: spike.x, y: spike.y + 50 }, // Punto inferior izquierdo
        { x: spike.x + 50, y: spike.y + 50 } // Punto inferior derecho
      ];
    
      fillPolygon(ctx, spikeVertices);
    });
  
    // Level rendering outside the canvas
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Nivel: ${level}`, 10, 30);
  
  }, [characterKey, doorPosition, wallPositions, spikePositions, level]);
  


  

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
    </div>
  );
  
        };

export default RenderMain;