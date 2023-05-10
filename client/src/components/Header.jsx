import React, { useState } from "react";
 
const Header = () => {
  const [buttonText, setButtonText] = useState('Select Chart');

  //helper function to clear a passed-in list element
  const resetHeader = (listEl) => {
    const inputTarget = document.getElementById('chartPicker');
    if(listEl.childElementCount > 0) {
      chartPicker.value = '';
      while(listEl.firstChild) {
        listEl.removeChild(listEl.firstChild);
      }
    };
    return;
  }

  /* The handleChange() function to allow user to select a folder. contents are displayed.*/
  /*TO DO >> post contents to database */
  const handleChange = (event) => {
    const fileInfo = document.getElementById('fileInfo');

    if(fileInfo.childElementCount > 0) {
      while(fileInfo.firstChild) {
        fileInfo.removeChild(fileInfo.firstChild);
      }
    }

    for(const file of event.target.files) {
      const item = document.createElement('li');
      item.textContent = 'File Name: ' + file.name + '\nRelative Path: ' + file.webkitRelativePath;
      fileInfo.appendChild(item);
    }
  }
 
  return (
    /* Short-form of React.Fragement*/
    <>
      <div style={{display: 'flex', height: 'auto', border: '1px solid black', justifyContent: 'space-around', alignItems: 'center'}}>

      <img style={{height: '100px'}}src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/617px-Kubernetes_logo_without_workmark.svg.png' />

      <form>
        { /* The handleChange() is triggered when text is entered */}
        <div>
          <input
            id="chartPicker"
            type="file"
            onChange={handleChange}
            directory="" 
            webkitdirectory="" 
            mozdirectory=""
          />
        </div>
      </form>

      <ul style={{height: '6em', overflowY: 'auto'}} title='Relative Path' id='fileInfo'></ul>
      
      <button style={{height: 'auto'}} onClick={() => resetHeader(fileInfo)}>Clear Selection</button>

      </div>
    </>
  )
}
 
export default Header;