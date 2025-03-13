
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TriviaProvider } from './context/TriviaContext.tsx';

createRoot(document.getElementById("root")!).render(
  <TriviaProvider>
    <App />
  </TriviaProvider>
);
