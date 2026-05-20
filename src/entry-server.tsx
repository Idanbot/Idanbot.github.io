import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { LazyMotion, domAnimation } from 'framer-motion';
import App from './App';

export function render() {
  return ReactDOMServer.renderToString(
    <React.StrictMode>
      <LazyMotion features={domAnimation} strict>
        <App />
      </LazyMotion>
    </React.StrictMode>
  );
}
