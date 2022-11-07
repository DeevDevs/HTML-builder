const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
const stylesDirectory = path.join(__dirname, "styles");
const assetsDirectory = path.join(__dirname, "assets");
const componentsDirectory = path.join(__dirname, "components");
const distDirectory = path.join(__dirname, "project-dist");
const distStyleFile = path.join(distDirectory, "style.css");
const distAssetsFolder = path.join(distDirectory, "assets");
const distHTMLFile = path.join(distDirectory, "index.html");
const EventEmitter = require("events");
const emitter = new EventEmitter();

//create project-dist folder
fsPromises.mkdir(distDirectory, { recursive: true });

//supplementary function
async function checkIfFile(filePath) {
  try {
    const info = await fsPromises.stat(filePath);
    return info.isFile();
  } catch (err) {
    console.log(err.message);
  }
}

//merge css styles into one file using emitters
emitter.on("createBundle", () => {
  fs.writeFile(distStyleFile, "", (err) => {
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
  fs.readFile(distStyleFile, "utf-8", (err, oldData) => {
    if (err) throw new Error("Could not read the file info");
    if (list[index]) {
      fs.readFile(
        path.join(stylesDirectory, list[index]),
        "utf-8",
        (err, newData) => {
          if (err) throw new Error("Could not read the file info");
          fs.writeFile(
            distStyleFile,
            `${`${oldData === "" ? "" : `${oldData}\n\n`}`}${newData}`,
            (err) => {
              if (err) throw new Error("Could not write the file");
              if (list[index + 1])
                emitter.emit("readAndWrite", [list, index + 1]);
            }
          );
        }
      );
    }
  });
});

emitter.emit("createBundle");

function copyFoldersAndFiles(sourceDirectory, targetDirectory, boolean) {
  if (boolean) {
    fs.rm(distAssetsFolder, { recursive: true, force: true }, (err) => {
      if (err) throw err;
      fsPromises.mkdir(targetDirectory, { recursive: true });
      //check the content of the source folder
      fs.readdir(sourceDirectory, async (err, data) => {
        if (err) throw new Error("There is no such folder");
        //for each instance
        data.forEach(async (instance) => {
          //create directory name for this instance in source and in target
          let localSourceDir = path.join(sourceDirectory, instance);
          let localTargetDir = path.join(targetDirectory, instance);
          //check if the source instance is a folder
          if (await checkIfFile(localSourceDir)) {
            //if it is not a folder, it is a file. So, copy the instance to the target folder
            await fsPromises.copyFile(
              path.join(sourceDirectory, instance),
              path.join(targetDirectory, instance)
            );
            return;
          }
          //if it is a folder, run the function for this folder.
          await copyFoldersAndFiles(localSourceDir, localTargetDir);
        });
      });
    });
    return;
  }
  fsPromises.mkdir(targetDirectory, { recursive: true });
  //check the content of the source folder
  fs.readdir(sourceDirectory, async (err, data) => {
    if (err) throw new Error("There is no such folder");
    //for each instance
    data.forEach(async (instance) => {
      //create directory name for this instance in source and in target
      let localSourceDir = path.join(sourceDirectory, instance);
      let localTargetDir = path.join(targetDirectory, instance);
      //check if the source instance is a folder
      if (await checkIfFile(localSourceDir)) {
        //if it is not a folder, it is a file. So, copy the instance to the target folder
        await fsPromises.copyFile(
          path.join(sourceDirectory, instance),
          path.join(targetDirectory, instance)
        );
        return;
      }
      //if it is a folder, run the function for this folder.
      await copyFoldersAndFiles(localSourceDir, localTargetDir);
    });
  });
}

copyFoldersAndFiles(assetsDirectory, distAssetsFolder, true);


// assemble HTML document
fs.readFile(path.join(__dirname, "template.html"), "utf-8", (err, data) => {
  if (err) throw new Error("Could not find the template");
  let dataString = data.toString();
  fs.readdir(componentsDirectory, (err, dirData) => {
    if (err) throw new Error("There is no components folder");
    let newString = dataString;
    dirData.forEach(async (instance, i) => {
      let fileExt = path.extname(instance);
      let isFile = await checkIfFile(path.join(componentsDirectory, instance));
      if (isFile && fileExt === ".html") {
        fs.readFile(
          path.join(componentsDirectory, instance),
          "utf-8",
          (err, dataToAdd) => {
            if (err) throw new Error("There is no such file");
            const dataToBeAdded = dataToAdd.toString();
            newString = newString
              .split(`{{${instance.toString().slice(0, -5)}}}`)
              .join(`${dataToBeAdded}`);
            if (i === dirData.length - 1) {
              fs.writeFile(distHTMLFile, newString, (err) => {
                if (err) throw new Error("Could not save the HTML file");
              });
            }
          }
        );
      }
    });
  });
});
