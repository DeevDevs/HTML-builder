const fs = require("fs");
const path = require("path");
const { stdin } = process;
const filePath = path.join(__dirname, "entered-text.txt");

fs.writeFile(filePath, "", (err) => {
  if (err) throw new Error(`Could not create a file`);
});

console.log("Please, type the text below");

stdin.on("data", (data) => {
  if (data.toString().slice(0, -2) === "exit") process.exit();
  fs.readFile(filePath, "utf-8", (err, oldData) => {
    if (err) {
      throw new Error(
        `Could not find the file. Please, do not delete the text file during the process.`
      );
    }
    fs.writeFile(filePath, `${oldData}${data}`, (err) => {
      if (err) throw new Error(`Could not add data to the file`);
    });
  });
});

process.on("exit", () => {
  console.log(`Note-taking process is finished.`);
});

process.on("SIGINT", () => {
  process.exit();
});
