const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
const stylesDirectory = path.join(__dirname, "styles");
const assetsDirectory = path.join(__dirname, "assets");
const distDirectory = path.join(__dirname, "project-dist");
const distStyleFile = path.join(distDirectory, "styles.css");
const distAssetsFolder = path.join(distDirectory, "assets");
const EventEmitter = require("events");
const emitter = new EventEmitter();

//create project-dist folder
fsPromises.mkdir(distDirectory, { recursive: true });

//merge css styles into one file
async function checkIfFile(filePath) {
  try {
    const info = await fsPromises.stat(filePath);
    return info.isFile();
  } catch (err) {
    console.log(err.message);
  }
}

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

// //copy assets
// async function copyFoldersAndFiles(sourceDirectory, targetDirectory) {
//   // check if such target folder exists
//   fs.access(targetDirectory, (err) => {
//     //if NOT
//     if (err) {
//       //create a target folder
//       fsPromises.mkdir(targetDirectory, { recursive: true });
//       //check the content of the source folder
//       fs.readdir(sourceDirectory, async (err, data) => {
//         if (err) throw new Error("There is no such folder");
//         //for each instance
//         data.forEach(async (instance) => {
//           //create directory name for this instance in source and in target
//           let localSourceDir = path.join(sourceDirectory, instance);
//           let localTargetDir = path.join(targetDirectory, instance);
//           //check if the source instance is a folder
//           if (await checkIfFile(localSourceDir)) {
//             //if it is not a folder, it is a file. So, copy the instance to the target folder
//             await fsPromises.copyFile(
//               path.join(sourceDirectory, instance),
//               path.join(targetDirectory, instance)
//             );
//             return;
//           }
//           //if it is a folder, run the function for this folder.
//           await copyFoldersAndFiles(localSourceDir, localTargetDir);
//         });
//       });
//       return;
//     }
//     //if such target folder exists, check the content of the target folder
//     fs.readdir(targetDirectory, async (err, data) => {
//       if (err) throw new Error("There is no such folder");
//       //for each instance
//       data.forEach(async (instance) => {
//         //create directory name for this instance in source and in target
//         let localSourceDir = path.join(sourceDirectory, instance);
//         let localTargetDir = path.join(targetDirectory, instance);
//         //check if the source instance is a folder
//         if (!(await checkIfFile(localSourceDir))) {
//           //if it is not a folder, it is a file. So, let us delete this file
//           fs.unlink(path.join(localTargetDir, instance), (err) => {
//             if (err) return;
//           });
//           return;
//         }
//         //if it is a folder, run the function for this folder.
//         await copyFoldersAndFiles(localSourceDir, localTargetDir);
//         //and then delete this folder
//         fs.rmdir(localTargetDir, (err) => {
//           if (err) throw new Error("Folder not found");
//         });
//       });
//       //create a target folder
//       fsPromises.mkdir(targetDirectory, { recursive: true });
//       //check the content of the source folder
//       fs.readdir(sourceDirectory, async (err, data) => {
//         if (err) throw new Error("There is no such folder");
//         //for each instance
//         data.forEach(async (instance) => {
//           //create directory name for this instance in source and in target
//           let localSourceDir = path.join(sourceDirectory, instance);
//           let localTargetDir = path.join(targetDirectory, instance);
//           //check if the source instance is a folder
//           fs.access(localSourceDir, async (err) => {
//             //if it is not a folder, it is a file. So, copy the instance to the target folder
//             if (err) {
//               await fsPromises.copyFile(
//                 path.join(sourceDirectory, instance),
//                 path.join(targetDirectory, instance)
//               );
//               return;
//             }
//             //if it is a folder, run the function for this folder.
//             await copyFoldersAndFiles(localSourceDir, localTargetDir);
//           });
//         });
//       });
//     });
//   });
// }

async function copyFoldersAndFiles(sourceDirectory, targetDirectory, boolean) {
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
