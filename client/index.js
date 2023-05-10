import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './src/App.jsx';

// what is going on here?
const rootEl = document.getElementById('root');
const root = createRoot(rootEl);

root.render(<App />);
