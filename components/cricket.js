import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CricketGame = () => {
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [gamePhase, setGamePhase] = useState('toss');
  const [lastAction, setLastAction] = useState('');
  const [tossWinner, setTossWinner] = useState('');
  const [playerChoice, setPlayerChoice] = useState('');
  const [target, setTarget] = useState(null);

  const maxWickets = 10;
  const maxBalls = 6;

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
    if (wickets === maxWickets || balls === maxBalls) {
      endInnings();
    }
  }, [wickets, balls, endInnings]);

  useEffect(() => {
    let interval;
    if (gamePhase === 'cpuBatting' && balls < maxBalls && wickets < maxWickets && (target === null || cpuScore < target)) {
      interval = setInterval(playBall, 1000);
    }
    return () => clearInterval(interval);
  }, [gamePhase, balls, wickets, cpuScore, target]);

  useEffect(() => {
    if (gamePhase === 'chooseBatOrField' && tossWinner === 'cpu') {
      const cpuChoice = Math.random() < 0.5 ? 'bat' : 'field';
      handleBatFieldChoice(cpuChoice);
    }
  }, [gamePhase, tossWinner]);

  const resetInnings = () => {
    setWickets(0);
    setBalls(0);
    setLastAction('');
  };

  const playBall = () => {
    const outcomes = [0, 1, 2, 3, 4, 6, 'W'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    if (result === 'W') {
      setWickets(prev => prev + 1);
      setLastAction('Wicket!');
    } else {
      if (gamePhase === 'playerBatting') {
        setPlayerScore(prev => prev + result);
      } else {
        setCpuScore(prev => prev + result);
      }
      setLastAction(`${result} run${result !== 1 ? 's' : ''}`);
    }

    setBalls(prev => prev + 1);

    if (target !== null) {
      if (gamePhase === 'playerBatting' && playerScore + result >= target) {
        setGamePhase('gameOver');
      } else if (gamePhase === 'cpuBatting' && cpuScore + result >= target) {
        setGamePhase('gameOver');
      }
    }
  };

  const handleToss = (choice) => {
    const tossResult = Math.random() < 0.5 ? 'heads' : 'tails';
    const winner = tossResult === choice ? 'player' : 'cpu';
    setTossWinner(winner);
    setPlayerChoice(choice);
    setGamePhase('chooseBatOrField');
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
            <button className="btn btn-primary m-2" onClick={() => handleToss('heads')}>Heads</button>
            <button className="btn btn-primary m-2" onClick={() => handleToss('tails')}>Tails</button>
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
        return (
          <div>
            <h2>{gamePhase === 'playerBatting' ? 'Your' : 'CPU'} Innings</h2>
            <p>Score: {gamePhase === 'playerBatting' ? playerScore : cpuScore}/{wickets}</p>
            <p>Overs: {Math.floor(balls / 6)}.{balls % 6}</p>
            <p>Last Action: {lastAction}</p>
            {target !== null && (
              <p>Target: {target} (Need {target - (gamePhase === 'playerBatting' ? playerScore : cpuScore)} runs from {maxBalls - balls} balls)</p>
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
            <p>Your Score: {playerScore}</p>
            <p>CPU Score: {cpuScore}</p>
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
