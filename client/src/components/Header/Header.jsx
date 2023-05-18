import React, { useState } from 'react';
import './Header.scss';
import logo from '../../assets/Helmets.png';

const Header = ({ handleChange, submitChart }) => {
  //helper function to clear the unordered list in the header and reset the input target to nothing
  const resetHeader = () => {
    const fileInfo = document.getElementById('fileInfo');
    // const inputTarget = document.getElementById('chartPicker');
    if (fileInfo.childElementCount > 0) {
      chartPicker.value = '';
      while (fileInfo.firstChild) {
        fileInfo.removeChild(fileInfo.firstChild);
      }
    }
    return;
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
        <button style={{ height: 'auto' }} onClick={() => resetHeader()}>
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
