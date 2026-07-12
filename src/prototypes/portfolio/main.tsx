import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../index.css';
import './portfolio-lab.css';
import { PortfolioLab } from './PortfolioLab';

const container = document.getElementById('portfolio-lab-root');

if (!container) throw new Error('Portfolio lab root was not found.');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <PortfolioLab />
  </React.StrictMode>
);
