import { useLocation } from 'react-router-dom';

const ChildReport = () => {
  const location = useLocation();
  const { childName, sessionId, gameScores } = location.state || {};

  return (
    <div className="child-report">
      <h2>Session Report</h2>
      <p><strong>Child Name:</strong> {childName}</p>
      <p><strong>Session ID:</strong> {sessionId}</p>
      <h3>Game Scores:</h3>
      <ul>
        {gameScores && gameScores.map((score, index) => (
          <li key={index}>{score.gameType}: {score.score}</li>
        ))}
      </ul>
      <button onClick={() => window.history.back()}>Back</button>
    </div>
  );
};

export default ChildReport;