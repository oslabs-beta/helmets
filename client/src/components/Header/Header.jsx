import React, { useState } from 'react';
import './Header.scss';
import logo from '../../assets/Helmets.png';

//the header provides a space for the Helmets logo and an input field that allows the user to select a chart folder to upload
//the selected folder is then passed to the database
//the backend will return an object that is then used to populate the <Flow /> component
const Header = () => {
  const [buttonText, setButtonText] = useState('Select Chart');
  const [fileCache, setfileCache] = useState({ files: undefined });

  //helper function to clear the unordered list in the header and reset the input target to nothing
  const resetHeader = (listEl) => {
    const inputTarget = document.getElementById('chartPicker');
    if (listEl.childElementCount > 0) {
      chartPicker.value = '';
      while (listEl.firstChild) {
        listEl.removeChild(listEl.firstChild);
      }
    }

    // const submitBtn = document.getElementById('submitBtn');
    // submitBtn.style.display = 'none';

    return;
  };

  // The handleChange() function to allow user to select a folder. contents are displayed.
  const handleChange = async (event) => {
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
    //makes the submit button visible
    try {
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.style.display = 'block';
    } catch (error) {
      console.log('ERROR: ', error);
    }
  };

  //sends files to server one at a time to checkServerFolderStructure then uploadFile (called on button click)
  const submitChart = async () => {
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
      await checkServerFolderStructure(data);     //POST to /check-directory  << creates folder structure on server
      await uploadFile(data);                     //POST to /upload           << uploads current file to server/uploads
      await moveFile(data);                       //POST to /move-file        << copies file from server/uploads to server/ <recreated file structure>    
      await deleteFile(data);                     //POST to /delete-file      << deletes file from server/uploads

      data.delete('files');
      data.delete('filePath');
    }

    // POST to /chart to populate db
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch('http://localhost:3000/chart', options);
    const topLevelFiles = await response.json();
    console.log('CHART AND VALUES: ', topLevelFiles);
  };

  //recreates folder structure on server
  //POST to /check-directory
  const checkServerFolderStructure = async (data) => {
    const filePath = data.get('filePath');
    console.log('CheckServerFolderStructure for', filePath);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    };
    await fetch('http://localhost:3000/check-directory', options);
  };

  //uploads the file
  //POST to /chart
  const uploadFile = async (data) => {
    console.log('Uploading File: ', data.get('files').name);
    const options = {
      method: 'POST',
      body: data,
    };

    await fetch('http://localhost:3000/upload', options); // <<< UPDATE POST LOCATION URL & database URI value in dataModel.js
  };

  //copies file from static upload folder to recreated folder structure
  const moveFile = async (data) => {
    const fileName = data.get('files').name;
    const filePath = data.get('filePath');
    console.log('Move file to uploads/', filePath, fileName);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath: filePath, fileName: fileName }),
    };

    await fetch('http://localhost:3000/move-file', options);
  };

  //deletes file from static upload folder on server
  const deleteFile = async (data) => {
    const fileName = data.get('files').name;
    console.log('Delete file:  uploads/', fileName);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    };

    await fetch('http://localhost:3000/delete-file', options);
  };

  return (
    /* react fragment now semantic header*/
    <header>
      <img style={{ height: '100%' }} src={logo} />
      <div className="chart-picker">
        <form
          encType="multipart/form-data"
          method="post"
          className="input-form"
        >
          {/* The handleChange() is triggered when text is entered */}

          <input
            id="chartPicker"
            type="file"
            name="uploaded_file"
            onChange={handleChange}
            directory=""
            webkitdirectory=""
            mozdirectory=""
          />
        </form>
      </div>
      <div className="file-display">
        <div className="list-display">
          <ul title="Relative Path" id="fileInfo"></ul>
        </div>
        <button
          style={{ height: 'auto' }}
          onClick={() => resetHeader(fileInfo)}
        >
          Clear Selection
        </button>

        <button id="submitBtn" onClick={() => submitChart()}>
          Submit Chart
        </button>
      </div>
    </header>
  );
};

export default Header;
