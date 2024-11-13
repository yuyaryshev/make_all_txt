const fs = require('fs');
const path = require('path');
const out_filename = '!all.txt';
const exclusions = ['.','..','.git','node_modules','!all.txt'];

function processDirectory(directory, outputFile) {
  // Open a write stream for the output file
  const output = fs.createWriteStream(outputFile, { flags: 'w' });
  let isFirst = true;

  function readDirectoryRecursive(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const relativePath = path.relative(directory, fullPath);

      // Skip exclusions
      if (exclusions.includes(file)) return;

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Recursively process directories
        readDirectoryRecursive(fullPath);
      } else if (stats.isFile()) {
        // Write the file path as a comment, then append the file content
		if(isFirst) {			
			isFirst = false;
		} else {
			output.write(`\n`);
		}
        output.write(`// ${relativePath}\n\n`);
        const content = fs.readFileSync(fullPath, 'utf-8');
        output.write(content + '\n');
      }
    });
  }

  // Start processing the directory
  readDirectoryRecursive(directory);
  output.end(() => console.log(`All files concatenated into ${outputFile}`));
}

// Check for command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Please provide the directory path as the first argument.');
  process.exit(1);
}

const directory = args[0];
const outputFile = path.join(directory, '!all.txt');

// Run the utility
processDirectory(directory, outputFile);
