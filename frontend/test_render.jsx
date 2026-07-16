import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './src/App.jsx';

try {
  const html = renderToString(
    <StaticRouter location="/">
      <App />
    </StaticRouter>
  );
  console.log("RENDER SUCCESS, length:", html.length);
} catch (e) {
  console.error("REACT RUNTIME ERROR:");
  console.error(e);
}
