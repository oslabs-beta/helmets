const valuesHandler = (
  selectedDoc,
  docValues,
  targetVal,
) => {

  const keyPath = [];
  const dataFlowPath = [];

  // generate keyPath from input targetVal string
  const valRegex = /\.Values\.(\S*)/;
  const match = targetVal.match(valRegex);
  keyPath = [...match[1].split('.')];

  const buildPath = async (doc, valuesDoc, nestedChartKeyPath = [...keyPath]) => {
    if (valuesDoc) {
      // check to see if inital key path work in the values file. 
      // if no, need to add key for each chart and test that
      if (!traceKeyPath(valuesDoc, valuesDoc.fileContent, keyPath)) {
        let currentChart = doc;
        // this loop is for checking additional variants of the keyPath, 
        // adding on the name of each chart as a key (for detecting nested)
        while (currentChart.source !== null) {
          // re-invoke traceKeyPath passing in updated keyPath, w/ name unshifted 
          const sourceDoc = await models.DataModel.findOne({_id: currentChart.source, session_id: session_id})
          const chartName = sourceDoc.fileContent.name;
          if (chartName){
            nestedChartKeyPath.unshift(chartName);
            traceKeyPath(valuesDoc, valuesDoc.fileContent, nestedChartKeyPath);
          }
          currentChart = sourceDoc;
        }
      }

      // next step is to iterate upwards regardless of a successful path match at first file, 
      // because the user may have additional value files in the chart
      let nextValues = await models.DataModel.findOne({_id: valuesDoc.values, session_id: session_id});
      while (nextValues) {
        await buildPath(doc, nextValues);
        const _nextValues = await models.DataModel.findOne({_id: nextValues.values, session_id: session_id});
        nextValues = _nextValues ? _nextValues : undefined;
      }
    }
  }
  
  // helperFn that will check a given values.yaml file to see if it contains input keyPath
  // iterates through each key in object, returns false if any key in keyPath array is absent
  const traceKeyPath = (valuesDoc, fileContent, localKeyPath = keyPath) => {
    let objID = '';
    let validPath = false;
    const flatObj = flattenObject(valuesDoc.filePath, fileContent);

    // iterate through each key in keyPath, check if it exists in valuesDoc
    // will progressively update objID to the nodeID of the last key in keyPath
    for (const key of localKeyPath) {
      // may need to set validPath to false here ** REVIEW
      for (let i = 0; i < flatObj.length; i++) {
        if (flatObj[i].value[key]) {
          validPath = true;
          objID = flatObj[i].nodeID;
          break;
        }
      }
    }

    if (validPath) {
      // instead push a new dataFlowObj onto path
      const createdDataFlowObj = {
        fileName: valuesDoc.fileName,
        filePath: valuesDoc.filePath,
        type: valuesDoc.type,
        nodeID: objID,
        flattenedDataArray: flatObj
      }
      dataFlowPath.push(createdDataFlowObj);
    }
    return validPath;
  }
}

module.exports = valuesHandler;