import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './components/LandingPage';
import WishForm from './components/WishForm';
import MagicSquareAnimation from './components/MagicSquareAnimation';
import DigitalGreetingAnimation from './components/DigitalGreetingAnimation';
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
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);