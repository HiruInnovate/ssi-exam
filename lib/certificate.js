import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Generates a certificate image buffer.
 * 
 * @param {Object} params
 * @param {string} params.studentName - Name of the student
 * @param {string} params.certId - Certificate ID (e.g. ABC123DEF)
 * @param {string} params.dateString - Date string (e.g. 12-05-2026)
 * @param {string} params.batchName - Name of the course/batch (e.g. Python Batch 1)
 * @returns {Promise<Buffer>} The generated image buffer
 */
export async function generateCertificateBuffer({ studentName, certId, dateString, batchName }) {
  // Strip out trailing batch identifiers like " (Batch 1)" or " Batch 1" for template matching
  // e.g. "Python (Batch 1)" -> "Python", "Java Batch 1" -> "Java"
  let baseBatchName = batchName;
  if (baseBatchName) {
    // Safely extract 'Python' from 'Python Batch 1'
    baseBatchName = baseBatchName.split(' ')[0];
  }

  // Find the template
  let templatePath = path.join(process.cwd(), 'public', 'template', `SSI_${batchName}_Course_Certificate.png`);
  
  if (!fs.existsSync(templatePath) && baseBatchName) {
    templatePath = path.join(process.cwd(), 'public', 'template', `SSI_${baseBatchName}_Course_Certificate.png`);
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Certificate template missing: ${path.basename(templatePath)}`);
  }

  // SVG overlay for text
  const svgText = `
    <svg width="2000" height="1414">
      <style>
        .title { fill: #0f172a; font-size: 80px; font-weight: bold; font-style: italic; font-family: 'Times New Roman', serif; text-anchor: middle; }
        .cid { fill: #333333; font-size: 34px; font-weight: bold; font-family: 'Times New Roman', serif; }
        .date { fill: #333333; font-size: 34px; font-weight: bold; font-family: 'Times New Roman', serif; }
      </style>
      
      <text x="1000" y="670" class="title">${studentName}</text>
      <text x="935" y="980" class="cid">SSI-${certId}</text>
      <text x="935" y="1310" class="date">${dateString}</text>
    </svg>
  `;

  const compositeLayers = [
    {
      input: Buffer.from(svgText),
      top: 0,
      left: 0,
    }
  ];

  // Generate the composite image buffer
  return await sharp(templatePath)
    .composite(compositeLayers)
    .png() // Ensure it's a PNG
    .toBuffer();
}
