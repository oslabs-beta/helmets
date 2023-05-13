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
      //iterate over it to populate the unordered list
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

  //iterates through selected files and sends them to server one at a time
  const submitChart = () => {
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

      uploadFile(data);
    }
  };

  const uploadFile = async (data) => {
    const filePath = data.get('filePath');

    const options1 = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    };
    await fetch('http://localhost:3000/check-directory', options1);

    console.log('data just before uploading: ', data);
    const options2 = {
      method: 'POST',
      body: data,
    };

    await fetch('http://localhost:3000/chart', options2); // <<< UPDATE POST LOCATION URL & database URI value in dataModel.js
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
