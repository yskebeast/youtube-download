import fs from "fs";

export const checkOutputFolder = (dir) => {
  fs.existsSync(dir) || fs.mkdirSync(dir);
};
