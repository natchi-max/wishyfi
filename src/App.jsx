import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  const location = useLocation();
  const hideNavigation = location.pathname.startsWith('/animation');

  return (
    <div className="App">
      {!hideNavigation && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      {!hideNavigation && <Footer />}
    </div>
  );
}

export default App;
