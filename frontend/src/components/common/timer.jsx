import React from 'react';
import { useTimer } from 'react-timer-hook';
import Button from './button';

function MyTimer({ expiryTimestamp, handleRefresh }) {
  const {
    totalSeconds,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, onExpire: () => console.warn('onExpire called'), interval: 20 });


  const handleRestart = (newTime) => {
    restart(newTime);
    handleRefresh(newTime);
  }

  return (
    <div style={{textAlign: 'center'}}>
      <div style={{fontSize: '100px'}}>
        <span>{minutes < 10 ? '0' + minutes : minutes}</span>:<span>{seconds < 10 ? '0' + seconds : seconds}</span>
      </div>
      <Button text="Restart" onClick={() => handleRestart(expiryTimestamp)} />
    </div>
  );
}

export default function Timer({ minutes = 5, seconds = 0, handleRefresh }) {
  const time = new Date();
  time.setSeconds(time.getSeconds() + minutes * 60 + seconds); // 10 minutes timer
  return (
    <div>
      <MyTimer expiryTimestamp={time} handleRefresh={handleRefresh} />
    </div>
  );
}