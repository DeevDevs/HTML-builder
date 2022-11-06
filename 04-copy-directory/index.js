const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
const sourceDirectory = path.join(__dirname, "files");
const copyDirectory = path.join(__dirname, "files-copy");

fs.access(copyDirectory, (err) => {
  if (err) {
    fsPromises.mkdir(copyDirectory, { recursive: true });
    fs.readdir(sourceDirectory, async (err, data) => {
      if (err) throw new Error("There is no such folder");
      data.forEach(async (instance) => {
        await fsPromises.copyFile(
          path.join(sourceDirectory, instance),
          path.join(copyDirectory, instance)
        );
      });
    });
    return;
  }
  fs.readdir(copyDirectory, async (err, data) => {
    if (err) throw new Error("There is no such folder");
    data.forEach(async (instance) => {
      fs.unlink(path.join(copyDirectory, instance), (err) => {
        if (err)
          throw new Error("Do not remove files from files-copy manually");
      });
    });
    fsPromises.mkdir(copyDirectory, { recursive: true });
    fs.readdir(sourceDirectory, async (err, data) => {
      if (err) throw new Error("There is no such folder");
      data.forEach(async (instance) => {
        await fsPromises.copyFile(
          path.join(sourceDirectory, instance),
          path.join(copyDirectory, instance)
        );
      });
    });
  });
});
