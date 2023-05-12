import React, { useState } from "react";
 

//the header provides a space for the Helmets logo and an input field that allows the user to select a chart folder to upload
//the selected folder is then passed to the database
//the backend will return an object that is then used to populate the <Flow /> component
const Header = () => {
  const chartFormData = new FormData();
  const [buttonText, setButtonText] = useState('Select Chart');
  const [fileCache, setfileCache] = useState({files: undefined})

  //helper function to clear the unordered list in the header and reset the input target to nothing
  const resetHeader = (listEl) => {
    const inputTarget = document.getElementById('chartPicker');
    if(listEl.childElementCount > 0) {
      chartPicker.value = '';
      while(listEl.firstChild) {
        listEl.removeChild(listEl.firstChild);
      }
    };

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.style.display = 'none';

    return;
  }

  /* The handleChange() function to allow user to select a folder. contents are displayed.*/
  /*TO DO >> post contents to database */
  const handleChange = async (event) => {
    
    fileCache.files = event.target.files;
    
    //manages display of selected data on the front-end
    try{
      //grab the html element of the unordered list
      const fileInfo = document.getElementById('fileInfo');
      //if there is already content in the unordered list, clear it out
      if(fileInfo.childElementCount > 0) {
        while(fileInfo.firstChild) {
          fileInfo.removeChild(fileInfo.firstChild);
        }
      }
      //iterate over it to populate the unordered list
      for(const file of fileCache.files) {
        const item = document.createElement('li');
        item.textContent = 'File Name: ' + file.name + '\nRelative Path: ' + file.webkitRelativePath;
        fileInfo.appendChild(item);
      }
    } catch (error) { 
      console.log('error occurred during front-end operations while managing selected chart:', error);
    }
    //convert the fileList to a new FormData in preparation for uploading to database
    try{
      for(const file of fileCache.files) {
        chartFormData.append('files', file, file.name);
      }
    } catch (error) {
      console.log('error occurred while converting fileList to FormData: ', error);
    }
    //upload FormData to database
    try{

      console.log('req body: ', chartFormData);

      const options = {
        method: 'POST',
        body: chartFormData,
        // headers: {
        //   'Content-Type': 'multipart/form-data'   // << removing content-type header per warning at https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
        // }
      };
      
      fetch('http://localhost:3000/chart', options)   // <<< UPDATE POST LOCATION URL & database URI value in dataModel.js
    } catch (error) {
      console.log('error occurred while attempting to upload FormData to database:', error);
    }
    //makes the submit button visible
    try{

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.style.display = 'block';

    } catch (error) {
      console.log('ERROR: ', error);
    }
  }
 
  return (
    /* Short-form of React.Fragement*/
    <>
      <div style={{display: 'flex', height: 'auto', border: '1px solid black', justifyContent: 'space-around', alignItems: 'center'}}>

      <img style={{height: '100px'}}src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/617px-Kubernetes_logo_without_workmark.svg.png' />

      <form encType="multipart/form-data">
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

      <button id='submitBtn' style={{display: 'none'}} onClick={() => submitChart}>Submit Chart</button>

      </div>
    </>
  )
}
 
export default Header;