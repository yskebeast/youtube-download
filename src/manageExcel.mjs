import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import readXlsxFile from "read-excel-file/node";
import writeXlsxFile from "write-excel-file/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = await glob("./excel/*.xlsx");

const searchExcel = () => {
  const folder = path.join(__dirname, "../excel");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(path.join(__dirname, "../excel"));
    throw new Error("excel folder does not exist. Creating one...");
  } else {
    console.log("excel folder exists");
  }
};

const numberOfExcel = async () => {
  if (files.length === 0) {
    throw new Error("Excel file does not exist.");
  } else if (files.length > 1) {
    throw new Error("more than 1 Excel files exist");
  } else {
    console.log("Excel file exists", files);
  }
};

export const checkExcelDirectory = async () => {
  try {
    searchExcel();
    await numberOfExcel();
  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
};

export const readExcelContent = async () => {
  const MAX_RETRY = 100;

  if (files.length === 0) {
    throw new Error("No Excel files found in the ./excel directory.");
  }

  const filePath = files[0];
  console.log(`Reading Excel file from path: ${filePath}`);

  // ! Retry reading the Excel file for maximum of 100 times
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const content = await readXlsxFile(fs.createReadStream(filePath));
      console.log("Excel file content read successfully.");
      return content;
    } catch (error) {
      console.error(
        `Attempt ${attempt}: Error reading Excel file: ${error.message}`
      );
      if (attempt === MAX_RETRY) {
        throw new Error(
          `"${filePath}" file not found inside the *.xlsx file zip archive after ${MAX_RETRY} attempts`
        );
      }
    }
  }
};

export const writeDownloadedId = async (videoData) => {
  const newVideoId = [
    {
      id: videoData?.videoId || "could not get video id",
      date: videoData?.date || "could not get video date",
    },
  ];
  const schema = [
    {
      column: "TITLE",
      type: String,
      value: (video) => video.id,
    },
    {
      column: "DATE",
      type: String,
      value: (video) => video.date,
    },
  ];

  const excelContent = await readExcelContent();
  if (excelContent.length === 0) {
    try {
      await writeXlsxFile(newVideoId, {
        schema,
        filePath: path.join(__dirname, "../excel/Book1.xlsx"),
      });
      console.log(`Excel file written successfully: ${videoData.videoId}`);
      return;
    } catch (error) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }

  try {
    const existingId = excelContent.slice(1).map((data) => {
      return {
        id: data[0] || "could not get video id",
        date: data[1] || "could not get video date",
      };
    });
    const videoIdList = [...newVideoId, ...existingId];
    await writeXlsxFile(videoIdList, {
      schema,
      filePath: path.join(__dirname, "../excel/Book1.xlsx"),
    });
    console.log(`Excel file written successfully: ${videoData.videoId}`);
  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
};
