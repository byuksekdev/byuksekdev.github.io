import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HIDDEN_PORTFOLIO_ROUTE } from './lib/routes';

const pathname = window.location.pathname;
const isValidRoute = pathname === HIDDEN_PORTFOLIO_ROUTE || pathname === '/';

if (!isValidRoute && pathname !== '/') {
  window.history.replaceState({}, '', HIDDEN_PORTFOLIO_ROUTE);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
