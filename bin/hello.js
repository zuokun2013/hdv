var fs = require('fs');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var parse = require('markmap/lib/parse.markdown');
var transform = require('markmap/lib/transform.headings');

var text = fs.readFileSync('./byj.md', 'utf-8');

var headings = parse(text);
var root = transform(headings);

console.log(root);
const dom = new JSDOM(`<!DOCTYPE html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Markmap</title>
<style>
* {
  margin: 0;
  padding: 0;
}
#mindmap {
  display: block;
  width: 100vw;
  height: 100vh;
}
</style>

</head>
<body>
<svg id="mindmap"></svg>

</body>`);

console.log(dom.window.document.querySelector("body").innerHTML); 

console.log(dom.window.document.querySelector("svg").outerHTML); 

fs.writeFileSync('./byj.json', JSON.stringify(root, null, 5));

const Markmap = require('markmap-lib/dist/view');

const svgEl = dom.window.document.querySelector('svg');
Markmap.create(svgEl, null, root);
