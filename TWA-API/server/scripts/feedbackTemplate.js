const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { col } = require('sequelize');
const configFile = require("./../config/config.json");
const logger = require("./../utils/log4j.config").getLogger();

async function generateFeedbackExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Define border and styles
  const border = { style: 'medium', color: { argb: '000000' } };
  const borderStyle = {
    top: border,
    left: border,
    bottom: border,
    right: border
  };

  // Title Row
  worksheet.mergeCells('B2:G2');
  const titleCell = worksheet.getCell('B2:G2');
  titleCell.border = borderStyle
  titleCell.value = data.title;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  // Define rows layout
  const rows = [
    ["From Assy Unit", ":", data["fromAssyUnit"], "DATE", ":", data["date"]],
    ["Report No", ":", data["reportNo"], "TO", ":", data["toName"]],
    ["Type", ":", data["type"], "CC", ":", data["ccName"]],
    ["Component", ":", data["component"], "Item Ref", ":", data["itemRef"]],
    ["New Product", ":", data["newProduct"], "Watch Model", ":", data["watchModel"]],
    ["Type of Criticality", ":", data["typeOfCriticality"], "Cluster", ":", data["cluster"]],
    ["Supplier", ":", data["supplier"], "Assembled Qty", ":", data["assembledQty"]],
    ["Repetition", ":", data["repetition"], "Rejn", ":", data["rejn"]],
    ["Defect", ":", data["defect"], "Rej Per", ":", data["rejPer"]],
    ["Calibre", ":", data["calibre"], "Assemby WIP", ":", data["assemblyWIP"]],
    ["UCP in INR", ":", data["ucpInInr"], "FPS Stock", ":", data["fpsStock"]],
  ];

  // Add rows and styling
  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 3;
    // Add the row starting from column B (i.e., skip column A)
    row.forEach((val, colIndex) => {
      const cell = worksheet.getCell(rowNumber, colIndex + 2); // +2 for column B (2)
      cell.value = val;
    });
    

    row.forEach((val, colIndex) => {
      const cell = worksheet.getCell(rowNumber, colIndex + 2);
      cell.border = borderStyle;

      if ([0, 1, 3, 4].includes(colIndex)) {
        cell.font = { bold: true };
      }
    });

  });

  // Remarks
  worksheet.mergeCells('B14:G14');
  const onservationCell = worksheet.getCell('B14:G14');
  onservationCell.border = borderStyle
  onservationCell.value = "Assembly Preliminary Analysis & Observation";

  worksheet.mergeCells('B15:G15');
  const remarkCell = worksheet.getCell('B15:G15');
  remarkCell.border = borderStyle
  remarkCell.value = data["remark"];
  remarkCell.font = { bold: true };

  // Reported By
  worksheet.mergeCells('B16:G16');
  const reportedByCell = worksheet.getCell('B16:G16');
  reportedByCell.border = borderStyle
  reportedByCell.value = "Reported by";

  worksheet.mergeCells('B17:G17');
  const reportedByUserCell = worksheet.getCell('B17:G17');
  reportedByUserCell.border = borderStyle
  reportedByUserCell.value = data["reportedBy"];
  reportedByUserCell.font = { bold: true };

  // Set width with weap text enabled
  ['B', 'D', 'E', 'G'].forEach(colLetter => {
    const col = worksheet.getColumn(colLetter);
    col.eachCell(cell => {
      cell.alignment = { ...cell.alignment, wrapText: true }; // Enable text wrap
    });
    col.width = 30;
  });

  ['C', 'F'].forEach(colLetter => {
    const col = worksheet.getColumn(colLetter);
    col.width = 2; // Add some padding
  });

  // Save the file
  let dir = `${configFile.feedbackFilePath}\\feedback_report`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }   
  const outputPath = path.join(dir, 'Feedback_Report.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  logger.debug("Excel file generated at:", outputPath);
  console.log(`Excel file generated at: ${outputPath}`);
  return outputPath;
}

module.exports = { generateFeedbackExcel };
