const path = require('path');
const fs = require('fs');
let html_filename;
let html_file_path;
let html_string;
let template_path = './../templates';

// log all process arguments
// process.argv.forEach((val, index, array) => {
//     console.log(index + ' : ' + val);
// });

if (process.argv[2]) {
    html_filename = process.argv[2];
    html_file_path = path.join(__dirname, template_path, html_filename);
    console.log('file:', html_filename);
    console.log('path:', html_file_path);

    if(fs.existsSync(html_file_path)) {
        console.log('file exists');
        html_string = fs.readFileSync(html_file_path, 'string');
        console.log(html_string);
    } else {
        console.log('file does not exists');
    }

} else {
    console.log('No file to convert to a string');
}

