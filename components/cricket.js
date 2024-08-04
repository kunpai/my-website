import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CricketGame = () => {
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [playerWickets, setPlayerWickets] = useState(0);
  const [cpuWickets, setCpuWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [gamePhase, setGamePhase] = useState('toss');
  const [lastAction, setLastAction] = useState('');
  const [tossWinner, setTossWinner] = useState('');
  const [playerChoice, setPlayerChoice] = useState('');
  const [target, setTarget] = useState(null);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);

  const maxWickets = 10;
  const maxBalls = 6;

  const ballRef = useRef(null);
  const wicketRef = useRef(null);
  const playerScoreRef = useRef(null);
  const cpuScoreRef = useRef(null);
  const coinRef = useRef(null);

  const endInnings = useCallback(() => {
    if (gamePhase === 'playerBatting') {
      setTarget(playerScore + 1);
      setGamePhase('cpuBatting');
    } else if (gamePhase === 'cpuBatting') {
      if (target === null) {
        setTarget(cpuScore + 1);
        setGamePhase('playerBatting');
      } else {
        setGamePhase('gameOver');
      }
    }
    resetInnings();
  }, [gamePhase, playerScore, cpuScore, target]);

  useEffect(() => {
    const currentWickets = gamePhase === 'playerBatting' ? playerWickets : cpuWickets;
    if (currentWickets === maxWickets || balls === maxBalls) {
      endInnings();
    }
  }, [playerWickets, cpuWickets, balls, gamePhase, endInnings]);

  useEffect(() => {
    let interval;
    if (gamePhase === 'cpuBatting' && balls < maxBalls && cpuWickets < maxWickets && (target === null || cpuScore < target)) {
      interval = setInterval(playBall, 1000);
    }
    return () => clearInterval(interval);
  }, [gamePhase, balls, cpuWickets, cpuScore, target]);

  useEffect(() => {
    if (gamePhase === 'chooseBatOrField' && tossWinner === 'cpu') {
      const cpuChoice = Math.random() < 0.5 ? 'bat' : 'field';
      handleBatFieldChoice(cpuChoice);
    }
  }, [gamePhase, tossWinner]);

  const resetInnings = () => {
    setBalls(0);
    setLastAction('');
  };

  const animateBall = () => {
    if (ballRef.current) {
      ballRef.current.classList.remove('animate');
      void ballRef.current.offsetWidth;
      ballRef.current.classList.add('animate');
    }
  };

  const animateWicket = () => {
    if (wicketRef.current) {
      wicketRef.current.classList.add('wicket-fall');
      setTimeout(() => {
        if (wicketRef.current) {
          wicketRef.current.classList.remove('wicket-fall');
        }
      }, 500);
    }
  };

  const animateScore = (isPlayer) => {
    try {
      const ref = isPlayer ? playerScoreRef : cpuScoreRef;
      if (ref.current) {
        ref.current.classList.add('score-change');
        setTimeout(() => {
          if (ref.current) {
            ref.current.classList.remove('score-change');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error animating score:', error);
    }
  };

  const animateCoin = () => {
    setIsCoinFlipping(true);
    setTimeout(() => {
      setIsCoinFlipping(false);
    }, 2000);
  };

  const playBall = () => {
    const outcomes = [0, 1, 2, 3, 4, 6, 'W'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    animateBall();

    if (result === 'W') {
      if (gamePhase === 'playerBatting') {
        setPlayerWickets(prev => prev + 1);
      } else {
        setCpuWickets(prev => prev + 1);
      }
      setLastAction('Wicket!');
      animateWicket();
    } else {
      if (gamePhase === 'playerBatting') {
        setPlayerScore(prev => prev + result);
        animateScore(true);
        // Check if the player has reached or surpassed the target
        if (target !== null && playerScore + result >= target) {
          setGamePhase('gameOver');
          return;
        }
      } else {
        setCpuScore(prev => prev + result);
        animateScore(false);
        // Check if the CPU has reached or surpassed the target
        if (target !== null && cpuScore + result >= target) {
          setGamePhase('gameOver');
          return;
        }
      }
      setLastAction(`${result} run${result !== 1 ? 's' : ''}`);
    }

    setBalls(prev => prev + 1);
    // Move to the end innings if the innings are over
    if (gamePhase === 'playerBatting' && (playerWickets + 1 === maxWickets || balls + 1 === maxBalls)) {
      endInnings();
    } else if (gamePhase === 'cpuBatting' && (cpuWickets + 1 === maxWickets || balls + 1 === maxBalls)) {
      endInnings();
    }
  };

  const handleToss = (choice) => {
    animateCoin();
    setTimeout(() => {
      const tossResult = Math.random() < 0.5 ? 'heads' : 'tails';
      const winner = tossResult === choice ? 'player' : 'cpu';
      setTossWinner(winner);
      setPlayerChoice(choice);
      setGamePhase('chooseBatOrField');
    }, 2000);
  };

  const handleBatFieldChoice = (choice) => {
    if ((tossWinner === 'player' && choice === 'bat') || (tossWinner === 'cpu' && choice === 'field')) {
      setGamePhase('playerBatting');
    } else {
      setGamePhase('cpuBatting');
    }
  };

  const resetGame = () => {
    setPlayerScore(0);
    setCpuScore(0);
    setPlayerWickets(0);
    setCpuWickets(0);
    resetInnings();
    setGamePhase('toss');
    setTossWinner('');
    setPlayerChoice('');
    setTarget(null);
  };

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'toss':
        return (
          <div>
            <h2>Toss Time!</h2>
            <div className={`coin ${isCoinFlipping ? 'coin-flip' : ''}`} ref={coinRef}></div>
            <button className="btn btn-primary m-2" onClick={() => handleToss('heads')} disabled={isCoinFlipping}>Heads</button>
            <button className="btn btn-primary m-2" onClick={() => handleToss('tails')} disabled={isCoinFlipping}>Tails</button>
          </div>
        );
      case 'chooseBatOrField':
        return (
          <div>
            <h2>{tossWinner === 'player' ? 'You won' : 'CPU won'} the toss!</h2>
            <p>{tossWinner === 'player' ? 'Choose to bat or field:' : 'CPU is choosing...'}</p>
            {tossWinner === 'player' && (
              <div>
                <button className="btn btn-primary m-2" onClick={() => handleBatFieldChoice('bat')}>Bat</button>
                <button className="btn btn-primary m-2" onClick={() => handleBatFieldChoice('field')}>Field</button>
              </div>
            )}
          </div>
        );
      case 'playerBatting':
      case 'cpuBatting':
        const currentScore = gamePhase === 'playerBatting' ? playerScore : cpuScore;
        const currentWickets = gamePhase === 'playerBatting' ? playerWickets : cpuWickets;
        return (
          <div>
            <h2>{gamePhase === 'playerBatting' ? 'Your' : 'CPU'} Innings</h2>
            <div className="cricket-field">
              <div className="pitch"></div>
              <div className="cricket-ball" ref={ballRef}></div>
              <div className="wicket wicket-left"></div>
              <div className="wicket wicket-center" ref={wicketRef}></div>
              <div className="wicket wicket-right"></div>
            </div>
            <p ref={gamePhase === 'playerBatting' ? playerScoreRef : cpuScoreRef}>
              Score: {currentScore}/{currentWickets}
            </p>
            <p>Overs: {Math.floor(balls / 6)}.{balls % 6}</p>
            <p>Last Action: {lastAction}</p>
            {target !== null && (
              <p>Target: {target} (Need {target - currentScore} runs from {maxBalls - balls} balls)</p>
            )}
            {gamePhase === 'playerBatting' && (
              <button className="btn btn-primary" onClick={playBall}>
                Play Ball
              </button>
            )}
          </div>
        );
      case 'gameOver':
        const winner = playerScore > cpuScore ? 'You win!' : playerScore < cpuScore ? 'CPU wins!' : 'It\'s a tie!';
        return (
          <div>
            <h2>Game Over!</h2>
            <p>Your Score: {playerScore}/{playerWickets}</p>
            <p>CPU Score: {cpuScore}/{cpuWickets}</p>
            <h3>{winner}</h3>
            <button className="btn btn-primary" onClick={resetGame}>
              Play Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Cricket Game</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              {renderGameContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketGame;
