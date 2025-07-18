import React, { useState, useEffect, useRef } from 'react';
import './CalmLoop.css';

const CalmLoop = () => {
  const [gameState, setGameState] = useState('menu'); 
  const [breathingDuration, setBreathingDuration] = useState(1);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); 
  const [breathingTime, setBreathingTime] = useState(0);
  const [ambientSound, setAmbientSound] = useState(null);
  const [focusScore, setFocusScore] = useState(0);
  const [focusTarget, setFocusTarget] = useState(5);
  const [currentShape, setCurrentShape] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(7000);
  const [shapeTimer, setShapeTimer] = useState(0);
  const [preMood, setPreMood] = useState({ emoji: '', word: '' });
  const [postMood, setPostMood] = useState({ emoji: '', word: '' });
  const [moodHistory, setMoodHistory] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    lastSessionDate: null,
    streakDays: 0
  });
  const breathingIntervalRef = useRef(null);
  const focusIntervalRef = useRef(null);
  const moodEmojis = ['😊', '😌', '🙂', '😔', '😟', '😢'];
  const breathingCycle = {
    inhale: 4,
    hold: 4,
    exhale: 6
  };
  const startBreathing = () => {
    setGameState('breathing');
    setBreathingActive(true);
    setBreathingTime(0);
    setBreathingPhase('inhale');
    let cycleTime = 0;
    const totalCycleTime = breathingCycle.inhale + breathingCycle.hold + breathingCycle.exhale;
    breathingIntervalRef.current = setInterval(() => {
      cycleTime += 0.1;
      setBreathingTime(prev => prev + 0.1);
      const cyclePosition = cycleTime % totalCycleTime;
      if (cyclePosition < breathingCycle.inhale) {
        setBreathingPhase('inhale');
      } else if (cyclePosition < breathingCycle.inhale + breathingCycle.hold) {
        setBreathingPhase('hold');
      } else {
        setBreathingPhase('exhale');
      }
      if (breathingTime >= breathingDuration * 60) {
        stopBreathing();
        startFocusGame();
      }
    }, 100);
  };
  const stopBreathing = () => {
    setBreathingActive(false);
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
    }
  };
  const startFocusGame = () => {
    setGameState('focus');
    setFocusScore(0);
    setCurrentShape(null);
    setTimeout(() => {
      generateShape();
    }, 1000);
    focusIntervalRef.current = setInterval(() => {
      generateShape();
    }, gameSpeed);
  };
  const generateShape = () => {
    setCurrentShape(null);
    setShapeTimer(0);
    setTimeout(() => {
      const colors = ['blue', 'red', 'blue', 'blue'];
      const shapes = ['circle', 'square', 'triangle'];
      const maxX = 250; 
      const maxY = 200; 
      const minX = 20;
      const minY = 20;
      setCurrentShape({
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
        id: Date.now()
      });
      setShapeTimer(5);
      const timerInterval = setInterval(() => {
        setShapeTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setCurrentShape(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 500);
  };
  const handleShapeClick = (shape) => {
    if (shape.color === 'blue') {
      setFocusScore(prev => prev + 1);
      setCurrentShape(null);
      setShapeTimer(0);
      if (focusScore + 1 >= focusTarget) {
        clearInterval(focusIntervalRef.current);
        setGameState('mood-post');
      }
    } else {
      setFocusScore(0);
      setCurrentShape(null);
      setShapeTimer(0);
    }
  };
  const loadStoredData = () => {
    try {
      const moods = JSON.parse(localStorage.getItem('calmLoopMoods') || '[]');
      const stats = JSON.parse(localStorage.getItem('calmLoopStats') || JSON.stringify({
        totalSessions: 0,
        lastSessionDate: null,
        streakDays: 0
      }));
      setMoodHistory(moods);
      setSessionStats(stats);
    } catch (error) {
      console.error('Error loading CalmLoop data:', error);
    }
  };
  const saveMoodData = () => {
    const today = new Date().toISOString().split('T')[0];
    const sessionData = {
      id: Date.now(),
      date: today,
      pre: preMood,
      post: postMood,
      timestamp: new Date().toISOString(),
      duration: breathingDuration,
      focusScore: focusScore,
      sessionType: 'complete'
    };
    const existingMoods = JSON.parse(localStorage.getItem('calmLoopMoods') || '[]');
    const updatedMoods = [...existingMoods, sessionData];
    localStorage.setItem('calmLoopMoods', JSON.stringify(updatedMoods));
    setMoodHistory(updatedMoods);
    const newStats = {
      totalSessions: sessionStats.totalSessions + 1,
      lastSessionDate: today,
      streakDays: calculateStreak(sessionStats.lastSessionDate, today)
    };
    localStorage.setItem('calmLoopStats', JSON.stringify(newStats));
    setSessionStats(newStats);
  };
  const calculateStreak = (lastDate, currentDate) => {
    if (!lastDate) return 1;
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return sessionStats.streakDays + 1;
    } else if (diffDays === 0) {
      return sessionStats.streakDays;
    } else {
      return 1;
    }
  };
  const getTodaysMoodEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    return moodHistory.find(entry => entry.date === today);
  };
  const completeSession = () => {
    saveMoodData();
    setGameState('completion');
  };
  const returnToMenu = () => {
    setGameState('menu');
    setPreMood({ emoji: '', word: '' });
    setPostMood({ emoji: '', word: '' });
    setFocusScore(0);
    setBreathingTime(0);
  };
  useEffect(() => {
    loadStoredData();
    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
    };
  }, []);
  const getBreathingScale = () => {
    if (!breathingActive) return 1;
    switch (breathingPhase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1;
      default:
        return 1;
    }
  };
  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe In...';
      case 'hold':
        return 'Hold...';
      case 'exhale':
        return 'Breathe Out...';
      default:
        return 'Breathe...';
    }
  };
  return (
    <>
      {gameState === 'menu' ? (
        <div className="calm-loop-sidebar calm-loop-centered">
          <h2 className="calm-loop-title">Calm Loop</h2>
          <p className="calm-loop-desc">Recharge your mind with guided breathing, focus games, and mood tracking—all in one mindful session.</p>
          {sessionStats.totalSessions > 0 && (
            <div className="session-stats">
              <div className="stat-item">
                <span className="stat-number">{sessionStats.totalSessions}</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{sessionStats.streakDays}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              {getTodaysMoodEntry() && (
                <div className="stat-item">
                  <span className="stat-number">{getTodaysMoodEntry().pre.emoji}</span>
                  <span className="stat-label">Today's Mood</span>
                </div>
              )}
            </div>
          )}
          <div className="duration-selector">
            <h3>Session length:</h3>
            <div className="duration-buttons">
              {[1, 2, 5].map(duration => (
                <button
                  key={duration}
                  className={`duration-btn ${breathingDuration === duration ? 'active' : ''}`}
                  onClick={() => setBreathingDuration(duration)}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>
          <button 
            className="start-btn"
            onClick={() => setGameState('mood-pre')}
          >
            Start Calm Session
          </button>
        </div>
      ) : (
        <div className="calm-loop-session-card calm-loop-centered">
          {gameState === 'mood-pre' && (
            <div className="mood-tracker">
              <h3>How are you feeling right now?</h3>
              <div className="emoji-selector">
                {moodEmojis.map(emoji => (
                  <button
                    key={emoji}
                    className={`emoji-btn ${preMood.emoji === emoji ? 'selected' : ''}`}
                    onClick={() => setPreMood(prev => ({ ...prev, emoji }))}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="One word to describe your mood..."
                value={preMood.word}
                onChange={(e) => setPreMood(prev => ({ ...prev, word: e.target.value }))}
                className="mood-input"
              />
              <button 
                className="continue-btn"
                onClick={startBreathing}
                disabled={!preMood.emoji || !preMood.word}
              >
                Begin Breathing
              </button>
            </div>
          )}
          {gameState === 'breathing' && (
            <div className="breathing-session">
              <div className="breathing-container">
                <div 
                  className="breathing-circle"
                  style={{
                    transform: `scale(${getBreathingScale()})`,
                    transition: `transform ${
                      breathingPhase === 'inhale' ? breathingCycle.inhale : 
                      breathingPhase === 'hold' ? '0' : 
                      breathingCycle.exhale
                    }s ease-in-out`
                  }}
                />
                <div className="breathing-text">
                  {getBreathingInstruction()}
                </div>
              </div>
              <div className="session-info">
                <div className="time-remaining">
                  {Math.max(0, Math.floor(breathingDuration * 60 - breathingTime))}s remaining
                </div>
                <button className="stop-btn" onClick={() => {
                  stopBreathing();
                  startFocusGame();
                }}>
                  Skip to Focus Game
                </button>
              </div>
            </div>
          )}
          {gameState === 'focus' && (
            <div className="focus-game">
              <div className="focus-header">
                <h3>Focus Challenge</h3>
                <p>Tap only the <span className="blue-text">blue</span> shapes. Stay calm and focused.</p>
                <div className="focus-score">Score: {focusScore}/{focusTarget}</div>
                {currentShape && shapeTimer > 0 && (
                  <div className="shape-timer">Time remaining: {shapeTimer}s</div>
                )}
                {!currentShape && (
                  <div className="waiting-message">Waiting for next shape...</div>
                )}
              </div>
              <div className="focus-area">
                {currentShape && (
                  <div
                    className={`shape ${currentShape.shape} ${currentShape.color}`}
                    style={{
                      left: currentShape.x,
                      top: currentShape.y,
                      position: 'absolute'
                    }}
                    onClick={() => handleShapeClick(currentShape)}
                  />
                )}
              </div>
              <div className="focus-instructions">
                <p>Take your time. Rushing resets your progress.</p>
                {!currentShape && focusScore < focusTarget && (
                  <button 
                    className="generate-shape-btn"
                    onClick={generateShape}
                  >
                    Generate New Shape
                  </button>
                )}
                <button 
                  className="skip-focus-btn"
                  onClick={() => setGameState('mood-post')}
                >
                  Skip Focus Game
                </button>
              </div>
            </div>
          )}
          {gameState === 'mood-post' && (
            <div className="mood-tracker">
              <h3>How are you feeling now?</h3>
              <div className="emoji-selector">
                {moodEmojis.map(emoji => (
                  <button
                    key={emoji}
                    className={`emoji-btn ${postMood.emoji === emoji ? 'selected' : ''}`}
                    onClick={() => setPostMood(prev => ({ ...prev, emoji }))}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="One word to describe your mood now..."
                value={postMood.word}
                onChange={(e) => setPostMood(prev => ({ ...prev, word: e.target.value }))}
                className="mood-input"
              />
              <button 
                className="complete-btn"
                onClick={completeSession}
                disabled={!postMood.emoji || !postMood.word}
              >
                Complete Session
              </button>
            </div>
          )}
          {gameState === 'completion' && (
            <div className="completion-screen">
              <div className="completion-header">
                <h2>🌟 Session Complete!</h2>
                <p>Well done on taking time for mindfulness</p>
              </div>
              <div className="session-summary">
                <div className="summary-item">
                  <span className="summary-label">Session Duration:</span>
                  <span className="summary-value">{breathingDuration} minutes</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Focus Score:</span>
                  <span className="summary-value">{focusScore}/{focusTarget}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Mood Change:</span>
                  <span className="summary-value">{preMood.emoji} → {postMood.emoji}</span>
                </div>
              </div>
              <div className="achievement">
                {sessionStats.streakDays > 1 && (
                  <div className="streak-celebration">
                    🔥 {sessionStats.streakDays} day streak! Keep it up!
                  </div>
                )}
                {sessionStats.totalSessions === 1 && (
                  <div className="first-session">
                    🎉 Congratulations on your first Calm Loop session!
                  </div>
                )}
                {sessionStats.totalSessions === 10 && (
                  <div className="milestone">
                    ⭐ Amazing! You've completed 10 sessions!
                  </div>
                )}
              </div>
              <button 
                className="return-btn"
                onClick={returnToMenu}
              >
                Return to Menu
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CalmLoop; 