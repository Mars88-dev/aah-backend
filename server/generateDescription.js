const { spawn } = require("child_process");

function generateDescription(input, callback) {
  const process = spawn("python", ["model_training/predict.py", input]);

  let result = "";
  process.stdout.on("data", (data) => {
    result += data.toString();
  });

  process.on("close", () => {
    callback(result.trim());
  });
}

module.exports = generateDescription;
