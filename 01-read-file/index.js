const fs = require("fs");
const path = require("path");
const { stdout } = process;
const filePath = path.join(__dirname, "text.txt");
const inputData = fs.createReadStream(filePath, "utf-8");
inputData.on("data", (chunk) => stdout.write(chunk));
