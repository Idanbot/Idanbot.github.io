import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Play, RotateCcw, Trophy, Terminal, Lock } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const SPEED = 80;

export const DeployGame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [snake, setSnake] = useState<number[][]>([[10, 10]]);
  const [food, setFood] = useState<number[]>([15, 15]);
  const [direction, setDirection] = useState<string>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<number | null>(null);

  const currentMoveDir = useRef<string>('RIGHT');

  const startGame = () => {
    setSnake([[10, 10], [9, 10], [8, 10]]);
    setFood([Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]);
    setDirection('RIGHT');
    currentMoveDir.current = 'RIGHT';
    setScore(0);
    setGameStatus('playing');
  };

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const moveSnake = () => {
      setSnake(prev => {
        const newSnake = [...prev];
        const head = newSnake[0];
        const newHead = [...head];
        
        currentMoveDir.current = direction;

        switch (direction) {
          case 'UP': newHead[1] -= 1; break;
          case 'DOWN': newHead[1] += 1; break;
          case 'LEFT': newHead[0] -= 1; break;
          case 'RIGHT': newHead[0] += 1; break;
        }

        if (newHead[0] < 0) newHead[0] = GRID_SIZE - 1;
        if (newHead[0] >= GRID_SIZE) newHead[0] = 0;
        if (newHead[1] < 0) newHead[1] = GRID_SIZE - 1;
        if (newHead[1] >= GRID_SIZE) newHead[1] = 0;

        if (newSnake.some(seg => seg[0] === newHead[0] && seg[1] === newHead[1])) {
          setGameStatus('gameover');
          if (score > highScore) setHighScore(score);
          return prev;
        }

        newSnake.unshift(newHead);

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore(s => s + 1);
          let newFood: number[];
          do {
            newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
          } while (newSnake.some(seg => seg[0] === newFood[0] && seg[1] === newFood[1]));
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, SPEED) as unknown as number;
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameStatus, direction, food, score, highScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setGameStatus('idle');
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      const currentDir = currentMoveDir.current;

      switch(e.key) {
        case 'ArrowUp': 
          if (currentDir !== 'DOWN') setDirection('UP'); 
          break;
        case 'ArrowDown': 
          if (currentDir !== 'UP') setDirection('DOWN'); 
          break;
        case 'ArrowLeft': 
          if (currentDir !== 'RIGHT') setDirection('LEFT'); 
          break;
        case 'ArrowRight': 
          if (currentDir !== 'LEFT') setDirection('RIGHT'); 
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isModalOpen]);

  return (
    <>
      <div className="flex justify-center py-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsModalOpen(true); }}
          className="group relative px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl font-bold tracking-widest overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <AlertTriangle className="animate-pulse" />
            DEPLOY TO PRODUCTION
          </span>
          <div className="absolute inset-0 bg-red-500/10 transform skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <div className="max-w-2xl w-full bg-[#0a0a0a] border-4 border-[#333] rounded-[2rem] p-1 relative shadow-2xl overflow-hidden">
              {/* CRT Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
              
              <div className="bg-[#050505] border border-white/10 p-6 rounded-[1.5rem] relative z-10">
                <div className="flex justify-between items-center mb-6 font-mono">
                  <div className="flex items-center gap-2 text-green-500">
                    <Terminal size={20} />
                    <span>root@production:~/deploy</span>
                  </div>
                  <button 
                    onClick={() => { setIsModalOpen(false); setGameStatus('idle'); }}
                    className="text-gray-500 hover:text-white uppercase text-xs tracking-wider"
                  >
                    [ ESC ] Close
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex justify-between w-full max-w-[400px] mb-2 font-mono text-sm">
                    <span className="text-green-400">BUGS FIXED: {score}</span>
                    <span className="text-yellow-400 flex items-center gap-1"><Trophy size={14}/> HIGH: {highScore}</span>
                  </div>

                  {/* Easter Egg Hint */}
                  {score > 5 && (
                    <div className="mb-4 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-xs flex items-center gap-2 animate-bounce">
                      <Lock size={12} /> 
                      <span>SECRET UNLOCKED: ↑ ↑ ↓ ↓ ← → ← → B A</span>
                    </div>
                  )}

                  <div 
                    className="relative bg-black border-2 border-green-900 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
                    style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
                  >
                    {gameStatus === 'playing' || gameStatus === 'gameover' ? (
                      <>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(0deg,transparent_19px,#00ff00_20px),linear-gradient(90deg,transparent_19px,#00ff00_20px)] bg-[size:20px_20px]" />

                        {snake.map((seg, i) => (
                          <div
                            key={i}
                            className={`absolute rounded-sm ${i === 0 ? 'z-10' : ''}`}
                            style={{
                              left: seg[0] * CELL_SIZE,
                              top: seg[1] * CELL_SIZE,
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              backgroundColor: i === 0 ? '#00ff00' : `rgba(0, 255, 0, ${1 - i / (snake.length + 5)})`,
                              boxShadow: i === 0 ? '0 0 10px #00ff00' : 'none'
                            }}
                          >
                            {i === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black">
                                {['>', 'v', '<', '^'][['RIGHT', 'DOWN', 'LEFT', 'UP'].indexOf(direction)]}
                              </div>
                            )}
                          </div>
                        ))}
                        <div
                          className="absolute bg-red-500 rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                          style={{
                            left: food[0] * CELL_SIZE,
                            top: food[1] * CELL_SIZE,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                            BUG
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90">
                        <div className="text-green-500 text-4xl font-bold tracking-tighter">
                          SYSTEM FAILURE
                        </div>
                        <div className="text-gray-500 font-mono text-xs">
                          ERROR_CODE: 0xDEADBEEF
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 h-12">
                    {gameStatus === 'idle' && (
                      <button
                        onClick={startGame}
                        className="flex items-center gap-3 px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-sm transition-all hover:shadow-[0_0_20px_rgba(0,255,0,0.4)]"
                      >
                        <Play size={18} /> INITIATE DEBUGGING
                      </button>
                    )}
                    {gameStatus === 'playing' && (
                       <div className="flex gap-2">
                         {['←', '↓', '↑', '→'].map((arrow) => (
                           <div key={arrow} className="w-8 h-8 border border-white/20 rounded flex items-center justify-center text-white/20 font-mono text-xs">
                             {arrow}
                           </div>
                         ))}
                       </div>
                    )}
                    {gameStatus === 'gameover' && (
                      <button
                        onClick={startGame}
                        className="flex items-center gap-3 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-sm transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                      >
                        <RotateCcw size={18} /> RESTART SEQUENCE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
