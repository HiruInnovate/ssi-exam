const sharp = require('sharp');
const fs = require('fs');
async function run() {
  const buf = await sharp('./public/template/SSI_C_Course_Certificate.png')
    .extract({ left: 1000, top: 810, width: 1, height: 1 })
    .raw()
    .toBuffer();
  console.log(`RGB at 1000,810: \${buf[0]}, \${buf[1]}, \${buf[2]}`);
  
  const buf2 = await sharp('./public/template/SSI_C_Course_Certificate.png')
    .extract({ left: 500, top: 500, width: 1, height: 1 })
    .raw()
    .toBuffer();
  console.log(`RGB at 500,500: \${buf2[0]}, \${buf2[1]}, \${buf2[2]}`);
}
run();
