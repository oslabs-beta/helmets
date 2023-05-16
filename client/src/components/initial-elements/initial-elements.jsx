import React from 'react';
import { MarkerType } from 'reactflow';
// import fake data to be used until fetch happens
import path from '../../../../server/sample_data/sample_path_payload.js';

import './initial-elements.scss';

console.log('path: ', path);

// nodes are in an array
// edges are in an array
// would we create nodes array based on passed in info?
// how do we pass props?
// how do we update state?

export const nodes = [];

export const edges = [];

// for testing purposes
const fakeChart = {
  apiVersion: 'v2',
  appVersion: '1.16.0',
  dependencies: {
    condition: 'installToggle.backend',
    name: 'backend', // this is pointing to a subchart
    repository: '',
    condition: 'installToggle.web',
    name: 'web', // this is pointing to a subchart
    repository: '',
  },
  description: 'A Helm chart for Kubernetes',
  name: 'helm-chart-sample',
  type: 'application',
  version: '0.1.0',
};

// for loop functionality to create nodes and edges based on a passed in object
// first turn object into an array of key value pairs
// key value pairs become a string in the loop
// creates node and edges based on number of key value pairs coming in
// each node's data is a key value pair

// QUESTION: how to handle if value is an object?
// could do this as a function with recursive logic?
// a function called on each chart?

const chartArray = Object.entries(fakeChart);

function makeNodes(dataArray) {
  for (let i = 0; i < dataArray.length; i++) {
    let type = 'default';
    if (i === 0) type = 'input';
    if (i === dataArray.length - 1) type = 'output';
    let x = 100 * i;
    let y = 100 * i;
    nodes.push({
      id: `${i}`,
      type: `${type}`,
      data: {
        label: `${dataArray[i].join(' : ')}`,
      },
      position: { x: x, y: y },
    });
    edges.push({
      id: `edge${i}`,
      source: `${i}`,
      target: `${i + 1}`,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'purple',
      },
      style: { stroke: '#f6ab6c' },
    });
  }
}

makeNodes(chartArray);
