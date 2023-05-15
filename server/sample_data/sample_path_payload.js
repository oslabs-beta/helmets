const deployment_template = require('./deployment_js');
const values_main = require('./values_main');
const deployment_values = require('./deployment_values');

/*
READ ME:

this sample path represents the path the backend will generate if the user
clicks on a value in the "deployment_js" template file (that you rendered 
on the front-end when a user selects it from the dropdown)

*/

const path = [
    values_main, // top-level values file
    deployment_values, // middle file - nested values file that mutates a value along the path
    deployment_template // bottom-level manifest/template
]

module.exports = path;