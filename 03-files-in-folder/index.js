const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;

let directory = path.join(__dirname, "secret-folder");

fs.readdir(directory, async (err, data) => {
  if (err) throw new Error("There is no such folder");
  data.forEach(async (instance) => {
    let fileNameNoExt = path.parse(instance).name;
    let fileExt = path.extname(instance);
    let fileSize = await retrieveSize(instance);
    if (fileSize !== "not a file") {
      console.log(`${fileNameNoExt} - ${fileExt.slice(1)} - ${fileSize / 1024}kb`);
    }
  });
});

async function retrieveSize(fileName) {
  try {
    let pathToFile = path.join(directory, fileName);
    const info = await fsPromises.stat(pathToFile);
    return info.isFile() ? info.size : "not a file";
  } catch (err) {
    console.log(err.message);
  }
}
