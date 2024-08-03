import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const HangmanFigure = ({ incorrectGuesses }) => {
    const parts = [
        <circle key="head" cx="150" cy="30" r="20" />, // Head
        <line key="body" x1="150" y1="50" x2="150" y2="100" />, // Body
        <line key="left-arm" x1="150" y1="60" x2="120" y2="80" />, // Left arm
        <line key="right-arm" x1="150" y1="60" x2="180" y2="80" />, // Right arm
        <line key="left-leg" x1="150" y1="100" x2="120" y2="130" />, // Left leg
        <line key="right-leg" x1="150" y1="100" x2="180" y2="130" />, // Right leg
    ];

  return (
    <svg height="200" width="300" style={{ backgroundColor: '#f0f0f0', borderRadius: '10px' }}>
      {/* Gallows */}
      <line x1="50" y1="180" x2="250" y2="180" stroke="black" strokeWidth="4" />
      <line x1="100" y1="180" x2="100" y2="20" stroke="black" strokeWidth="4" />
      <line x1="100" y1="20" x2="150" y2="20" stroke="black" strokeWidth="4" />
      <line x1="150" y1="20" x2="150" y2="10" stroke="black" strokeWidth="4" />
      {/* Figure parts */}
      {parts.slice(0, incorrectGuesses).map((part, index) =>
        React.cloneElement(part, { key: index, stroke: "black", strokeWidth: "4", fill: "none" })
      )}
    </svg>
  );
};

function Hangman() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [remainingGuesses, setRemainingGuesses] = useState(6);
  const [wordLength, setWordLength] = useState(5);
  const gameContainerRef = useRef(null);

  useEffect(() => {
    fetchWord();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, [word]);

  const fetchWord = async () => {
    const newLength = Math.floor(Math.random() * 5) + 4; // Random length between 4 and 8
    setWordLength(newLength);
    try {
      const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${newLength}`);
      const [fetchedWord] = await response.json();
      setWord(fetchedWord.toUpperCase());
    } catch (error) {
      console.error('Error fetching word:', error);
      setWord('ERROR');
    }
  };

  const handleGuess = (letter) => {
    if (!guessedLetters.includes(letter) && !gameOver) {
      setGuessedLetters([...guessedLetters, letter]);
      if (!word.includes(letter)) {
        setRemainingGuesses(remainingGuesses - 1);
      }
    }
  };

  const handleKeyDown = (event) => {
    const letter = event.key.toUpperCase();
    if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
      handleGuess(letter);
    }
  };

  const maskedWord = word.split('').map(letter => 
    guessedLetters.includes(letter) ? letter : '_'
  ).join(' ');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const gameOver = remainingGuesses === 0 || !maskedWord.includes('_');

  return (
    <div
        className="container mt-5"
        ref={gameContainerRef}
        tabIndex="0"
        onKeyDown={handleKeyDown}
        style={{ outline: 'none' }}
        >
        <h1 className="text-center mb-4">Hangman</h1>
        <div className="row justify-content-center">
            <div className="col-md-6 mb-4 text-center">
            <HangmanFigure incorrectGuesses={6 - remainingGuesses} />
            </div>
            <div className="col-md-6 mb-4">
            <div className="text-center mb-4">
                <h2 style={{ fontSize: '2rem', letterSpacing: '0.2rem' }}>{maskedWord}</h2>
                <p>Remaining Guesses: {remainingGuesses}</p>
                <p>Word Length: {wordLength} letters</p>
            </div>
            <div className="d-flex flex-wrap justify-content-center mb-4">
                {alphabet.map(letter => (
                <button
                    key={letter}
                    className={`btn m-1 ${guessedLetters.includes(letter) 
                    ? word.includes(letter) ? 'btn-success' : 'btn-danger' 
                    : 'btn-outline-primary'}`}
                    onClick={() => handleGuess(letter)}
                    disabled={guessedLetters.includes(letter) || gameOver}
                    style={{ width: '40px', height: '40px', padding: '0' }}
                >
                    {letter}
                </button>
                ))}
            </div>
            </div>
        </div>
        {gameOver && (
            <div className="text-center mt-4">
            <h3>{remainingGuesses === 0 ? 'You lost!' : 'You won!'}</h3>
            <p>The word was: {word}</p>
            <button
                className="btn btn-primary"
                onClick={() => {
                fetchWord();
                setGuessedLetters([]);
                setRemainingGuesses(6);
                }}
            >
                Play Again
            </button>
            </div>
        )}
        </div>
    );
}

export default Hangman;