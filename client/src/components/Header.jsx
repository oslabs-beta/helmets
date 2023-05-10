import React, { useState } from "react";
 

//the header provides a space for the Helmets logo and an input field that allows the user to select a chart folder to upload
//the selected folder is then passed to the database
//the backend will return an object that is then used to populate the <Flow /> component
const Header = () => {
  const [buttonText, setButtonText] = useState('Select Chart');

  //helper function to clear the unordered list in the header and reset the input target to nothing
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
  //declare a let to hold the files selected by user during handleChange()
  let selectedFiles;

  /* The handleChange() function to allow user to select a folder. contents are displayed.*/
  /*TO DO >> post contents to database */
  const handleChange = async (event) => {
    let chartFormData;
    const fileCache = event.target.files;
    chartFormData = new FormData();
    //manages display of selected data on the front-end
    try{
      //update selectedFiles with the event data for use outside of handleChange()
      selectedFiles = event.target;
      //grab the html element of the unordered list
      const fileInfo = document.getElementById('fileInfo');
      //if there is already content in the unordered list, clear it out
      if(fileInfo.childElementCount > 0) {
        while(fileInfo.firstChild) {
          fileInfo.removeChild(fileInfo.firstChild);
        }
      }
      //iterate over it to populate the unordered list
      for(const file of fileCache) {
        const item = document.createElement('li');
        item.textContent = 'File Name: ' + file.name + '\nRelative Path: ' + file.webkitRelativePath;
        fileInfo.appendChild(item);
      }
    } catch (error) { 
      console.log('error occurred during front-end operations while managing selected chart:', error);
    }
    //convert the fileList to a new FormData in preparation for uploading to database
    try{
      for(const file of fileCache) {
        chartFormData.append('files', file, file.name);
      }
      for(var pair of chartFormData.entries()) {
        console.log(pair[0]+', '+pair[1].name+' Path = '+pair[1].webkitRelativePath);
      }
    } catch (error) {
      console.log('error occurred while converting fileList to FormData: ', error);
    }
    //upload FormData to database
    // try{
    //   const options = {
    //     method: 'POST',
    //     body: formData,
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   };
      
    //   fetch('/upload', options)   // <<< UPDATE POST LOCATION URL
    // } catch (error) {
    //   console.log('error occurred while attempting to upload FormData to database:', error);
    // }
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