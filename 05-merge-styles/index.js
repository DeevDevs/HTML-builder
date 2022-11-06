const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
const distDirectory = path.join(__dirname, "project-dist", "bundle.css");
const stylesDirectory = path.join(__dirname, "styles");
const EventEmitter = require("events");
const emitter = new EventEmitter();

async function checkIfFile(filePath) {
  try {
    const info = await fsPromises.stat(filePath);
    return info.isFile();
  } catch (err) {
    console.log(err.message);
  }
}

emitter.on("createBundle", () => {
  fs.writeFile(distDirectory, "", (err) => {
    if (err) throw new Error(`Could not create a file`);
    emitter.emit("listOfProperFiles");
  });
});

emitter.on("listOfProperFiles", () => {
  let list = [];
  fs.readdir(stylesDirectory, async (err, data) => {
    if (err) throw new Error("There are no files in the folder");
    data.forEach(async (instance, i) => {
      let fileExt = path.extname(instance);
      let isFile = await checkIfFile(path.join(stylesDirectory, instance));
      if (isFile && fileExt === ".css") {
        list.push(instance);
      }
      if (i === data.length - 1) emitter.emit("readAndWrite", [list, 0]);
    });
  });
});

emitter.on("readAndWrite", ([list, index]) => {
  fs.readFile(distDirectory, "utf-8", (err, oldData) => {
    if (err) throw new Error("Could not read the file info");
    if (list[index]) {
      fs.readFile(
        path.join(stylesDirectory, list[index]),
        "utf-8",
        (err, newData) => {
          if (err) throw new Error("Could not read the file info");
          fs.writeFile(distDirectory, `${`${oldData === "" ? "" : `${oldData}\n\n`}`}${newData}`, (err) => {
            if (err) throw new Error("Could not write the file");
            if (list[index + 1])
              emitter.emit("readAndWrite", [list, index + 1]);
          });
        }
      );
    }
  });
});

emitter.emit("createBundle");
