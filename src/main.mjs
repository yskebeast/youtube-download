import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ytdl from "@distube/ytdl-core";

import { checkOutputFolder } from "./checkOutputFolder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFolder = path.join(__dirname, "output");

const main = async () => {
  try {
    const video = "https://www.youtube.com/watch?v=IgBmv19W_zI";
    const info = await ytdl.getInfo(video);
    const format = ytdl.chooseFormat(info.formats, { quality: "135" });

    // * check if the output folder exists, if not, create it
    checkOutputFolder(outputFolder);
    const filePath = path.join(
      outputFolder,
      `${info.videoDetails.title}.${format.container}`
    );
    const outputStream = fs.createWriteStream(filePath);
    ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);

    outputStream.on("finish", () => {
      console.log(`Finished downloading: ${filePath}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

main();
