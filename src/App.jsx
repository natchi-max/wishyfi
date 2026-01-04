import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
