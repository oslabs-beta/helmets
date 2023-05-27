import React, { useState } from 'react';
import Header from '../Header/Header.jsx';
import Flow from '../Flow/Flow.jsx';

const MainContainer = () => {
  const [buttonText, setButtonText] = useState('Select Chart');
  const [fileCache, setfileCache] = useState({ files: undefined });
  const [disabled, setDisabled] = useState(true);

  const [topLevelChart, setTopLevelChart] = useState({
    value: 'No Chart Selected',
    name: 'No Chart Selected',
  });
  const [topLevelValues, setTopLevelValues] = useState({
    value: 'No Values Selected',
    name: 'No Values Selected',
  });

  const [filePathsArray, setFilePathsArray] = useState([]);

  const setChartValues = (topLevelChart, topLevelValues, filePathsArray) => {
    setTopLevelChart(topLevelChart);
    setTopLevelValues(topLevelValues);
    setFilePathsArray(filePathsArray);
    return;
  };

  // helperr function to clear the unordered list in the header and reset the input target to nothing
  const resetHeader = () => {
    const fileInfo = document.getElementById('fileInfo');
    const inputTarget = document.getElementById('chartPicker');
    // reset the form + clear list of files
    inputTarget.reset();
    document.getElementById('fileInfo').innerText = '';
    setDisabled(true);
    return;
  };

  // The handleChange() function to allow user to select a folder. contents are displayed.
  const handleChange = async (event) => {
    // enable buttons to clear/ submit
    setDisabled(false);
    //selected folders saved to state
    fileCache.files = event.target.files;

    //manages display of selected data on the front-end
    try {
      //grab the html element of the unordered list
      const fileInfo = document.getElementById('fileInfo');
      //if there is already content in the unordered list, clear it out
      if (fileInfo.childElementCount > 0) {
        while (fileInfo.firstChild) {
          fileInfo.removeChild(fileInfo.firstChild);
        }
      }
      //iterate over the fileCache to populate the unordered list
      for (const file of fileCache.files) {
        const item = document.createElement('li');
        item.textContent =
          'File Name: ' +
          file.name +
          '\nRelative Path: ' +
          file.webkitRelativePath;
        fileInfo.appendChild(item);
      }
    } catch (error) {
      console.log(
        'error occurred during front-end operations while managing selected chart:',
        error
      );
    }
  };

  //sends files to server one at a time to checkServerFolderStructure then uploadFile (called on button click)
  const submitChart = async () => {
    document.getElementById('submitBtn').innerText = 'Loading Chart';
    setDisabled(true);
    document.body.style.cursor = 'wait';
    const list = document.getElementById('fileInfo');
    if (list.childElementCount <= 0) {
      console.log('nothing to upload');
    } else {
      //iterates over fileCache
      for (const file of fileCache.files) {
        //remove the filename from the relative path
        let index;
        const fullPath = file.webkitRelativePath;
        for (let i = fullPath.length - 1; i > 0; i--) {
          if (fullPath[i] === `/`) {
            index = i;
            break;
          }
        }
        const filePath = fullPath.substring(0, index + 1);

        //append form data with files and paths
        const data = new FormData();
        data.append('files', file, file.name);
        data.append('filePath', filePath);

        console.log('current file: ', filePath, file.name);

        await uploadFile(data);   

        data.delete('files');
        data.delete('filePath');
      }
      // POST to /chart to populate db, return necessary files
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await fetch('http://localhost:3000/chart', options);
      const topLevelFiles = await response.json();
      console.log('CHART AND VALUES: ', topLevelFiles); // << contains topChart && topValues
      setChartValues(
        topLevelFiles.topChart,
        topLevelFiles.topValues,
        topLevelFiles.filePathsArray
      );
    }
    // reset button text + clear inner text to show user things are happening
    document.getElementById('submitBtn').innerText = 'Submit Chart';
    document.getElementById('fileInfo').innerText = '';
    const inputTarget = document.getElementById('chartPicker');
    inputTarget.reset();
    document.body.style.cursor = 'default';
    // re-disable
    setDisabled(true);
  };

  //POST to /upload -- places files on server in folder structure matching source
  const uploadFile = async (data) => {
    console.log('Uploading File: ', data.get('files').name);
    const options = {
      method: 'POST',
      body: data,
    };

    await fetch('http://localhost:3000/upload', options); // <<< UPDATE POST LOCATION URL & database URI value in dataModel.js
  };

  return (
    <div>
      <Header
        handleChange={handleChange}
        submitChart={submitChart}
        disabled={disabled}
        resetHeader={resetHeader}
      />
      <Flow
        topLevelChart={topLevelChart}
        topLevelValues={topLevelValues}
        filePathsArray={filePathsArray}
      />
    </div>
  );
};

export default MainContainer;
