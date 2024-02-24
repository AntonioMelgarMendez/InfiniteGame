import React, { useState, useEffect, useRef } from 'react';
import char from "../sources/chara.png";
import door from "../sources/door.png";
import spike from "../sources/spike.png";
import video1 from "../sources/video.mp4"; 
const RenderMain = () => {
  const containerSize = 500;
  const squareSize = 50; // Tamaño de los cuadrados internos
  const canvasRef = useRef(null);
  const characterRef = useRef(new Image());
  const doorRef = useRef(new Image());
  const [wallDesigns] = useState(generateWallDesigns());
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
  function generateValidInitialPositions(walls, spikes) {
    let characterPosition, doorPosition, isOverlap;
  
    do {
      const positions = generateRandomPositionForCharacterAndDoor(walls);
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
  
      // Verificar si las posiciones iniciales colisionan con los pinchos
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
  function checkOverlap(positionA, positionB) {
    return (
      positionA && positionB &&
      positionA.x < positionB.x + 50 &&
      positionA.x + 50 > positionB.x &&
      positionA.y < positionB.y + 50 &&
      positionA.y + 50 > positionB.y
    );
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
      // Verificar si hay superposición con los muros
      isOverlap = walls.some(wall => {
        if (wall.bricks) {
          return wall.bricks.some(brick => checkOverlap(randomPosition, brick));
        }
        return false;
      });
    } while (isOverlap);

    spikes.push(randomPosition);
  }

  return spikes;
}


  
  // ...
function generateRandomPositionForCharacterAndDoor(walls) {
  const minDistance = 300; // Ajusta este valor según tus necesidades
  let characterPosition, doorPosition, isOverlap;
  let allBricks = walls.flatMap(w => w.bricks);

  do {
    characterPosition = generateRandomPositionInSquare();
    doorPosition = generateRandomPositionInSquare();

    // Verificar si hay alguna superposición o la distancia es menor que el mínimo
    const characterOverlap = allBricks.some(brick =>
      brick && checkOverlap(characterPosition, brick)
    );
    const doorOverlap = allBricks.some(brick =>
      brick && checkOverlap(doorPosition, brick)
    );

    const distance = Math.hypot(
      doorPosition.x - characterPosition.x,
      doorPosition.y - characterPosition.y
    );

    isOverlap = characterOverlap || doorOverlap || distance < minDistance;
  } while (isOverlap);

  return { characterPosition, doorPosition, allBricks };
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
  function resetGame() {
    // Recargar la página
    window.location.reload();
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
        // El personaje muere al tocar un muro
        resetGame(); // Puedes definir esta función para reiniciar el juego
        return prevPosition;
      }
  
      // Verificar colisión con pinchos
      const isCollisionWithSpikes = spikePositions.some((spike) => checkOverlap(newPosition, spike));
  
      if (isCollisionWithSpikes) {
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
    setWallPositions(newWallPositions);
    setSpikePositions(newSpikePositions);
    const { characterPosition, doorPosition } = generateRandomPositionForCharacterAndDoor(newWallPositions);
    console.log("Nuevas posiciones generadas:", characterPosition, doorPosition);


    setDoorPosition(doorPosition);
    setCharacterPosition(characterPosition);
    setLevel((prevLevel) => prevLevel + 1);
  
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
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'gray';  // Color del borde
    ctx.lineWidth = 2;  // Ancho del borde
  
    for (let x = 0; x < containerSize; x += squareSize) {
      for (let y = 0; y < containerSize; y += squareSize) {
        ctx.fillRect(x, y, squareSize, squareSize);
        ctx.strokeRect(x, y, squareSize, squareSize);  // Dibujar el borde
      }
    }
  
    const characterImg = characterRef.current;
    characterImg.src = char;
    characterImg.onload = () => {
      ctx.drawImage(characterImg, characterPosition.x, characterPosition.y, 50, 50);
    };
  
    const doorImg = doorRef.current;
    doorImg.src = door;
    doorImg.onload = () => {
      ctx.drawImage(doorImg, doorPosition.x, doorPosition.y, 50, 50);
    };
  
    ctx.fillStyle = 'brown';
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
    <div className="flex items-center justify-center h-screen">
      {showVideo ? (
        <video
  id="game-video"
  width="100%"
  height="100%"
  autoPlay
  controls={false}
  preload="auto"  // Ensure the video is preloaded
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
    </div>
  );

  
};

export default RenderMain;