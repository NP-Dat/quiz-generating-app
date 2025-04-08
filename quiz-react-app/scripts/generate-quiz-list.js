const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');

fs.readdir(dataDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    // Filter out index.json and only include .json files
    const jsonFiles = files
        .filter(file => file !== 'index.json') // Exclude index.json
        .filter(file => path.extname(file).toLowerCase() === '.json');

    const indexContent = JSON.stringify({ files: jsonFiles }, null, 2);
    const indexPath = path.join(dataDir, 'index.json');

    fs.writeFile(indexPath, indexContent, err => {
        if (err) {
            console.error('Failed to write index.json', err);
            process.exit(1);
        }
        console.log('index.json updated successfully!');
    });
});