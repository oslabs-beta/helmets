import React, { useState } from "react";
 

//the header provides a space for the Helmets logo and an input field that allows the user to select a chart folder to upload
//the selected folder is then passed to the database
//the backend will return an object that is then used to populate the <Flow /> component
const Header = () => {

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

  // The handleChange() function to allow user to select a folder. contents are displayed.
  const handleChange = async (event) => {
    
    //selected folders saved to state
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
      //iterate over the fileCache to populate the unordered list
      for(const file of fileCache.files) {
        const item = document.createElement('li');
        item.textContent = 'File Name: ' + file.name + '\nRelative Path: ' + file.webkitRelativePath;
        fileInfo.appendChild(item);
      }
    } catch (error) { 
      console.log('error occurred during front-end operations while managing selected chart:', error);
    }
    //makes the submit button visible
    try{
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.style.display = 'block';
    } catch (error) {
      console.log('ERROR: ', error);
    }
  }

  //sends files to server one at a time to checkServerFolderStructure then uploadFile (called on button click)
  const submitChart = async () => {

    //iterates over fileCache
    for(const file of fileCache.files) {

      //remove the filename from the relative path
      let index;
      const fullPath = file.webkitRelativePath;
      for(let i = fullPath.length - 1; i > 0 ; i--) {
        if(fullPath[i] === `/`) {
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
      await checkServerFolderStructure(data);   //POST to /check-directory
      await uploadFile(data);                   //POST to /upload
      await moveFile(data);                     //POST to /move-file
      await deleteFile(data);                   //POST to /delete-file

      data.delete('files');
      data.delete('filePath');
    }
  };

  //recreates folder structure on server
  //POST to /check-directory
  const checkServerFolderStructure = async (data) => {
    const filePath = data.get('filePath');
    console.log('CheckServerFolderStructure for', filePath);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },    
      body: JSON.stringify({filePath})
    };
    await fetch('http://localhost:3000/check-directory', options);
  };

  //uploads the file
  //POST to /chart
  const uploadFile = async (data) => {
    console.log('Uploading File: ', data.get('files').name );
    const options = {
      method: 'POST',
      body: data
    };
    
    await fetch('http://localhost:3000/upload', options);   // <<< UPDATE POST LOCATION URL & database URI value in dataModel.js
  };

  //copies file from static upload folder to recreated folder structure
  const moveFile = async (data) => {

    const fileName = data.get('files').name;
    const filePath = data.get('filePath');
    console.log('Move file to uploads/', filePath,fileName);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({filePath: filePath, fileName: fileName})
    };
    
    await fetch('http://localhost:3000/move-file', options); 
  }

  //deletes file from static upload folder on server
  const deleteFile = async (data) => {

    const fileName = data.get('files').name;
    console.log('Delete file:  uploads/', fileName);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({ fileName })
    };
    
    await fetch('http://localhost:3000/delete-file', options); 
  }
 
  return (
    /* Short-form of React.Fragement*/
    <>
      <div style={{display: 'flex', height: 'auto', border: '1px solid black', justifyContent: 'space-around', alignItems: 'center'}}>

      <img style={{height: '100px'}}src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/617px-Kubernetes_logo_without_workmark.svg.png' />

      <form encType="multipart/form-data" method="post">
        { /* The handleChange() is triggered when text is entered */}
        <div>
          <input
            id="chartPicker"
            type="file"
            name="uploaded_file"
            onChange={handleChange}
            directory="" 
            webkitdirectory="" 
            mozdirectory=""
          />
        </div>
      </form>

      <ul style={{height: '6em', overflowY: 'auto'}} title='Relative Path' id='fileInfo'></ul>
      
      <button style={{height: 'auto'}} onClick={() => resetHeader(fileInfo)}>Clear Selection</button>

      <button id='submitBtn' style={{display: 'none'}} onClick={() => submitChart()}>Submit Chart</button>

      </div>
    </>
  )
}
 
export default Header;