import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CROPS, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from '../constants/gameData';
import { FarmTile, GameState, PlantedCrop, ToolType } from '../types';
import { soundManager } from '../utils/audio';

interface FarmCanvasProps {
  gameState: GameState;
  selectedTool: ToolType | 'seed' | 'crop' | 'fertilizer' | 'none';
  selectedCropType?: string;
  onTileAction: (tileX: number, tileY: number) => void;
  onPlayerMove?: (x: number, y: number, dir: 'down' | 'up' | 'left' | 'right') => void;
  isActionLoading?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type?: 'water' | 'sparkle' | 'dust' | 'leaf' | 'rain' | 'smoke';
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export const FarmCanvas: React.FC<FarmCanvasProps> = ({
  gameState,
  selectedTool,
  selectedCropType,
  onTileAction,
  onPlayerMove,
  isActionLoading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player position in canvas pixels
  const playerPosRef = useRef({
    x: gameState.player.x,
    y: gameState.player.y,
    dir: gameState.player.direction,
    isMoving: false,
    frame: 0,
    actionTimer: 0,
    actionType: null as 'till' | 'water' | 'harvest' | 'plant' | null,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const animationFrameRef = useRef<number>(0);
  const chimneySmokeTimerRef = useRef<number>(0);

  // Dynamic scale for high resolution & responsiveness
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: MAP_WIDTH * TILE_SIZE,
    height: MAP_HEIGHT * TILE_SIZE,
  });

  // Keep player speed based on upgrades
  const getSpeed = useCallback(() => {
    const level = gameState.upgrades.moveSpeedLevel || 1;
    const base = 2.4;
    if (level === 2) return base * 1.35;
    if (level >= 3) return base * 1.7;
    return base;
  }, [gameState.upgrades.moveSpeedLevel]);

  // Sync player position with external state if teleported/reset
  useEffect(() => {
    playerPosRef.current.x = gameState.player.x;
    playerPosRef.current.y = gameState.player.y;
    playerPosRef.current.dir = gameState.player.direction;
  }, [gameState.player.x, gameState.player.y, gameState.player.direction]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing inputs if in an input/modal
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      keysPressed.current[e.key.toLowerCase()] = true;

      // Space or Enter to perform action on front tile
      if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        performActionOnTarget();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, selectedTool, selectedCropType]);

  // Compute the tile in front of the player
  const getFrontTile = useCallback(() => {
    const p = playerPosRef.current;
    const currentTileX = Math.floor((p.x + 16) / TILE_SIZE);
    const currentTileY = Math.floor((p.y + 24) / TILE_SIZE);

    let targetX = currentTileX;
    let targetY = currentTileY;

    if (p.dir === 'up') targetY -= 1;
    else if (p.dir === 'down') targetY += 1;
    else if (p.dir === 'left') targetX -= 1;
    else if (p.dir === 'right') targetX += 1;

    // Clamp inside map boundaries
    targetX = Math.max(0, Math.min(MAP_WIDTH - 1, targetX));
    targetY = Math.max(0, Math.min(MAP_HEIGHT - 1, targetY));

    return { x: targetX, y: targetY };
  }, []);

  const performActionOnTarget = useCallback(() => {
    if (isActionLoading) return;
    const target = hoveredTileRef.current || getFrontTile();
    
    // Set action animation
    playerPosRef.current.actionTimer = 16;
    if (selectedTool === 'hoe') {
      playerPosRef.current.actionType = 'till';
      soundManager.playTill();
      addDustParticles(target.x * TILE_SIZE + 16, target.y * TILE_SIZE + 16);
    } else if (selectedTool === 'water_can') {
      playerPosRef.current.actionType = 'water';
      soundManager.playWater();
      addWaterParticles(target.x * TILE_SIZE + 16, target.y * TILE_SIZE + 16);
    } else if (selectedTool === 'seed') {
      playerPosRef.current.actionType = 'plant';
      soundManager.playPlant();
    } else if (selectedTool === 'scythe' || selectedTool === 'hand') {
      playerPosRef.current.actionType = 'harvest';
      soundManager.playHarvest();
      addSparkleParticles(target.x * TILE_SIZE + 16, target.y * TILE_SIZE + 16);
    }

    onTileAction(target.x, target.y);
  }, [getFrontTile, isActionLoading, onTileAction, selectedTool]);

  // Particle generators
  const addWaterParticles = (x: number, y: number) => {
    for (let i = 0; i < 14; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.random() * 2 - 1,
        color: Math.random() > 0.5 ? '#60a5fa' : '#93c5fd',
        size: Math.random() * 3 + 2,
        life: 20 + Math.random() * 10,
        maxLife: 30,
        type: 'water',
      });
    }
  };

  const addDustParticles = (x: number, y: number) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.5,
        color: '#a16207',
        size: Math.random() * 3 + 2,
        life: 18,
        maxLife: 18,
        type: 'dust',
      });
    }
  };

  const addSparkleParticles = (x: number, y: number) => {
    const colors = ['#fde047', '#f43f5e', '#a855f7', '#38bdf8', '#4ade80'];
    for (let i = 0; i < 18; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 3.5,
        vy: (Math.random() - 0.5) * 3.5 - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        life: 28,
        maxLife: 28,
        type: 'sparkle',
      });
    }
  };

  // Weather rain particles
  useEffect(() => {
    if (gameState.weather === 'rainy') {
      const interval = setInterval(() => {
        if (particlesRef.current.length < 60) {
          particlesRef.current.push({
            x: Math.random() * (MAP_WIDTH * TILE_SIZE),
            y: -10,
            vx: -1.2,
            vy: 6.5 + Math.random() * 3,
            color: '#93c5fd',
            size: 2,
            life: 60,
            maxLife: 60,
            type: 'rain',
          });
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState.weather]);

  // Main Game Loop & Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let stepTimer = 0;

    const gameLoop = () => {
      if (!isRunning) return;

      // 1. UPDATE PLAYER PHYSICS
      const p = playerPosRef.current;
      const speed = getSpeed();
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
        dy -= speed;
        p.dir = 'up';
      }
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
        dy += speed;
        p.dir = 'down';
      }
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
        dx -= speed;
        p.dir = 'left';
      }
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
        dx += speed;
        p.dir = 'right';
      }

      // Diagonal normalization
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const isMoving = dx !== 0 || dy !== 0;
      p.isMoving = isMoving;

      if (isMoving) {
        stepTimer++;
        if (stepTimer % 8 === 0) {
          p.frame = (p.frame + 1) % 4;
        }

        // Potential next positions
        const nextX = p.x + dx;
        const nextY = p.y + dy;

        // Collision detection against map bounds & solid obstacles
        const targetTileX = Math.floor((nextX + 16) / TILE_SIZE);
        const targetTileY = Math.floor((nextY + 24) / TILE_SIZE);

        const tile = gameState.farmTiles.find(t => t.x === targetTileX && t.y === targetTileY);
        let solid = false;
        if (tile) {
          if (tile.type === 'water' || tile.type === 'well' || tile.type === 'tree') {
            solid = true;
          }
          // House area solid (except entrance)
          if (tile.type === 'house' && !(tile.x === 3 && tile.y === 3)) {
            solid = true;
          }
          if (tile.obstacle === 'rock' || tile.obstacle === 'stump') {
            solid = true;
          }
        }

        // Keep inside bounds
        const minX = 0;
        const maxX = (MAP_WIDTH - 1) * TILE_SIZE;
        const minY = 0;
        const maxY = (MAP_HEIGHT - 1) * TILE_SIZE;

        if (!solid && nextX >= minX && nextX <= maxX && nextY >= minY && nextY <= maxY) {
          p.x = nextX;
          p.y = nextY;
          if (onPlayerMove && stepTimer % 16 === 0) {
            onPlayerMove(p.x, p.y, p.dir);
          }
        }
      } else {
        p.frame = 0;
      }

      if (p.actionTimer > 0) {
        p.actionTimer--;
      }

      // Chimney smoke generator
      chimneySmokeTimerRef.current++;
      if (chimneySmokeTimerRef.current % 35 === 0) {
        particlesRef.current.push({
          x: 1.6 * TILE_SIZE + 8,
          y: 0.8 * TILE_SIZE,
          vx: 0.2 + (Math.random() - 0.5) * 0.3,
          vy: -0.8 - Math.random() * 0.4,
          color: 'rgba(230, 230, 230, 0.65)',
          size: 4 + Math.random() * 3,
          life: 45,
          maxLife: 45,
          type: 'smoke',
        });
      }

      // 2. RENDER EVERYTHING ON CANVAS
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      // Render Ground Tiles
      gameState.farmTiles.forEach(tile => {
        renderTile(ctx, tile);
      });

      // Render Target Reticle / Cursor
      const target = hoveredTileRef.current || getFrontTile();
      renderTargetCursor(ctx, target.x, target.y);

      // Render Player Character
      renderPlayer(ctx, p);

      // Render Particles
      renderParticles(ctx);

      // Render Floating Text
      renderFloatingTexts(ctx);

      // Render Day / Night Ambient Lighting Overlay
      renderLightingOverlay(ctx, canvas.width, canvas.height, gameState.timeOfDay, gameState.weather);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, getFrontTile, getSpeed, onPlayerMove]);

  // Canvas Mouse & Touch interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(clickX / TILE_SIZE);
    const tileY = Math.floor(clickY / TILE_SIZE);

    if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
      hoveredTileRef.current = { x: tileX, y: tileY };
      performActionOnTarget();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
      hoveredTileRef.current = { x: tileX, y: tileY };
    } else {
      hoveredTileRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    hoveredTileRef.current = null;
  };

  // -------------------------------------------------------------
  // PROCEDURAL PIXEL ART RENDERING FUNCTIONS
  // -------------------------------------------------------------

  const renderTile = (ctx: CanvasRenderingContext2D, tile: FarmTile) => {
    const px = tile.x * TILE_SIZE;
    const py = tile.y * TILE_SIZE;

    // Base background colors
    if (tile.type === 'grass') {
      ctx.fillStyle = (tile.x + tile.y) % 2 === 0 ? '#78b159' : '#6ea34f';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Subtle grass tufts / daisies
      if ((tile.x * 7 + tile.y * 13) % 5 === 0) {
        ctx.fillStyle = '#5d8a43';
        ctx.fillRect(px + 6, py + 8, 2, 4);
        ctx.fillRect(px + 9, py + 6, 2, 6);
      }
      if ((tile.x * 11 + tile.y * 3) % 9 === 0) {
        // Little white daisy
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 20, py + 18, 3, 3);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 21, py + 19, 1, 1);
      }
    } else if (tile.type === 'soil') {
      // Grass border base
      ctx.fillStyle = '#6ea34f';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      if (tile.tilled) {
        // Tilled Soil
        ctx.fillStyle = tile.watered ? '#5c3a21' : '#8b5a2b';
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        // Soil ridges / furrows
        ctx.fillStyle = tile.watered ? '#422814' : '#6b421a';
        ctx.fillRect(px + 4, py + 8, TILE_SIZE - 8, 2);
        ctx.fillRect(px + 4, py + 16, TILE_SIZE - 8, 2);
        ctx.fillRect(px + 4, py + 24, TILE_SIZE - 8, 2);

        // Wet glistening sparkles
        if (tile.watered) {
          ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
          ctx.fillRect(px + 6, py + 6, 2, 2);
          ctx.fillRect(px + 22, py + 14, 2, 2);
        }
      } else {
        // Untilled dirt patch
        ctx.fillStyle = '#a27b5c';
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#8c6245';
        ctx.fillRect(px + 6, py + 10, 3, 3);
        ctx.fillRect(px + 18, py + 20, 4, 3);
      }
    } else if (tile.type === 'path') {
      // Stone/Cobblestone Pathway
      ctx.fillStyle = '#9e8975';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#c4b5a5';
      ctx.fillRect(px + 3, py + 4, 10, 8);
      ctx.fillRect(px + 16, py + 6, 12, 10);
      ctx.fillRect(px + 5, py + 16, 11, 10);
      ctx.fillRect(px + 18, py + 19, 10, 8);
      ctx.fillStyle = '#786959';
      ctx.fillRect(px + 2, py + 13, TILE_SIZE - 4, 1);
    } else if (tile.type === 'water') {
      // Pond Water
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px + 4, py + 6, 12, 4);
      ctx.fillRect(px + 16, py + 18, 10, 4);

      // Water lilypads
      if ((tile.x + tile.y) % 3 === 0) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(px + 16, py + 16, 6, 0, Math.PI * 1.8);
        ctx.fill();
        // Little flower
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(px + 15, py + 14, 3, 3);
      }
    } else if (tile.type === 'well') {
      // Stone Well
      ctx.fillStyle = '#6ea34f';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Well base
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + 4, py + 10, 24, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 8, py + 14, 16, 10);
      // Wooden roof
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 2, py + 2, 28, 6);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + 4, py + 8, 3, 10);
      ctx.fillRect(px + 25, py + 8, 3, 10);
    } else if (tile.type === 'house') {
      renderHousePart(ctx, tile.x, tile.y, px, py);
    } else if (tile.type === 'shipping_bin') {
      // Shipping / Export Crate
      ctx.fillStyle = '#78b159';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Wooden Box
      ctx.fillStyle = '#92400e';
      ctx.fillRect(px + 3, py + 6, 26, 22);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + 5, py + 8, 22, 18);
      // Metal hinges & lock
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 13, py + 14, 6, 6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + 15, py + 17, 2, 3);
    } else if (tile.type === 'tree') {
      // Pine / Fruit Tree
      ctx.fillStyle = '#78b159';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 12, py + 18, 8, 14);

      // Foliage layers
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(px + 16, py + 14, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(px + 14, py + 11, 10, 0, Math.PI * 2);
      ctx.fill();

      // Apple fruits
      if (tile.x % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(px + 9, py + 9, 4, 4);
        ctx.fillRect(px + 19, py + 13, 4, 4);
      }
    }

    // Render Obstacles
    if (tile.obstacle === 'rock') {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 18, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 12, py + 14, 4, 3);
    } else if (tile.obstacle === 'weed') {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(px + 8, py + 14, 3, 10);
      ctx.fillRect(px + 14, py + 10, 3, 14);
      ctx.fillRect(px + 20, py + 16, 3, 8);
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(px + 15, py + 9, 3, 3);
    } else if (tile.obstacle === 'stump') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 8, py + 14, 16, 12);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 14, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Crops
    if (tile.crop) {
      renderCrop(ctx, px, py, tile.crop);
    }
  };

  const renderHousePart = (
    ctx: CanvasRenderingContext2D,
    tx: number,
    ty: number,
    px: number,
    py: number
  ) => {
    // Top Roof
    if (ty === 1) {
      ctx.fillStyle = '#b91c1c'; // Red clay roof
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px + 2, py + 4, TILE_SIZE - 4, 6);
      ctx.fillRect(px + 2, py + 16, TILE_SIZE - 4, 6);

      // Chimney at tx = 1
      if (tx === 1) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px + 6, py - 4, 10, 14);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(px + 4, py - 6, 14, 4);
      }
    }
    // Main walls & windows
    else if (ty === 2) {
      ctx.fillStyle = '#fde68a'; // Warm wood siding
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px, py + 6, TILE_SIZE, 2);
      ctx.fillRect(px, py + 18, TILE_SIZE, 2);

      // Window at tx = 2 or 4
      if (tx === 2 || tx === 4) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px + 6, py + 6, 18, 16);
        ctx.fillStyle = gameState.timeOfDay === 'night' ? '#fbbf24' : '#bae6fd';
        ctx.fillRect(px + 8, py + 8, 14, 12);
        // Window cross
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px + 14, py + 8, 2, 12);
        ctx.fillRect(px + 8, py + 13, 14, 2);
      }
    }
    // Porch & Door
    else if (ty === 3) {
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Wooden door at tx = 3
      if (tx === 3) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px + 4, py + 2, 24, 30);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(px + 6, py + 4, 20, 26);
        // Golden knob
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 20, py + 16, 3, 3);
      } else {
        // Wooden foundation & flower box
        ctx.fillStyle = '#92400e';
        ctx.fillRect(px + 2, py + 18, TILE_SIZE - 4, 10);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(px + 6, py + 14, 4, 4);
        ctx.fillRect(px + 16, py + 14, 4, 4);
        ctx.fillRect(px + 24, py + 14, 4, 4);
      }
    }
  };

  const renderCrop = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    crop: PlantedCrop
  ) => {
    const cropDef = CROPS[crop.type];
    const stage = crop.currentStage;

    // Stage 0: Fresh Seed Mound
    if (stage === 0) {
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(px + 11, py + 18, 10, 6);
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(px + 15, py + 14, 2, 4);
    }
    // Stage 1: Sprout
    else if (stage === 1) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(px + 15, py + 14, 2, 10);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px + 10, py + 12, 5, 4);
      ctx.fillRect(px + 17, py + 12, 5, 4);
    }
    // Stage 2: Growing Bush
    else if (stage === 2 && !crop.isMature) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(px + 10, py + 10, 12, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(px + 8, py + 8, 16, 8);
      // Small budding color
      ctx.fillStyle = cropDef.color;
      ctx.fillRect(px + 14, py + 13, 4, 4);
    }
    // Mature Stage: Full Vegetable with custom shapes!
    else {
      // Background leaves
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(px + 6, py + 6, 20, 10);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px + 10, py + 4, 12, 6);

      // Crop-specific artwork
      if (crop.type === 'turnip') {
        ctx.fillStyle = '#e27b9c'; // Turnip purple-pink top
        ctx.beginPath();
        ctx.arc(px + 16, py + 18, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff'; // White root base
        ctx.fillRect(px + 12, py + 19, 8, 4);
      } else if (crop.type === 'carrot') {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(px + 11, py + 14);
        ctx.lineTo(px + 21, py + 14);
        ctx.lineTo(px + 16, py + 26);
        ctx.closePath();
        ctx.fill();
      } else if (crop.type === 'tomato') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(px + 12, py + 18, 5, 0, Math.PI * 2);
        ctx.arc(px + 20, py + 18, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(px + 15, py + 10, 2, 4);
      } else if (crop.type === 'pumpkin') {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(px + 16, py + 18, 9, 0, Math.PI * 2);
        ctx.fill();
        // Pumpkin ribs
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(px + 15, py + 10, 2, 16);
        // Stem
        ctx.fillStyle = '#15803d';
        ctx.fillRect(px + 15, py + 7, 3, 4);
      } else if (crop.type === 'strawberry') {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(px + 13, py + 18, 4, 0, Math.PI * 2);
        ctx.arc(px + 19, py + 18, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 13, py + 18, 1, 1);
        ctx.fillRect(px + 19, py + 18, 1, 1);
      } else if (crop.type === 'corn') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(px + 13, py + 4, 6, 24);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(px + 14, py + 8, 5, 12);
      }

      // Gentle ready harvest glow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 4, py + 4, 24, 24);
    }
  };

  const renderTargetCursor = (ctx: CanvasRenderingContext2D, tx: number, ty: number) => {
    const px = tx * TILE_SIZE;
    const py = ty * TILE_SIZE;

    ctx.save();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    // Corner brackets
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(px, py, 4, 2);
    ctx.fillRect(px, py, 2, 4);

    ctx.fillRect(px + TILE_SIZE - 4, py, 4, 2);
    ctx.fillRect(px + TILE_SIZE - 2, py, 2, 4);

    ctx.fillRect(px, py + TILE_SIZE - 2, 4, 2);
    ctx.fillRect(px, py + TILE_SIZE - 4, 2, 4);

    ctx.fillRect(px + TILE_SIZE - 4, py + TILE_SIZE - 2, 4, 2);
    ctx.fillRect(px + TILE_SIZE - 2, py + TILE_SIZE - 4, 2, 4);

    ctx.restore();
  };

  const renderPlayer = (
    ctx: CanvasRenderingContext2D,
    p: typeof playerPosRef.current
  ) => {
    const px = Math.round(p.x);
    const py = Math.round(p.y);
    const bob = p.isMoving && (p.frame === 1 || p.frame === 3) ? -2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 28, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body / Overalls
    ctx.fillStyle = '#2563eb'; // Blue dungarees
    ctx.fillRect(px + 10, py + 16 + bob, 12, 10);
    // Red Shirt
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 8, py + 12 + bob, 16, 6);

    // Legs / Boots
    ctx.fillStyle = '#78350f';
    if (p.isMoving && p.frame % 2 === 1) {
      ctx.fillRect(px + 9, py + 25 + bob, 5, 5);
      ctx.fillRect(px + 18, py + 23 + bob, 5, 5);
    } else {
      ctx.fillRect(px + 10, py + 25 + bob, 4, 5);
      ctx.fillRect(px + 18, py + 25 + bob, 4, 5);
    }

    // Head / Face
    ctx.fillStyle = '#fbcfe8'; // Skin
    ctx.fillRect(px + 11, py + 6 + bob, 10, 8);

    // Eyes based on direction
    ctx.fillStyle = '#1e293b';
    if (p.dir === 'down') {
      ctx.fillRect(px + 13, py + 10 + bob, 2, 2);
      ctx.fillRect(px + 17, py + 10 + bob, 2, 2);
    } else if (p.dir === 'left') {
      ctx.fillRect(px + 11, py + 10 + bob, 2, 2);
    } else if (p.dir === 'right') {
      ctx.fillRect(px + 19, py + 10 + bob, 2, 2);
    }

    // Straw Farmer Hat
    ctx.fillStyle = '#f59e0b'; // Straw brim
    ctx.fillRect(px + 6, py + 4 + bob, 20, 3);
    ctx.fillStyle = '#d97706'; // Hat crown
    ctx.fillRect(px + 10, py - 1 + bob, 12, 6);
    // Hat red ribbon
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 10, py + 3 + bob, 12, 2);

    // Render Tool swing animation if active
    if (p.actionTimer > 0) {
      const swingOffset = Math.sin((p.actionTimer / 16) * Math.PI) * 10;
      if (p.actionType === 'water') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + (p.dir === 'left' ? -6 : 22), py + 14 - swingOffset, 8, 6);
      } else if (p.actionType === 'till') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px + (p.dir === 'left' ? -4 : 20), py + 12 + swingOffset, 4, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(px + (p.dir === 'left' ? -8 : 18), py + 22 + swingOffset, 8, 4);
      }
    }
  };

  const renderParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach((pt, i) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;

      const alpha = pt.life / pt.maxLife;
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, alpha);

      if (pt.type === 'rain') {
        ctx.fillRect(pt.x, pt.y, 1.5, 8);
      } else if (pt.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * (1 + (1 - alpha)), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }

      ctx.globalAlpha = 1.0;
    });

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  const renderFloatingTexts = (ctx: CanvasRenderingContext2D) => {
    floatingTextsRef.current.forEach(ft => {
      ft.y -= 0.6;
      ft.life--;
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);
  };

  const renderLightingOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeOfDay: string,
    weather: string
  ) => {
    ctx.save();

    if (timeOfDay === 'morning') {
      // Golden soft sunrise
      ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (timeOfDay === 'evening') {
      // Warm Amber Sunset
      ctx.fillStyle = 'rgba(249, 115, 22, 0.16)';
      ctx.fillRect(0, 0, width, height);
    } else if (timeOfDay === 'night') {
      // Deep Indigo Night with soft spotlight around player & house window
      ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
      ctx.fillRect(0, 0, width, height);

      // Player lantern light
      const p = playerPosRef.current;
      const grad = ctx.createRadialGradient(
        p.x + 16,
        p.y + 20,
        10,
        p.x + 16,
        p.y + 20,
        70
      );
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x + 16, p.y + 20, 70, 0, Math.PI * 2);
      ctx.fill();

      // House window lantern glow
      const houseGrad = ctx.createRadialGradient(
        3 * TILE_SIZE,
        2.5 * TILE_SIZE,
        15,
        3 * TILE_SIZE,
        2.5 * TILE_SIZE,
        80
      );
      houseGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      houseGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = houseGrad;
      ctx.beginPath();
      ctx.arc(3 * TILE_SIZE, 2.5 * TILE_SIZE, 80, 0, Math.PI * 2);
      ctx.fill();
    }

    if (weather === 'rainy') {
      ctx.fillStyle = 'rgba(30, 58, 138, 0.18)';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  };

  return (
    <div
      id="farm-canvas-outer-frame"
      className="relative flex items-center justify-center bg-[#E8DCC4] rounded-3xl p-2 sm:p-4 shadow-inner border-[8px] sm:border-[12px] border-[#D7C4A1] select-none"
      style={{
        width: '100%',
        maxWidth: `${canvasDimensions.width + 32}px`,
      }}
    >
      {/* Decorative Cottage Crest */}
      <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#D7C4A1] z-10">
        <span className="text-lg sm:text-xl">🏡</span>
      </div>

      <div
        id="farm-canvas-container"
        className="relative flex items-center justify-center bg-[#5A7D6C]/20 rounded-2xl overflow-hidden shadow-inner border-2 border-[#634832]/20 select-none cursor-crosshair w-full"
        style={{
          aspectRatio: `${MAP_WIDTH}/${MAP_HEIGHT}`,
        }}
      >
        <canvas
          id="farm-main-canvas"
          ref={canvasRef}
          width={MAP_WIDTH * TILE_SIZE}
          height={MAP_HEIGHT * TILE_SIZE}
          className="w-full h-full object-contain pixelated"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
};
