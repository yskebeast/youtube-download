import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ytdl from "@distube/ytdl-core";

import { checkOutputFolder } from "./checkOutputDir.mjs";
import { youtubePlaylist } from "./youtubePlaylist.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFolder = path.join(__dirname, "../output");

const main = async () => {
  // * check if the output folder exists, if not, create it
  checkOutputFolder(outputFolder);

  const videoIds = await youtubePlaylist();
  const videoList = videoIds.map(async (videoId) => {
    const video = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(video);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "18",
      filter: "audioandvideo",
    });
    console.log(format);

    const filePath = path.join(
      outputFolder,
      `${info.videoDetails.title}-${videoId}.${format.container}`
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
  });

  await Promise.all(videoList);
  console.log("All videos downloaded!");
};

main();
