const sharp = require('sharp');
async function run() {
  try {
    const metadata = await sharp('./public/template/msme_logo_2.png').metadata();
    console.log(`Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`Channels: ${metadata.channels}, hasAlpha: ${metadata.hasAlpha}`);
  } catch (err) {
    console.error(err);
  }
}
run();
