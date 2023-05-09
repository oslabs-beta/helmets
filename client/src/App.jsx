import React from 'react';
import Test1 from './components/Test1';
import Test2 from './components/Test2';
import Test3 from './components/Test3';
import Test4 from './components/Test4';


import '../styles.css';

export default function App() {
  return(
    <div className='backsplash'>
    <Test1 />
    <Test2 />
    <Test3 />
    <Test4 />
    </div>
  )
}