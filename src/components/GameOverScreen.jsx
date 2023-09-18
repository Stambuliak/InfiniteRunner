import './GameOverScreen.css';

import React from 'react';

const GameOverScreen = ({ score }) => {
  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="game-over">
      <h1>Game Over</h1>
      <p>You lost the game!</p>
      <p>Your score: {score}</p>
      <button className='button' onClick={reloadPage}>Try Again!</button>
    </div>
  );
};

export default GameOverScreen;
