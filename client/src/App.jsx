import React from 'react';
import Flow from './components/Flow/Flow';
import Header from './components/Header.jsx';

import './App.scss';

export default function App() {
  return (
    <div className="app">
      <Header />
      <Flow />
    </div>
  );
}
