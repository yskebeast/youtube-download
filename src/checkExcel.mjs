import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const excelFolder = () => {
  const folder = path.join(__dirname, "../excel");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(path.join(__dirname, "../excel"));
    throw new Error("excel folder does not exist. Creating one...");
  } else {
    console.log("excel folder exists");
  }
};

const fileNumber = async () => {
  const file = await glob("./excel/*.xlsx");

  if (file.length === 0) {
    throw new Error("Excel file does not exist.");
  } else if (file.length > 1) {
    throw new Error("more than 1 Excel files exist");
  } else {
    console.log("Excel file exists", file);
  }
};

export const checkExcel = async () => {
  try {
    excelFolder();
    await fileNumber();
  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
};
