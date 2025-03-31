import React from 'react';
import './App.css';
import Quiz from './Quiz';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Networking Quiz</h1>
      </header>
      <main>
        <Quiz />
      </main>
      <footer className="App-footer">
        <p>Test your knowledge!</p>
      </footer>
    </div>
  );
}

export default App;
