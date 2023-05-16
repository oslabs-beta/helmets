import React from 'react';
// may need these
import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

import 'reactflow/dist/style.css';

import './object-node.scss';

import path from '../../../../server/sample_data/sample_path_payload.js';
// <pre> means preformatted text - should preserve object layout
// why isn't this draggable

const ObjectNode = (/*{ data }*/) => {
  return (
    <div className="object-node">
      <pre>{JSON.stringify(path[0], null, 2)}</pre>
    </div>
  );
};

export default ObjectNode;
