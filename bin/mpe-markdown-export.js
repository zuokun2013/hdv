//  https://github.com/shd101wyy/mume
//  https://code.visualstudio.com/docs/editor/tasks
//  prerequisite: npm install --save @shd101wyy/mume

console.log(process.argv.slice(2));
console.log(process.argv.slice(2)[0]);

var mdfilepath = process.argv.slice(2)[0];


const mume = require("@shd101wyy/mume");
const path = require('path');
const os = require('os');

var aaa  = path.resolve(os.homedir(), ".mume"); 
// es6
// import * as mume from "@shd101wyy/mume"

async function main() {
  const configPath = path.resolve(os.homedir(), ".mume"); // use here your own config folder, default is "~/.mume"
  await mume.init(configPath); // default uses "~/.mume"

  const engine = new mume.MarkdownEngine({
    filePath: mdfilepath,
    config: {
      configPath: configPath,
      previewTheme: "github-light.css",
      // revealjsTheme: "white.css"
      codeBlockTheme: "default.css",
      printBackground: true,
      enableScriptExecution: false, // <= for running code chunks
    },
  });

  // open in browser
  await engine.openInBrowser({ runAllCodeChunks: false });
  await engine.markdownExport({ runAllCodeChunks: false });

  return process.exit();
}

main();