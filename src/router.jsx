import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './components/LandingPage';
import WishForm from './components/WishForm';
import MagicSquareAnimation from './components/MagicSquareAnimation';
import DigitalGreetingAnimation from './components/DigitalGreetingAnimation';
import CinematicXAnimation from './components/CinematicXAnimation';
import RamanujanXAnimation from './components/RamanujanXAnimation';
import SharedWish from './components/SharedWish';
import ShareTest from './components/ShareTest';
import NotFound from './components/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'create',
        element: <WishForm />
      },
      {
        path: 'animate/:wishId?',
        element: <MagicSquareAnimation />
      },
      {
        path: 'digital/:wishId?',
        element: <DigitalGreetingAnimation />
      },
      {
        path: 'cinematic-x',
        element: <CinematicXAnimation />
      },
      {
        path: 'ramanujan-x',
        element: <RamanujanXAnimation />
      },
      {
        path: 'share/:shareId',
        element: <SharedWish />
      },
      {
        path: 'test-share',
        element: <ShareTest />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);