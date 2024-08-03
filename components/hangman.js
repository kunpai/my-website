import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      <div className="text-center mb-4">
        <h2>{maskedWord}</h2>
        <p>Remaining Guesses: {remainingGuesses}</p>
        <p>Word Length: {wordLength} letters</p>
      </div>
      <div className="d-flex flex-wrap justify-content-center mb-4">
        {alphabet.map(letter => (
          <button
            key={letter}
            className="btn btn-outline-primary m-1"
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.includes(letter) || gameOver}
          >
            {letter}
          </button>
        ))}
      </div>
      {gameOver && (
        <div className="text-center">
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