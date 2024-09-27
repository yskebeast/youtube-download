import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ytdl from "@distube/ytdl-core";

import {
  checkExcelDirectory,
  readExcelContent,
  writeDownloadedId,
} from "./manageExcel.mjs";
import { checkOutputFolder } from "./checkOutputDir.mjs";
import { youtubePlaylist } from "./youtubePlaylist.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFolder = path.join(__dirname, "../output");

const main = async () => {
  // * check if the excel folder and file exists, if not, throw an error
  await checkExcelDirectory();

  // * check if the output folder exists, if not, create it
  checkOutputFolder(outputFolder);

  const readExcel = (await readExcelContent()).slice(1).map((data) => data[0]);
  const getYouTubePlaylist = await youtubePlaylist();

  const videoList = getYouTubePlaylist.map(async (videoData) => {
    if (readExcel.includes(videoData.videoId)) {
      console.log("Already downloaded: ", videoData.videoId);
      return;
    }

    const video = `https://www.youtube.com/watch?v=${videoData.videoId}`;
    const info = await ytdl.getInfo(video);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "18",
      filter: "audioandvideo",
    });
    console.log(format);

    const filePath = path.join(
      outputFolder,
      `${videoData.date}-${videoData.videoId}.${format.container}`
    );
    const outputStream = fs.createWriteStream(filePath);
    ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);

    try {
      await new Promise((resolve) => {
        outputStream.on("finish", () => {
          console.log(`Finished downloading: ${filePath}`);
          resolve();
        });
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }

    await writeDownloadedId(videoData.videoId);
  });

  await Promise.all(videoList);
  console.log("All videos downloaded!");
};

main();
