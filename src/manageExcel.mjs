import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import readXlsxFile from "read-excel-file/node";
import writeXlsxFile from "write-excel-file/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const file = await glob("./excel/*.xlsx");

  if (file.length === 0) {
    throw new Error("Excel file does not exist.");
  } else if (file.length > 1) {
    throw new Error("more than 1 Excel files exist");
  } else {
    console.log("Excel file exists", file);
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
  const file = await glob("./excel/*.xlsx");
  return await readXlsxFile(fs.createReadStream(file[0]));
};

export const writeDownloadedId = async (videoId) => {
  const newVideoId = [
    {
      id: videoId || "could not get video id",
    },
  ];
  const schema = [
    {
      column: "TITLE",
      type: String,
      value: (video) => {
        return video.id;
      },
    },
  ];
  const existingVideoId = (await readExcelContent()).slice(1).map((data) => {
    return {
      id: data[0],
    };
  });

  const videoIdList = [...newVideoId, ...existingVideoId];
  await writeXlsxFile(videoIdList, {
    schema,
    filePath: path.join(__dirname, "../excel/Book1.xlsx"),
  });
  console.log(`Excel file written successfully: ${videoId}`);
};
