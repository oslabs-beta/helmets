import React, { useState } from 'react';
import './Header.scss';
import logo from '../../assets/Helmets_logo_white.png';

const Header = ({ handleChange, submitChart, disabled, resetHeader }) => {
  // //helper function to clear the unordered list in the header and reset the input target to nothing
  // const resetHeader = () => {
  //   const fileInfo = document.getElementById('fileInfo');
  //   const inputTarget = document.getElementById('chartPicker');
  //   // reset the form + clear list of files
  //   inputTarget.reset();
  //   document.getElementById('fileInfo').innerText = '';
  //   return;
  // };

  return (
    /* react fragment now semantic header*/
    <header>
      <div className="img-container">
        <img
          src={logo}
          alt="logo image of three spartan helmets with the text helmets underneath"
        />
      </div>
      <div className="input-container">
        <div className="file-display">
          <div className="list-display">
            <ul title="Relative Path" id="fileInfo"></ul>
          </div>
          <form
            encType="multipart/form-data"
            method="post"
            className="input-form"
            id="chartPicker"
          >
            <input
              className="custom-file-input"
              type="file"
              name="uploaded_file"
              onChange={handleChange}
              directory=""
              webkitdirectory=""
              mozdirectory=""
              // disabled={disabled}
            />
          </form>
          <button
            onClick={() => resetHeader()}
            id="clearBtn"
            disabled={disabled}
          >
            Clear Selection
          </button>

          <button
            id="submitBtn"
            onClick={() => submitChart()}
            disabled={disabled}
          >
            Submit Chart
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
