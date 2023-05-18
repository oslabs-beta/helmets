import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './src/App.jsx';

document.body.style.backgroundColor = '#023059';

// rendering App
const rootEl = document.getElementById('root');
const root = createRoot(rootEl);

root.render(<App />);
