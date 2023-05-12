import React from 'react';
import Flow from './components/Flow/Flow.jsx';
import Header from './components/Header/Header.jsx';

import './App.scss';

export default function App() {
  return (
    <section className="app">
      <Header />
      <Flow />
    </section>
  );
}
