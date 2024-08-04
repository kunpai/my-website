import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!isXNext && !winner) {
      const timer = setTimeout(() => {
        cpuMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner]);

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    checkWinner(newBoard);
  };

  const cpuMove = () => {
    const bestMove = findBestMove(board);
    const newBoard = [...board];
    newBoard[bestMove] = 'O';
    setBoard(newBoard);
    setIsXNext(true);
    checkWinner(newBoard);
  };

  const checkWinner = (currentBoard) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        setWinner(currentBoard[a]);
        return;
      }
    }

    if (!currentBoard.includes(null)) {
      setWinner('Draw');
    }
  };

  const findBestMove = (currentBoard) => {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false, -Infinity, Infinity);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const minimax = (currentBoard, depth, isMaximizing, alpha, beta) => {
    const result = checkGameResult(currentBoard);
    if (result !== null) {
      return scores[result];
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          let score = minimax(currentBoard, depth + 1, false, alpha, beta);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          let score = minimax(currentBoard, depth + 1, true, alpha, beta);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    }
  };

  const checkGameResult = (currentBoard) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }

    return currentBoard.includes(null) ? null : 'Draw';
  };

  const scores = {
    'O': 10,
    'X': -10,
    'Draw': 0
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (index) => (
    <button className="btn btn-light border" style={{width: '100px', height: '100px', fontSize: '2em'}} onClick={() => handleClick(index)}>
      {board[index]}
    </button>
  );

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Tic Tac Toe</h1>
      <div className="d-flex justify-content-center">
        <div>
          <div className="row">
            <div className="col-4">{renderSquare(0)}</div>
            <div className="col-4">{renderSquare(1)}</div>
            <div className="col-4">{renderSquare(2)}</div>
          </div>
          <div className="row">
            <div className="col-4">{renderSquare(3)}</div>
            <div className="col-4">{renderSquare(4)}</div>
            <div className="col-4">{renderSquare(5)}</div>
          </div>
          <div className="row">
            <div className="col-4">{renderSquare(6)}</div>
            <div className="col-4">{renderSquare(7)}</div>
            <div className="col-4">{renderSquare(8)}</div>
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        {winner ? (
          <div>
            <h2>{winner === 'Draw' ? "It's a draw!" : `Winner: ${winner}`}</h2>
            <button className="btn btn-primary mt-2" onClick={resetGame}>Play Again</button>
          </div>
        ) : (
          <h2>{isXNext ? "Your turn" : "CPU's turn"}</h2>
        )}
      </div>
    </div>
  );
}

export default TicTacToe;
