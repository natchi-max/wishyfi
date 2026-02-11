import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './components/LandingPage';
import WishForm from './components/WishForm';
import MagicSquareAnimation from './components/MagicSquareAnimation';
import RamanujanXAnimation from './components/RamanujanXAnimation';
import SharedWish from './components/SharedWish';
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
        path: 'animation/:wishId?',
        element: <MagicSquareAnimation />
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
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);