const excelToJson = require("convert-excel-to-json");
const billOfMaterialService = require("./../services/billOfMaterial.service");
const componentService = require("./../services/component.service");
const variantService = require("./../services/variant.service");
const { glob } = require("glob");
const fs = require('fs');
const configFile = require("./../config/config.json");
var path = require("path");
const { globSync } = require("glob");
const { fail } = require("assert");
const { log } = require("console");
const logger = require("./../utils/log4j.config").getLogger();

async function convertToJSON(filePath) {

  const counters = {
    newVariant: 0,
    oldVariant: 0,
    newComponent: [],
    oldComponent: [],
  };

  const result = await excelToJson({
    sourceFile: filePath,
    header: {
      // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
      rows: 1
    },
    sheets: [
      {
        name: "Master",
        columnToKey: {
          A: "variantCode",
          B: "materialCode",
          C: "materialDescription",
          D: "materialGroup",
          E: "uom",
          F: "imageDirPath"
        }
      }
    ]
  });
  for (var item in result) {
    await processExcelData(result[item],counters);
  }
  console.log("newComponents uniq", [...new Set(counters.newComponent)])
  console.log("oldComponent uniq", [...new Set(counters.oldComponent)])
  counters.oldComponent = [...new Set(counters.oldComponent)].length;
  counters.newComponent = [...new Set(counters.newComponent)].length;
  console.log("Counters::", counters);
  logger.debug("Counters::", counters);
  return counters;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function processExcelData(data, counters) {
  let variant = {};
  let component = {};
  let componentList = [];
  let inProcessVarinat = ""
  let count = 0;
  let imageDirPath = ""
  await asyncForEach(data, async function (rowData) {
    count = count + 1;
    if (isValidData(rowData)) {
      console.log("inProcessVarinat::", inProcessVarinat);
      logger.debug("inProcessVarinat::", inProcessVarinat);
      if (!imageDirPath) {
        imageDirPath = rowData.imageDirPath;
      }
      if (inProcessVarinat != "" && inProcessVarinat !== rowData.variantCode) {
        inProcessVarinat = ""
        //save variant details
        await saveVariantDetails(componentList, variant, counters)
        //reset values
        variant = {};
        component = {};
        componentList = [];
        if (rowData.variantCode == undefined || rowData.variantCode == "") {
          variant["code"] = rowData.materialCode
          variant["name"] = rowData.materialDescription
          variant["imagePath"] = rowData.imageDirPath
          inProcessVarinat = rowData.materialCode
        }

      } else {
        //If the data is for the processing variant
        if (rowData.variantCode == undefined || rowData.variantCode == "") {
          //create a varinat
          variant["code"] = rowData.materialCode
          variant["name"] = rowData.materialDescription
          variant["imagePath"] = rowData.imageDirPath
          inProcessVarinat = rowData.materialCode
        } else {
          if (rowData.materialGroup === 'MODULE') {
            variant["description"] = rowData.materialDescription
          }
          //create a component
          component["code"] = rowData.materialCode
          component["name"] = rowData.materialDescription
          component["uom"] = rowData.uom
          let componentId = await createComponent(component, counters)
          componentList.push(componentId);
          inProcessVarinat = rowData.variantCode

          if (data.length == count) {
            //insert last row data
            await saveVariantDetails(componentList, variant, counters)
          }
        }
      }

    } else{
      logger.debug("Skipping invalid row:", rowData);
      console.log("Skipping invalid row:", rowData);
    }
  });
}

async function isValidData(rowData) {
  return (rowData.materialCode != undefined &&
    rowData.materialDescription != undefined)
}

async function saveVariantDetails(componentList, variant, counters) {
  let existVarCode = await variantService.getVarianttByVarCode(variant.code);
  if (existVarCode.length == 0) {
    logger.debug("Saving variant::", variant.code, " with components:", componentList);
    console.log("Saving variant::", variant.code, " with components:", componentList);
    let billOfMaterial = await saveBillOfMaterial(componentList);
    variant["billOfMaterialId"] = billOfMaterial.id;

    // Determine the image directory path: use process argument if provided, else from rowData
    const imagePathRoot = variant["imagePath"] || process.argv[3];
    const normalizedPath = path.normalize(imagePathRoot); 
    const posixPath = normalizedPath.replace(/\\/g, '/'); 
    const pattern = `${posixPath}/${variant.code.trim()}_*`;

    const files = globSync(pattern);
    if (files.length === 0) {
      // Creating variant without image
      console.log("Varian::", variant.code, " does not have any images");
      logger.debug("Varian::", variant.code, " does not have any images");
      delete variant.imagePath // Remove imagePath if no files found
      await variantService.create(variant);
      counters.newVariant++;
    } else {
      //Create variant with images
      let dir = `${configFile.variantFilePath}\\${variant.code}`;
      let imagePathArray = [];
      let count = 0;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }      
      for (const filename of files) {
        count = count + 1;
        let destFile = `${dir}\\${path.basename(filename)}`;
        imagePathArray.push(destFile);
        if (count === files.length) {
          variant["imagePath"] = imagePathArray;
          await variantService.create(variant);
          counters.newVariant++;
        }
        await fs.promises.copyFile(filename, destFile);
        logger.debug(filename + ' was copied to ' + destFile);
        console.log(filename + ' was copied to ' + destFile);
      };      
    }
  } else {
    counters.oldVariant +=1;
    logger.debug(`variant ${variant.code} exist, retrun id ${existVarCode[0].id}`);
    console.log(`variant ${variant.code} exist, retrun id ${existVarCode[0].id}`);
  }
}

async function createComponent(component, counters) {
  let existingCompCode = await componentService.getComponentByCompCode(
    component.code.toString()
  );
  if (existingCompCode.length == 0) {
    logger.debug("Saving component::", component.code);
    console.log("Saving component::", component.code);
    let result = await componentService.create(component);
    // counters.newComponent++;
    counters.newComponent.push(component.code);
    return result.id;
  } else {
    logger.debug(`component ${component.code} exist, retrun id ${existingCompCode[0].id}`);
    console.log(`component ${component.code} exist, retrun id ${existingCompCode[0].id}`);
    // counters.oldComponent++;
    counters.oldComponent.push(component.code);
    return existingCompCode[0].id;
  }    
}

async function saveBillOfMaterial(billOfMaterialList) {
  logger.debug("Saving Bill of Material with components:", billOfMaterialList);
  console.log("Saving Bill of Material with components:", billOfMaterialList);
  let billOfMaterialObj = {
    componentId: billOfMaterialList
  };
  result = await billOfMaterialService.create(billOfMaterialObj);

  return result;
}

// exporting for controller use
module.exports = { convertToJSON };

// For CLI mode use
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: nodde VariantMasterUploadScript.js <path-to-excel-file> optional[<image-dir-path>]");
    process.exit(1);
  }

  convertToJSON(filePath)
    .then(() => {
      console.log("Excel processing complete.");
    })
    .catch((err) => {
      console.error("Error processing Excel file:", err);
    });
}