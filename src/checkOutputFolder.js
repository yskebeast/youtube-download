export const checkOutputFolder = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return;
  }
};
