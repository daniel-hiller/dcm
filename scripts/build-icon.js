const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../resources/logo.png');
const outputPath = path.join(__dirname, '../resources/icon.ico');

const input = fs.readFileSync(inputPath);

toIco([input], { sizes: [16, 24, 32, 48, 64, 128, 256] })
  .then(buf => {
    fs.writeFileSync(outputPath, buf);
    console.log('✓ Icon created successfully at resources/icon.ico');
  })
  .catch(err => {
    console.error('Error creating icon:', err);
    process.exit(1);
  });
