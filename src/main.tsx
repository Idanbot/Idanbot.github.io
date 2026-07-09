import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const container = document.getElementById('root')!;
const appElement = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, appElement);
} else {
  ReactDOM.createRoot(container).render(appElement);
}
