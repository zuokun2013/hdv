/*! markmap-lib v0.13.2 | MIT License */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('katex')) :
typeof define === 'function' && define.amd ? define(['exports', 'katex'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.markmap = global.markmap || {}, global.window.katex));
})(this, (function (exports, require$$0) { 'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

function _extends$1() {
  _extends$1 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$1.apply(this, arguments);
}

/*! markmap-common v0.13.0 | MIT License */
class Hook {
  constructor() {
    this.listeners = [];
  }

  tap(fn) {
    this.listeners.push(fn);
    return () => this.revoke(fn);
  }

  revoke(fn) {
    const i = this.listeners.indexOf(fn);
    if (i >= 0) this.listeners.splice(i, 1);
  }

  revokeAll() {
    this.listeners.splice(0);
  }

  call(...args) {
    for (const fn of this.listeners) {
      fn(...args);
    }
  }

}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function escapeHtml$1(html) {
  return html.replace(/[&<"]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '"': '&quot;'
  })[m]);
}

function escapeScript(content) {
  return content.replace(/<(\/script>)/g, '\\x3c$2');
}

function htmlOpen(tagName, attrs) {
  const attrStr = attrs ? Object.entries(attrs).map(([key, value]) => {
    if (value == null || value === false) return;
    key = ` ${escapeHtml$1(key)}`;
    if (value === true) return key;
    return `${key}="${escapeHtml$1(value)}"`;
  }).filter(Boolean).join('') : '';
  return `<${tagName}${attrStr}>`;
}

function htmlClose(tagName) {
  return `</${tagName}>`;
}

function wrapHtml(tagName, content, attrs) {
  if (content == null) return htmlOpen(tagName, attrs);
  return htmlOpen(tagName, attrs) + (content || '') + htmlClose(tagName);
}

function buildCode(fn, args) {
  const params = args.map(arg => {
    if (typeof arg === 'function') return arg.toString();
    return JSON.stringify(arg != null ? arg : null);
  }).join(',');
  return `(${fn.toString()})(${params})`;
}

function persistJS(items, context) {
  return items.map(item => {
    if (item.type === 'script') return wrapHtml('script', '', item.data);

    if (item.type === 'iife') {
      const {
        fn,
        getParams
      } = item.data;
      return wrapHtml('script', escapeScript(buildCode(fn, (getParams == null ? void 0 : getParams(context)) || [])));
    }

    return '';
  });
}

function persistCSS(items) {
  return items.map(item => {
    if (item.type === 'stylesheet') {
      return wrapHtml('link', null, _extends({
        rel: 'stylesheet'
      }, item.data));
    }
    /* else if (item.type === 'style') */


    return wrapHtml('style', item.data);
  });
}

Math.random().toString(36).slice(2, 8);

function wrapFunction(fn, {
  before,
  after
}) {
  return function wrapped(...args) {
    const ctx = {
      args,
      thisObj: this
    };

    try {
      if (before) before(ctx);
    } catch (_unused) {// ignore
    }

    ctx.result = fn.apply(ctx.thisObj, ctx.args);

    try {
      if (after) after(ctx);
    } catch (_unused2) {// ignore
    }

    return ctx.result;
  };
}

function memoize(fn) {
  const cache = {};
  return function memoized(...args) {
    const key = `${args[0]}`;
    let data = cache[key];

    if (!data) {
      data = {
        value: fn(...args)
      };
      cache[key] = data;
    }

    return data.value;
  };
}

function createElement(tagName, props, attrs) {
  const el = document.createElement(tagName);

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      el[key] = value;
    });
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  return el;
}

const memoizedPreloadJS = memoize(url => {
  document.head.append(createElement('link', {
    rel: 'preload',
    as: 'script',
    href: url
  }));
});

function loadJSItem(item, context) {
  if (item.type === 'script') {
    return new Promise((resolve, reject) => {
      var _item$data;

      document.head.append(createElement('script', _extends({}, item.data, {
        onload: resolve,
        onerror: reject
      }))); // Run inline script synchronously

      if (!((_item$data = item.data) != null && _item$data.src)) resolve();
    });
  }

  if (item.type === 'iife') {
    const {
      fn,
      getParams
    } = item.data;
    fn(...((getParams == null ? void 0 : getParams(context)) || []));
  }
}

async function loadJS(items, context) {
  const needPreload = items.filter(item => {
    var _item$data2;

    return item.type === 'script' && ((_item$data2 = item.data) == null ? void 0 : _item$data2.src);
  });
  if (needPreload.length > 1) needPreload.forEach(item => memoizedPreloadJS(item.data.src));
  context = _extends({
    getMarkmap: () => window.markmap
  }, context);

  for (const item of items) {
    await loadJSItem(item, context);
  }
}

const template = "<!DOCTYPE html>\r\n<html>\r\n<head>\r\n<meta charset=\"UTF-8\">\r\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n<meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\r\n<title>Markmap</title>\r\n<style>\r\n* {\r\n  margin: 0;\r\n  padding: 0;\r\n}\r\n#mindmap {\r\n  display: block;\r\n  width: 100vw;\r\n  height: 100vh;\r\n}\r\n</style>\r\n<!--CSS-->\r\n</head>\r\n<body>\r\n<svg id=\"mindmap\"></svg>\r\n<!--JS-->\r\n</body>\r\n</html>\r\n";
const BASE_JS = [`https://cdn.jsdelivr.net/npm/d3@${"6.7.0"}`, `https://cdn.jsdelivr.net/npm/markmap-view@${"0.13.2"}`].map(src => ({
  type: 'script',
  data: {
    src
  }
}));
function fillTemplate(root, assets, extra) {
  extra = _extends$1({
    baseJs: BASE_JS
  }, extra);
  const {
    scripts,
    styles
  } = assets;
  const cssList = [...(styles ? persistCSS(styles) : [])];
  const context = {
    getMarkmap: () => window.markmap,
    getOptions: extra.getOptions,
    jsonOptions: extra.jsonOptions,
    root
  };
  const jsList = [...persistJS([...extra.baseJs, ...(scripts || []), {
    type: 'iife',
    data: {
      fn: (getMarkmap, getOptions, root, jsonOptions) => {
        const markmap = getMarkmap();
        window.mm = markmap.Markmap.create('svg#mindmap', (getOptions || markmap.deriveOptions)(jsonOptions), root);
      },
      getParams: ({
        getMarkmap,
        getOptions,
        root,
        jsonOptions
      }) => {
        return [getMarkmap, getOptions, root, jsonOptions];
      }
    }
  }], context)];
  const html = template.replace('<!--CSS-->', () => cssList.join('')).replace('<!--JS-->', () => jsList.join(''));
  return html;
}

// List of valid entities
//
// Generate with ./support/entities.js script
//

/*eslint quotes:0*/
var entities = {
  "Aacute": "\u00C1",
  "aacute": "\u00E1",
  "Abreve": "\u0102",
  "abreve": "\u0103",
  "ac": "\u223E",
  "acd": "\u223F",
  "acE": "\u223E\u0333",
  "Acirc": "\u00C2",
  "acirc": "\u00E2",
  "acute": "\u00B4",
  "Acy": "\u0410",
  "acy": "\u0430",
  "AElig": "\u00C6",
  "aelig": "\u00E6",
  "af": "\u2061",
  "Afr": "\uD835\uDD04",
  "afr": "\uD835\uDD1E",
  "Agrave": "\u00C0",
  "agrave": "\u00E0",
  "alefsym": "\u2135",
  "aleph": "\u2135",
  "Alpha": "\u0391",
  "alpha": "\u03B1",
  "Amacr": "\u0100",
  "amacr": "\u0101",
  "amalg": "\u2A3F",
  "AMP": "\u0026",
  "amp": "\u0026",
  "And": "\u2A53",
  "and": "\u2227",
  "andand": "\u2A55",
  "andd": "\u2A5C",
  "andslope": "\u2A58",
  "andv": "\u2A5A",
  "ang": "\u2220",
  "ange": "\u29A4",
  "angle": "\u2220",
  "angmsd": "\u2221",
  "angmsdaa": "\u29A8",
  "angmsdab": "\u29A9",
  "angmsdac": "\u29AA",
  "angmsdad": "\u29AB",
  "angmsdae": "\u29AC",
  "angmsdaf": "\u29AD",
  "angmsdag": "\u29AE",
  "angmsdah": "\u29AF",
  "angrt": "\u221F",
  "angrtvb": "\u22BE",
  "angrtvbd": "\u299D",
  "angsph": "\u2222",
  "angst": "\u00C5",
  "angzarr": "\u237C",
  "Aogon": "\u0104",
  "aogon": "\u0105",
  "Aopf": "\uD835\uDD38",
  "aopf": "\uD835\uDD52",
  "ap": "\u2248",
  "apacir": "\u2A6F",
  "apE": "\u2A70",
  "ape": "\u224A",
  "apid": "\u224B",
  "apos": "\u0027",
  "ApplyFunction": "\u2061",
  "approx": "\u2248",
  "approxeq": "\u224A",
  "Aring": "\u00C5",
  "aring": "\u00E5",
  "Ascr": "\uD835\uDC9C",
  "ascr": "\uD835\uDCB6",
  "Assign": "\u2254",
  "ast": "\u002A",
  "asymp": "\u2248",
  "asympeq": "\u224D",
  "Atilde": "\u00C3",
  "atilde": "\u00E3",
  "Auml": "\u00C4",
  "auml": "\u00E4",
  "awconint": "\u2233",
  "awint": "\u2A11",
  "backcong": "\u224C",
  "backepsilon": "\u03F6",
  "backprime": "\u2035",
  "backsim": "\u223D",
  "backsimeq": "\u22CD",
  "Backslash": "\u2216",
  "Barv": "\u2AE7",
  "barvee": "\u22BD",
  "Barwed": "\u2306",
  "barwed": "\u2305",
  "barwedge": "\u2305",
  "bbrk": "\u23B5",
  "bbrktbrk": "\u23B6",
  "bcong": "\u224C",
  "Bcy": "\u0411",
  "bcy": "\u0431",
  "bdquo": "\u201E",
  "becaus": "\u2235",
  "Because": "\u2235",
  "because": "\u2235",
  "bemptyv": "\u29B0",
  "bepsi": "\u03F6",
  "bernou": "\u212C",
  "Bernoullis": "\u212C",
  "Beta": "\u0392",
  "beta": "\u03B2",
  "beth": "\u2136",
  "between": "\u226C",
  "Bfr": "\uD835\uDD05",
  "bfr": "\uD835\uDD1F",
  "bigcap": "\u22C2",
  "bigcirc": "\u25EF",
  "bigcup": "\u22C3",
  "bigodot": "\u2A00",
  "bigoplus": "\u2A01",
  "bigotimes": "\u2A02",
  "bigsqcup": "\u2A06",
  "bigstar": "\u2605",
  "bigtriangledown": "\u25BD",
  "bigtriangleup": "\u25B3",
  "biguplus": "\u2A04",
  "bigvee": "\u22C1",
  "bigwedge": "\u22C0",
  "bkarow": "\u290D",
  "blacklozenge": "\u29EB",
  "blacksquare": "\u25AA",
  "blacktriangle": "\u25B4",
  "blacktriangledown": "\u25BE",
  "blacktriangleleft": "\u25C2",
  "blacktriangleright": "\u25B8",
  "blank": "\u2423",
  "blk12": "\u2592",
  "blk14": "\u2591",
  "blk34": "\u2593",
  "block": "\u2588",
  "bne": "\u003D\u20E5",
  "bnequiv": "\u2261\u20E5",
  "bNot": "\u2AED",
  "bnot": "\u2310",
  "Bopf": "\uD835\uDD39",
  "bopf": "\uD835\uDD53",
  "bot": "\u22A5",
  "bottom": "\u22A5",
  "bowtie": "\u22C8",
  "boxbox": "\u29C9",
  "boxDL": "\u2557",
  "boxDl": "\u2556",
  "boxdL": "\u2555",
  "boxdl": "\u2510",
  "boxDR": "\u2554",
  "boxDr": "\u2553",
  "boxdR": "\u2552",
  "boxdr": "\u250C",
  "boxH": "\u2550",
  "boxh": "\u2500",
  "boxHD": "\u2566",
  "boxHd": "\u2564",
  "boxhD": "\u2565",
  "boxhd": "\u252C",
  "boxHU": "\u2569",
  "boxHu": "\u2567",
  "boxhU": "\u2568",
  "boxhu": "\u2534",
  "boxminus": "\u229F",
  "boxplus": "\u229E",
  "boxtimes": "\u22A0",
  "boxUL": "\u255D",
  "boxUl": "\u255C",
  "boxuL": "\u255B",
  "boxul": "\u2518",
  "boxUR": "\u255A",
  "boxUr": "\u2559",
  "boxuR": "\u2558",
  "boxur": "\u2514",
  "boxV": "\u2551",
  "boxv": "\u2502",
  "boxVH": "\u256C",
  "boxVh": "\u256B",
  "boxvH": "\u256A",
  "boxvh": "\u253C",
  "boxVL": "\u2563",
  "boxVl": "\u2562",
  "boxvL": "\u2561",
  "boxvl": "\u2524",
  "boxVR": "\u2560",
  "boxVr": "\u255F",
  "boxvR": "\u255E",
  "boxvr": "\u251C",
  "bprime": "\u2035",
  "Breve": "\u02D8",
  "breve": "\u02D8",
  "brvbar": "\u00A6",
  "Bscr": "\u212C",
  "bscr": "\uD835\uDCB7",
  "bsemi": "\u204F",
  "bsim": "\u223D",
  "bsime": "\u22CD",
  "bsol": "\u005C",
  "bsolb": "\u29C5",
  "bsolhsub": "\u27C8",
  "bull": "\u2022",
  "bullet": "\u2022",
  "bump": "\u224E",
  "bumpE": "\u2AAE",
  "bumpe": "\u224F",
  "Bumpeq": "\u224E",
  "bumpeq": "\u224F",
  "Cacute": "\u0106",
  "cacute": "\u0107",
  "Cap": "\u22D2",
  "cap": "\u2229",
  "capand": "\u2A44",
  "capbrcup": "\u2A49",
  "capcap": "\u2A4B",
  "capcup": "\u2A47",
  "capdot": "\u2A40",
  "CapitalDifferentialD": "\u2145",
  "caps": "\u2229\uFE00",
  "caret": "\u2041",
  "caron": "\u02C7",
  "Cayleys": "\u212D",
  "ccaps": "\u2A4D",
  "Ccaron": "\u010C",
  "ccaron": "\u010D",
  "Ccedil": "\u00C7",
  "ccedil": "\u00E7",
  "Ccirc": "\u0108",
  "ccirc": "\u0109",
  "Cconint": "\u2230",
  "ccups": "\u2A4C",
  "ccupssm": "\u2A50",
  "Cdot": "\u010A",
  "cdot": "\u010B",
  "cedil": "\u00B8",
  "Cedilla": "\u00B8",
  "cemptyv": "\u29B2",
  "cent": "\u00A2",
  "CenterDot": "\u00B7",
  "centerdot": "\u00B7",
  "Cfr": "\u212D",
  "cfr": "\uD835\uDD20",
  "CHcy": "\u0427",
  "chcy": "\u0447",
  "check": "\u2713",
  "checkmark": "\u2713",
  "Chi": "\u03A7",
  "chi": "\u03C7",
  "cir": "\u25CB",
  "circ": "\u02C6",
  "circeq": "\u2257",
  "circlearrowleft": "\u21BA",
  "circlearrowright": "\u21BB",
  "circledast": "\u229B",
  "circledcirc": "\u229A",
  "circleddash": "\u229D",
  "CircleDot": "\u2299",
  "circledR": "\u00AE",
  "circledS": "\u24C8",
  "CircleMinus": "\u2296",
  "CirclePlus": "\u2295",
  "CircleTimes": "\u2297",
  "cirE": "\u29C3",
  "cire": "\u2257",
  "cirfnint": "\u2A10",
  "cirmid": "\u2AEF",
  "cirscir": "\u29C2",
  "ClockwiseContourIntegral": "\u2232",
  "CloseCurlyDoubleQuote": "\u201D",
  "CloseCurlyQuote": "\u2019",
  "clubs": "\u2663",
  "clubsuit": "\u2663",
  "Colon": "\u2237",
  "colon": "\u003A",
  "Colone": "\u2A74",
  "colone": "\u2254",
  "coloneq": "\u2254",
  "comma": "\u002C",
  "commat": "\u0040",
  "comp": "\u2201",
  "compfn": "\u2218",
  "complement": "\u2201",
  "complexes": "\u2102",
  "cong": "\u2245",
  "congdot": "\u2A6D",
  "Congruent": "\u2261",
  "Conint": "\u222F",
  "conint": "\u222E",
  "ContourIntegral": "\u222E",
  "Copf": "\u2102",
  "copf": "\uD835\uDD54",
  "coprod": "\u2210",
  "Coproduct": "\u2210",
  "COPY": "\u00A9",
  "copy": "\u00A9",
  "copysr": "\u2117",
  "CounterClockwiseContourIntegral": "\u2233",
  "crarr": "\u21B5",
  "Cross": "\u2A2F",
  "cross": "\u2717",
  "Cscr": "\uD835\uDC9E",
  "cscr": "\uD835\uDCB8",
  "csub": "\u2ACF",
  "csube": "\u2AD1",
  "csup": "\u2AD0",
  "csupe": "\u2AD2",
  "ctdot": "\u22EF",
  "cudarrl": "\u2938",
  "cudarrr": "\u2935",
  "cuepr": "\u22DE",
  "cuesc": "\u22DF",
  "cularr": "\u21B6",
  "cularrp": "\u293D",
  "Cup": "\u22D3",
  "cup": "\u222A",
  "cupbrcap": "\u2A48",
  "CupCap": "\u224D",
  "cupcap": "\u2A46",
  "cupcup": "\u2A4A",
  "cupdot": "\u228D",
  "cupor": "\u2A45",
  "cups": "\u222A\uFE00",
  "curarr": "\u21B7",
  "curarrm": "\u293C",
  "curlyeqprec": "\u22DE",
  "curlyeqsucc": "\u22DF",
  "curlyvee": "\u22CE",
  "curlywedge": "\u22CF",
  "curren": "\u00A4",
  "curvearrowleft": "\u21B6",
  "curvearrowright": "\u21B7",
  "cuvee": "\u22CE",
  "cuwed": "\u22CF",
  "cwconint": "\u2232",
  "cwint": "\u2231",
  "cylcty": "\u232D",
  "Dagger": "\u2021",
  "dagger": "\u2020",
  "daleth": "\u2138",
  "Darr": "\u21A1",
  "dArr": "\u21D3",
  "darr": "\u2193",
  "dash": "\u2010",
  "Dashv": "\u2AE4",
  "dashv": "\u22A3",
  "dbkarow": "\u290F",
  "dblac": "\u02DD",
  "Dcaron": "\u010E",
  "dcaron": "\u010F",
  "Dcy": "\u0414",
  "dcy": "\u0434",
  "DD": "\u2145",
  "dd": "\u2146",
  "ddagger": "\u2021",
  "ddarr": "\u21CA",
  "DDotrahd": "\u2911",
  "ddotseq": "\u2A77",
  "deg": "\u00B0",
  "Del": "\u2207",
  "Delta": "\u0394",
  "delta": "\u03B4",
  "demptyv": "\u29B1",
  "dfisht": "\u297F",
  "Dfr": "\uD835\uDD07",
  "dfr": "\uD835\uDD21",
  "dHar": "\u2965",
  "dharl": "\u21C3",
  "dharr": "\u21C2",
  "DiacriticalAcute": "\u00B4",
  "DiacriticalDot": "\u02D9",
  "DiacriticalDoubleAcute": "\u02DD",
  "DiacriticalGrave": "\u0060",
  "DiacriticalTilde": "\u02DC",
  "diam": "\u22C4",
  "Diamond": "\u22C4",
  "diamond": "\u22C4",
  "diamondsuit": "\u2666",
  "diams": "\u2666",
  "die": "\u00A8",
  "DifferentialD": "\u2146",
  "digamma": "\u03DD",
  "disin": "\u22F2",
  "div": "\u00F7",
  "divide": "\u00F7",
  "divideontimes": "\u22C7",
  "divonx": "\u22C7",
  "DJcy": "\u0402",
  "djcy": "\u0452",
  "dlcorn": "\u231E",
  "dlcrop": "\u230D",
  "dollar": "\u0024",
  "Dopf": "\uD835\uDD3B",
  "dopf": "\uD835\uDD55",
  "Dot": "\u00A8",
  "dot": "\u02D9",
  "DotDot": "\u20DC",
  "doteq": "\u2250",
  "doteqdot": "\u2251",
  "DotEqual": "\u2250",
  "dotminus": "\u2238",
  "dotplus": "\u2214",
  "dotsquare": "\u22A1",
  "doublebarwedge": "\u2306",
  "DoubleContourIntegral": "\u222F",
  "DoubleDot": "\u00A8",
  "DoubleDownArrow": "\u21D3",
  "DoubleLeftArrow": "\u21D0",
  "DoubleLeftRightArrow": "\u21D4",
  "DoubleLeftTee": "\u2AE4",
  "DoubleLongLeftArrow": "\u27F8",
  "DoubleLongLeftRightArrow": "\u27FA",
  "DoubleLongRightArrow": "\u27F9",
  "DoubleRightArrow": "\u21D2",
  "DoubleRightTee": "\u22A8",
  "DoubleUpArrow": "\u21D1",
  "DoubleUpDownArrow": "\u21D5",
  "DoubleVerticalBar": "\u2225",
  "DownArrow": "\u2193",
  "Downarrow": "\u21D3",
  "downarrow": "\u2193",
  "DownArrowBar": "\u2913",
  "DownArrowUpArrow": "\u21F5",
  "DownBreve": "\u0311",
  "downdownarrows": "\u21CA",
  "downharpoonleft": "\u21C3",
  "downharpoonright": "\u21C2",
  "DownLeftRightVector": "\u2950",
  "DownLeftTeeVector": "\u295E",
  "DownLeftVector": "\u21BD",
  "DownLeftVectorBar": "\u2956",
  "DownRightTeeVector": "\u295F",
  "DownRightVector": "\u21C1",
  "DownRightVectorBar": "\u2957",
  "DownTee": "\u22A4",
  "DownTeeArrow": "\u21A7",
  "drbkarow": "\u2910",
  "drcorn": "\u231F",
  "drcrop": "\u230C",
  "Dscr": "\uD835\uDC9F",
  "dscr": "\uD835\uDCB9",
  "DScy": "\u0405",
  "dscy": "\u0455",
  "dsol": "\u29F6",
  "Dstrok": "\u0110",
  "dstrok": "\u0111",
  "dtdot": "\u22F1",
  "dtri": "\u25BF",
  "dtrif": "\u25BE",
  "duarr": "\u21F5",
  "duhar": "\u296F",
  "dwangle": "\u29A6",
  "DZcy": "\u040F",
  "dzcy": "\u045F",
  "dzigrarr": "\u27FF",
  "Eacute": "\u00C9",
  "eacute": "\u00E9",
  "easter": "\u2A6E",
  "Ecaron": "\u011A",
  "ecaron": "\u011B",
  "ecir": "\u2256",
  "Ecirc": "\u00CA",
  "ecirc": "\u00EA",
  "ecolon": "\u2255",
  "Ecy": "\u042D",
  "ecy": "\u044D",
  "eDDot": "\u2A77",
  "Edot": "\u0116",
  "eDot": "\u2251",
  "edot": "\u0117",
  "ee": "\u2147",
  "efDot": "\u2252",
  "Efr": "\uD835\uDD08",
  "efr": "\uD835\uDD22",
  "eg": "\u2A9A",
  "Egrave": "\u00C8",
  "egrave": "\u00E8",
  "egs": "\u2A96",
  "egsdot": "\u2A98",
  "el": "\u2A99",
  "Element": "\u2208",
  "elinters": "\u23E7",
  "ell": "\u2113",
  "els": "\u2A95",
  "elsdot": "\u2A97",
  "Emacr": "\u0112",
  "emacr": "\u0113",
  "empty": "\u2205",
  "emptyset": "\u2205",
  "EmptySmallSquare": "\u25FB",
  "emptyv": "\u2205",
  "EmptyVerySmallSquare": "\u25AB",
  "emsp": "\u2003",
  "emsp13": "\u2004",
  "emsp14": "\u2005",
  "ENG": "\u014A",
  "eng": "\u014B",
  "ensp": "\u2002",
  "Eogon": "\u0118",
  "eogon": "\u0119",
  "Eopf": "\uD835\uDD3C",
  "eopf": "\uD835\uDD56",
  "epar": "\u22D5",
  "eparsl": "\u29E3",
  "eplus": "\u2A71",
  "epsi": "\u03B5",
  "Epsilon": "\u0395",
  "epsilon": "\u03B5",
  "epsiv": "\u03F5",
  "eqcirc": "\u2256",
  "eqcolon": "\u2255",
  "eqsim": "\u2242",
  "eqslantgtr": "\u2A96",
  "eqslantless": "\u2A95",
  "Equal": "\u2A75",
  "equals": "\u003D",
  "EqualTilde": "\u2242",
  "equest": "\u225F",
  "Equilibrium": "\u21CC",
  "equiv": "\u2261",
  "equivDD": "\u2A78",
  "eqvparsl": "\u29E5",
  "erarr": "\u2971",
  "erDot": "\u2253",
  "Escr": "\u2130",
  "escr": "\u212F",
  "esdot": "\u2250",
  "Esim": "\u2A73",
  "esim": "\u2242",
  "Eta": "\u0397",
  "eta": "\u03B7",
  "ETH": "\u00D0",
  "eth": "\u00F0",
  "Euml": "\u00CB",
  "euml": "\u00EB",
  "euro": "\u20AC",
  "excl": "\u0021",
  "exist": "\u2203",
  "Exists": "\u2203",
  "expectation": "\u2130",
  "ExponentialE": "\u2147",
  "exponentiale": "\u2147",
  "fallingdotseq": "\u2252",
  "Fcy": "\u0424",
  "fcy": "\u0444",
  "female": "\u2640",
  "ffilig": "\uFB03",
  "fflig": "\uFB00",
  "ffllig": "\uFB04",
  "Ffr": "\uD835\uDD09",
  "ffr": "\uD835\uDD23",
  "filig": "\uFB01",
  "FilledSmallSquare": "\u25FC",
  "FilledVerySmallSquare": "\u25AA",
  "fjlig": "\u0066\u006A",
  "flat": "\u266D",
  "fllig": "\uFB02",
  "fltns": "\u25B1",
  "fnof": "\u0192",
  "Fopf": "\uD835\uDD3D",
  "fopf": "\uD835\uDD57",
  "ForAll": "\u2200",
  "forall": "\u2200",
  "fork": "\u22D4",
  "forkv": "\u2AD9",
  "Fouriertrf": "\u2131",
  "fpartint": "\u2A0D",
  "frac12": "\u00BD",
  "frac13": "\u2153",
  "frac14": "\u00BC",
  "frac15": "\u2155",
  "frac16": "\u2159",
  "frac18": "\u215B",
  "frac23": "\u2154",
  "frac25": "\u2156",
  "frac34": "\u00BE",
  "frac35": "\u2157",
  "frac38": "\u215C",
  "frac45": "\u2158",
  "frac56": "\u215A",
  "frac58": "\u215D",
  "frac78": "\u215E",
  "frasl": "\u2044",
  "frown": "\u2322",
  "Fscr": "\u2131",
  "fscr": "\uD835\uDCBB",
  "gacute": "\u01F5",
  "Gamma": "\u0393",
  "gamma": "\u03B3",
  "Gammad": "\u03DC",
  "gammad": "\u03DD",
  "gap": "\u2A86",
  "Gbreve": "\u011E",
  "gbreve": "\u011F",
  "Gcedil": "\u0122",
  "Gcirc": "\u011C",
  "gcirc": "\u011D",
  "Gcy": "\u0413",
  "gcy": "\u0433",
  "Gdot": "\u0120",
  "gdot": "\u0121",
  "gE": "\u2267",
  "ge": "\u2265",
  "gEl": "\u2A8C",
  "gel": "\u22DB",
  "geq": "\u2265",
  "geqq": "\u2267",
  "geqslant": "\u2A7E",
  "ges": "\u2A7E",
  "gescc": "\u2AA9",
  "gesdot": "\u2A80",
  "gesdoto": "\u2A82",
  "gesdotol": "\u2A84",
  "gesl": "\u22DB\uFE00",
  "gesles": "\u2A94",
  "Gfr": "\uD835\uDD0A",
  "gfr": "\uD835\uDD24",
  "Gg": "\u22D9",
  "gg": "\u226B",
  "ggg": "\u22D9",
  "gimel": "\u2137",
  "GJcy": "\u0403",
  "gjcy": "\u0453",
  "gl": "\u2277",
  "gla": "\u2AA5",
  "glE": "\u2A92",
  "glj": "\u2AA4",
  "gnap": "\u2A8A",
  "gnapprox": "\u2A8A",
  "gnE": "\u2269",
  "gne": "\u2A88",
  "gneq": "\u2A88",
  "gneqq": "\u2269",
  "gnsim": "\u22E7",
  "Gopf": "\uD835\uDD3E",
  "gopf": "\uD835\uDD58",
  "grave": "\u0060",
  "GreaterEqual": "\u2265",
  "GreaterEqualLess": "\u22DB",
  "GreaterFullEqual": "\u2267",
  "GreaterGreater": "\u2AA2",
  "GreaterLess": "\u2277",
  "GreaterSlantEqual": "\u2A7E",
  "GreaterTilde": "\u2273",
  "Gscr": "\uD835\uDCA2",
  "gscr": "\u210A",
  "gsim": "\u2273",
  "gsime": "\u2A8E",
  "gsiml": "\u2A90",
  "GT": "\u003E",
  "Gt": "\u226B",
  "gt": "\u003E",
  "gtcc": "\u2AA7",
  "gtcir": "\u2A7A",
  "gtdot": "\u22D7",
  "gtlPar": "\u2995",
  "gtquest": "\u2A7C",
  "gtrapprox": "\u2A86",
  "gtrarr": "\u2978",
  "gtrdot": "\u22D7",
  "gtreqless": "\u22DB",
  "gtreqqless": "\u2A8C",
  "gtrless": "\u2277",
  "gtrsim": "\u2273",
  "gvertneqq": "\u2269\uFE00",
  "gvnE": "\u2269\uFE00",
  "Hacek": "\u02C7",
  "hairsp": "\u200A",
  "half": "\u00BD",
  "hamilt": "\u210B",
  "HARDcy": "\u042A",
  "hardcy": "\u044A",
  "hArr": "\u21D4",
  "harr": "\u2194",
  "harrcir": "\u2948",
  "harrw": "\u21AD",
  "Hat": "\u005E",
  "hbar": "\u210F",
  "Hcirc": "\u0124",
  "hcirc": "\u0125",
  "hearts": "\u2665",
  "heartsuit": "\u2665",
  "hellip": "\u2026",
  "hercon": "\u22B9",
  "Hfr": "\u210C",
  "hfr": "\uD835\uDD25",
  "HilbertSpace": "\u210B",
  "hksearow": "\u2925",
  "hkswarow": "\u2926",
  "hoarr": "\u21FF",
  "homtht": "\u223B",
  "hookleftarrow": "\u21A9",
  "hookrightarrow": "\u21AA",
  "Hopf": "\u210D",
  "hopf": "\uD835\uDD59",
  "horbar": "\u2015",
  "HorizontalLine": "\u2500",
  "Hscr": "\u210B",
  "hscr": "\uD835\uDCBD",
  "hslash": "\u210F",
  "Hstrok": "\u0126",
  "hstrok": "\u0127",
  "HumpDownHump": "\u224E",
  "HumpEqual": "\u224F",
  "hybull": "\u2043",
  "hyphen": "\u2010",
  "Iacute": "\u00CD",
  "iacute": "\u00ED",
  "ic": "\u2063",
  "Icirc": "\u00CE",
  "icirc": "\u00EE",
  "Icy": "\u0418",
  "icy": "\u0438",
  "Idot": "\u0130",
  "IEcy": "\u0415",
  "iecy": "\u0435",
  "iexcl": "\u00A1",
  "iff": "\u21D4",
  "Ifr": "\u2111",
  "ifr": "\uD835\uDD26",
  "Igrave": "\u00CC",
  "igrave": "\u00EC",
  "ii": "\u2148",
  "iiiint": "\u2A0C",
  "iiint": "\u222D",
  "iinfin": "\u29DC",
  "iiota": "\u2129",
  "IJlig": "\u0132",
  "ijlig": "\u0133",
  "Im": "\u2111",
  "Imacr": "\u012A",
  "imacr": "\u012B",
  "image": "\u2111",
  "ImaginaryI": "\u2148",
  "imagline": "\u2110",
  "imagpart": "\u2111",
  "imath": "\u0131",
  "imof": "\u22B7",
  "imped": "\u01B5",
  "Implies": "\u21D2",
  "in": "\u2208",
  "incare": "\u2105",
  "infin": "\u221E",
  "infintie": "\u29DD",
  "inodot": "\u0131",
  "Int": "\u222C",
  "int": "\u222B",
  "intcal": "\u22BA",
  "integers": "\u2124",
  "Integral": "\u222B",
  "intercal": "\u22BA",
  "Intersection": "\u22C2",
  "intlarhk": "\u2A17",
  "intprod": "\u2A3C",
  "InvisibleComma": "\u2063",
  "InvisibleTimes": "\u2062",
  "IOcy": "\u0401",
  "iocy": "\u0451",
  "Iogon": "\u012E",
  "iogon": "\u012F",
  "Iopf": "\uD835\uDD40",
  "iopf": "\uD835\uDD5A",
  "Iota": "\u0399",
  "iota": "\u03B9",
  "iprod": "\u2A3C",
  "iquest": "\u00BF",
  "Iscr": "\u2110",
  "iscr": "\uD835\uDCBE",
  "isin": "\u2208",
  "isindot": "\u22F5",
  "isinE": "\u22F9",
  "isins": "\u22F4",
  "isinsv": "\u22F3",
  "isinv": "\u2208",
  "it": "\u2062",
  "Itilde": "\u0128",
  "itilde": "\u0129",
  "Iukcy": "\u0406",
  "iukcy": "\u0456",
  "Iuml": "\u00CF",
  "iuml": "\u00EF",
  "Jcirc": "\u0134",
  "jcirc": "\u0135",
  "Jcy": "\u0419",
  "jcy": "\u0439",
  "Jfr": "\uD835\uDD0D",
  "jfr": "\uD835\uDD27",
  "jmath": "\u0237",
  "Jopf": "\uD835\uDD41",
  "jopf": "\uD835\uDD5B",
  "Jscr": "\uD835\uDCA5",
  "jscr": "\uD835\uDCBF",
  "Jsercy": "\u0408",
  "jsercy": "\u0458",
  "Jukcy": "\u0404",
  "jukcy": "\u0454",
  "Kappa": "\u039A",
  "kappa": "\u03BA",
  "kappav": "\u03F0",
  "Kcedil": "\u0136",
  "kcedil": "\u0137",
  "Kcy": "\u041A",
  "kcy": "\u043A",
  "Kfr": "\uD835\uDD0E",
  "kfr": "\uD835\uDD28",
  "kgreen": "\u0138",
  "KHcy": "\u0425",
  "khcy": "\u0445",
  "KJcy": "\u040C",
  "kjcy": "\u045C",
  "Kopf": "\uD835\uDD42",
  "kopf": "\uD835\uDD5C",
  "Kscr": "\uD835\uDCA6",
  "kscr": "\uD835\uDCC0",
  "lAarr": "\u21DA",
  "Lacute": "\u0139",
  "lacute": "\u013A",
  "laemptyv": "\u29B4",
  "lagran": "\u2112",
  "Lambda": "\u039B",
  "lambda": "\u03BB",
  "Lang": "\u27EA",
  "lang": "\u27E8",
  "langd": "\u2991",
  "langle": "\u27E8",
  "lap": "\u2A85",
  "Laplacetrf": "\u2112",
  "laquo": "\u00AB",
  "Larr": "\u219E",
  "lArr": "\u21D0",
  "larr": "\u2190",
  "larrb": "\u21E4",
  "larrbfs": "\u291F",
  "larrfs": "\u291D",
  "larrhk": "\u21A9",
  "larrlp": "\u21AB",
  "larrpl": "\u2939",
  "larrsim": "\u2973",
  "larrtl": "\u21A2",
  "lat": "\u2AAB",
  "lAtail": "\u291B",
  "latail": "\u2919",
  "late": "\u2AAD",
  "lates": "\u2AAD\uFE00",
  "lBarr": "\u290E",
  "lbarr": "\u290C",
  "lbbrk": "\u2772",
  "lbrace": "\u007B",
  "lbrack": "\u005B",
  "lbrke": "\u298B",
  "lbrksld": "\u298F",
  "lbrkslu": "\u298D",
  "Lcaron": "\u013D",
  "lcaron": "\u013E",
  "Lcedil": "\u013B",
  "lcedil": "\u013C",
  "lceil": "\u2308",
  "lcub": "\u007B",
  "Lcy": "\u041B",
  "lcy": "\u043B",
  "ldca": "\u2936",
  "ldquo": "\u201C",
  "ldquor": "\u201E",
  "ldrdhar": "\u2967",
  "ldrushar": "\u294B",
  "ldsh": "\u21B2",
  "lE": "\u2266",
  "le": "\u2264",
  "LeftAngleBracket": "\u27E8",
  "LeftArrow": "\u2190",
  "Leftarrow": "\u21D0",
  "leftarrow": "\u2190",
  "LeftArrowBar": "\u21E4",
  "LeftArrowRightArrow": "\u21C6",
  "leftarrowtail": "\u21A2",
  "LeftCeiling": "\u2308",
  "LeftDoubleBracket": "\u27E6",
  "LeftDownTeeVector": "\u2961",
  "LeftDownVector": "\u21C3",
  "LeftDownVectorBar": "\u2959",
  "LeftFloor": "\u230A",
  "leftharpoondown": "\u21BD",
  "leftharpoonup": "\u21BC",
  "leftleftarrows": "\u21C7",
  "LeftRightArrow": "\u2194",
  "Leftrightarrow": "\u21D4",
  "leftrightarrow": "\u2194",
  "leftrightarrows": "\u21C6",
  "leftrightharpoons": "\u21CB",
  "leftrightsquigarrow": "\u21AD",
  "LeftRightVector": "\u294E",
  "LeftTee": "\u22A3",
  "LeftTeeArrow": "\u21A4",
  "LeftTeeVector": "\u295A",
  "leftthreetimes": "\u22CB",
  "LeftTriangle": "\u22B2",
  "LeftTriangleBar": "\u29CF",
  "LeftTriangleEqual": "\u22B4",
  "LeftUpDownVector": "\u2951",
  "LeftUpTeeVector": "\u2960",
  "LeftUpVector": "\u21BF",
  "LeftUpVectorBar": "\u2958",
  "LeftVector": "\u21BC",
  "LeftVectorBar": "\u2952",
  "lEg": "\u2A8B",
  "leg": "\u22DA",
  "leq": "\u2264",
  "leqq": "\u2266",
  "leqslant": "\u2A7D",
  "les": "\u2A7D",
  "lescc": "\u2AA8",
  "lesdot": "\u2A7F",
  "lesdoto": "\u2A81",
  "lesdotor": "\u2A83",
  "lesg": "\u22DA\uFE00",
  "lesges": "\u2A93",
  "lessapprox": "\u2A85",
  "lessdot": "\u22D6",
  "lesseqgtr": "\u22DA",
  "lesseqqgtr": "\u2A8B",
  "LessEqualGreater": "\u22DA",
  "LessFullEqual": "\u2266",
  "LessGreater": "\u2276",
  "lessgtr": "\u2276",
  "LessLess": "\u2AA1",
  "lesssim": "\u2272",
  "LessSlantEqual": "\u2A7D",
  "LessTilde": "\u2272",
  "lfisht": "\u297C",
  "lfloor": "\u230A",
  "Lfr": "\uD835\uDD0F",
  "lfr": "\uD835\uDD29",
  "lg": "\u2276",
  "lgE": "\u2A91",
  "lHar": "\u2962",
  "lhard": "\u21BD",
  "lharu": "\u21BC",
  "lharul": "\u296A",
  "lhblk": "\u2584",
  "LJcy": "\u0409",
  "ljcy": "\u0459",
  "Ll": "\u22D8",
  "ll": "\u226A",
  "llarr": "\u21C7",
  "llcorner": "\u231E",
  "Lleftarrow": "\u21DA",
  "llhard": "\u296B",
  "lltri": "\u25FA",
  "Lmidot": "\u013F",
  "lmidot": "\u0140",
  "lmoust": "\u23B0",
  "lmoustache": "\u23B0",
  "lnap": "\u2A89",
  "lnapprox": "\u2A89",
  "lnE": "\u2268",
  "lne": "\u2A87",
  "lneq": "\u2A87",
  "lneqq": "\u2268",
  "lnsim": "\u22E6",
  "loang": "\u27EC",
  "loarr": "\u21FD",
  "lobrk": "\u27E6",
  "LongLeftArrow": "\u27F5",
  "Longleftarrow": "\u27F8",
  "longleftarrow": "\u27F5",
  "LongLeftRightArrow": "\u27F7",
  "Longleftrightarrow": "\u27FA",
  "longleftrightarrow": "\u27F7",
  "longmapsto": "\u27FC",
  "LongRightArrow": "\u27F6",
  "Longrightarrow": "\u27F9",
  "longrightarrow": "\u27F6",
  "looparrowleft": "\u21AB",
  "looparrowright": "\u21AC",
  "lopar": "\u2985",
  "Lopf": "\uD835\uDD43",
  "lopf": "\uD835\uDD5D",
  "loplus": "\u2A2D",
  "lotimes": "\u2A34",
  "lowast": "\u2217",
  "lowbar": "\u005F",
  "LowerLeftArrow": "\u2199",
  "LowerRightArrow": "\u2198",
  "loz": "\u25CA",
  "lozenge": "\u25CA",
  "lozf": "\u29EB",
  "lpar": "\u0028",
  "lparlt": "\u2993",
  "lrarr": "\u21C6",
  "lrcorner": "\u231F",
  "lrhar": "\u21CB",
  "lrhard": "\u296D",
  "lrm": "\u200E",
  "lrtri": "\u22BF",
  "lsaquo": "\u2039",
  "Lscr": "\u2112",
  "lscr": "\uD835\uDCC1",
  "Lsh": "\u21B0",
  "lsh": "\u21B0",
  "lsim": "\u2272",
  "lsime": "\u2A8D",
  "lsimg": "\u2A8F",
  "lsqb": "\u005B",
  "lsquo": "\u2018",
  "lsquor": "\u201A",
  "Lstrok": "\u0141",
  "lstrok": "\u0142",
  "LT": "\u003C",
  "Lt": "\u226A",
  "lt": "\u003C",
  "ltcc": "\u2AA6",
  "ltcir": "\u2A79",
  "ltdot": "\u22D6",
  "lthree": "\u22CB",
  "ltimes": "\u22C9",
  "ltlarr": "\u2976",
  "ltquest": "\u2A7B",
  "ltri": "\u25C3",
  "ltrie": "\u22B4",
  "ltrif": "\u25C2",
  "ltrPar": "\u2996",
  "lurdshar": "\u294A",
  "luruhar": "\u2966",
  "lvertneqq": "\u2268\uFE00",
  "lvnE": "\u2268\uFE00",
  "macr": "\u00AF",
  "male": "\u2642",
  "malt": "\u2720",
  "maltese": "\u2720",
  "Map": "\u2905",
  "map": "\u21A6",
  "mapsto": "\u21A6",
  "mapstodown": "\u21A7",
  "mapstoleft": "\u21A4",
  "mapstoup": "\u21A5",
  "marker": "\u25AE",
  "mcomma": "\u2A29",
  "Mcy": "\u041C",
  "mcy": "\u043C",
  "mdash": "\u2014",
  "mDDot": "\u223A",
  "measuredangle": "\u2221",
  "MediumSpace": "\u205F",
  "Mellintrf": "\u2133",
  "Mfr": "\uD835\uDD10",
  "mfr": "\uD835\uDD2A",
  "mho": "\u2127",
  "micro": "\u00B5",
  "mid": "\u2223",
  "midast": "\u002A",
  "midcir": "\u2AF0",
  "middot": "\u00B7",
  "minus": "\u2212",
  "minusb": "\u229F",
  "minusd": "\u2238",
  "minusdu": "\u2A2A",
  "MinusPlus": "\u2213",
  "mlcp": "\u2ADB",
  "mldr": "\u2026",
  "mnplus": "\u2213",
  "models": "\u22A7",
  "Mopf": "\uD835\uDD44",
  "mopf": "\uD835\uDD5E",
  "mp": "\u2213",
  "Mscr": "\u2133",
  "mscr": "\uD835\uDCC2",
  "mstpos": "\u223E",
  "Mu": "\u039C",
  "mu": "\u03BC",
  "multimap": "\u22B8",
  "mumap": "\u22B8",
  "nabla": "\u2207",
  "Nacute": "\u0143",
  "nacute": "\u0144",
  "nang": "\u2220\u20D2",
  "nap": "\u2249",
  "napE": "\u2A70\u0338",
  "napid": "\u224B\u0338",
  "napos": "\u0149",
  "napprox": "\u2249",
  "natur": "\u266E",
  "natural": "\u266E",
  "naturals": "\u2115",
  "nbsp": "\u00A0",
  "nbump": "\u224E\u0338",
  "nbumpe": "\u224F\u0338",
  "ncap": "\u2A43",
  "Ncaron": "\u0147",
  "ncaron": "\u0148",
  "Ncedil": "\u0145",
  "ncedil": "\u0146",
  "ncong": "\u2247",
  "ncongdot": "\u2A6D\u0338",
  "ncup": "\u2A42",
  "Ncy": "\u041D",
  "ncy": "\u043D",
  "ndash": "\u2013",
  "ne": "\u2260",
  "nearhk": "\u2924",
  "neArr": "\u21D7",
  "nearr": "\u2197",
  "nearrow": "\u2197",
  "nedot": "\u2250\u0338",
  "NegativeMediumSpace": "\u200B",
  "NegativeThickSpace": "\u200B",
  "NegativeThinSpace": "\u200B",
  "NegativeVeryThinSpace": "\u200B",
  "nequiv": "\u2262",
  "nesear": "\u2928",
  "nesim": "\u2242\u0338",
  "NestedGreaterGreater": "\u226B",
  "NestedLessLess": "\u226A",
  "NewLine": "\u000A",
  "nexist": "\u2204",
  "nexists": "\u2204",
  "Nfr": "\uD835\uDD11",
  "nfr": "\uD835\uDD2B",
  "ngE": "\u2267\u0338",
  "nge": "\u2271",
  "ngeq": "\u2271",
  "ngeqq": "\u2267\u0338",
  "ngeqslant": "\u2A7E\u0338",
  "nges": "\u2A7E\u0338",
  "nGg": "\u22D9\u0338",
  "ngsim": "\u2275",
  "nGt": "\u226B\u20D2",
  "ngt": "\u226F",
  "ngtr": "\u226F",
  "nGtv": "\u226B\u0338",
  "nhArr": "\u21CE",
  "nharr": "\u21AE",
  "nhpar": "\u2AF2",
  "ni": "\u220B",
  "nis": "\u22FC",
  "nisd": "\u22FA",
  "niv": "\u220B",
  "NJcy": "\u040A",
  "njcy": "\u045A",
  "nlArr": "\u21CD",
  "nlarr": "\u219A",
  "nldr": "\u2025",
  "nlE": "\u2266\u0338",
  "nle": "\u2270",
  "nLeftarrow": "\u21CD",
  "nleftarrow": "\u219A",
  "nLeftrightarrow": "\u21CE",
  "nleftrightarrow": "\u21AE",
  "nleq": "\u2270",
  "nleqq": "\u2266\u0338",
  "nleqslant": "\u2A7D\u0338",
  "nles": "\u2A7D\u0338",
  "nless": "\u226E",
  "nLl": "\u22D8\u0338",
  "nlsim": "\u2274",
  "nLt": "\u226A\u20D2",
  "nlt": "\u226E",
  "nltri": "\u22EA",
  "nltrie": "\u22EC",
  "nLtv": "\u226A\u0338",
  "nmid": "\u2224",
  "NoBreak": "\u2060",
  "NonBreakingSpace": "\u00A0",
  "Nopf": "\u2115",
  "nopf": "\uD835\uDD5F",
  "Not": "\u2AEC",
  "not": "\u00AC",
  "NotCongruent": "\u2262",
  "NotCupCap": "\u226D",
  "NotDoubleVerticalBar": "\u2226",
  "NotElement": "\u2209",
  "NotEqual": "\u2260",
  "NotEqualTilde": "\u2242\u0338",
  "NotExists": "\u2204",
  "NotGreater": "\u226F",
  "NotGreaterEqual": "\u2271",
  "NotGreaterFullEqual": "\u2267\u0338",
  "NotGreaterGreater": "\u226B\u0338",
  "NotGreaterLess": "\u2279",
  "NotGreaterSlantEqual": "\u2A7E\u0338",
  "NotGreaterTilde": "\u2275",
  "NotHumpDownHump": "\u224E\u0338",
  "NotHumpEqual": "\u224F\u0338",
  "notin": "\u2209",
  "notindot": "\u22F5\u0338",
  "notinE": "\u22F9\u0338",
  "notinva": "\u2209",
  "notinvb": "\u22F7",
  "notinvc": "\u22F6",
  "NotLeftTriangle": "\u22EA",
  "NotLeftTriangleBar": "\u29CF\u0338",
  "NotLeftTriangleEqual": "\u22EC",
  "NotLess": "\u226E",
  "NotLessEqual": "\u2270",
  "NotLessGreater": "\u2278",
  "NotLessLess": "\u226A\u0338",
  "NotLessSlantEqual": "\u2A7D\u0338",
  "NotLessTilde": "\u2274",
  "NotNestedGreaterGreater": "\u2AA2\u0338",
  "NotNestedLessLess": "\u2AA1\u0338",
  "notni": "\u220C",
  "notniva": "\u220C",
  "notnivb": "\u22FE",
  "notnivc": "\u22FD",
  "NotPrecedes": "\u2280",
  "NotPrecedesEqual": "\u2AAF\u0338",
  "NotPrecedesSlantEqual": "\u22E0",
  "NotReverseElement": "\u220C",
  "NotRightTriangle": "\u22EB",
  "NotRightTriangleBar": "\u29D0\u0338",
  "NotRightTriangleEqual": "\u22ED",
  "NotSquareSubset": "\u228F\u0338",
  "NotSquareSubsetEqual": "\u22E2",
  "NotSquareSuperset": "\u2290\u0338",
  "NotSquareSupersetEqual": "\u22E3",
  "NotSubset": "\u2282\u20D2",
  "NotSubsetEqual": "\u2288",
  "NotSucceeds": "\u2281",
  "NotSucceedsEqual": "\u2AB0\u0338",
  "NotSucceedsSlantEqual": "\u22E1",
  "NotSucceedsTilde": "\u227F\u0338",
  "NotSuperset": "\u2283\u20D2",
  "NotSupersetEqual": "\u2289",
  "NotTilde": "\u2241",
  "NotTildeEqual": "\u2244",
  "NotTildeFullEqual": "\u2247",
  "NotTildeTilde": "\u2249",
  "NotVerticalBar": "\u2224",
  "npar": "\u2226",
  "nparallel": "\u2226",
  "nparsl": "\u2AFD\u20E5",
  "npart": "\u2202\u0338",
  "npolint": "\u2A14",
  "npr": "\u2280",
  "nprcue": "\u22E0",
  "npre": "\u2AAF\u0338",
  "nprec": "\u2280",
  "npreceq": "\u2AAF\u0338",
  "nrArr": "\u21CF",
  "nrarr": "\u219B",
  "nrarrc": "\u2933\u0338",
  "nrarrw": "\u219D\u0338",
  "nRightarrow": "\u21CF",
  "nrightarrow": "\u219B",
  "nrtri": "\u22EB",
  "nrtrie": "\u22ED",
  "nsc": "\u2281",
  "nsccue": "\u22E1",
  "nsce": "\u2AB0\u0338",
  "Nscr": "\uD835\uDCA9",
  "nscr": "\uD835\uDCC3",
  "nshortmid": "\u2224",
  "nshortparallel": "\u2226",
  "nsim": "\u2241",
  "nsime": "\u2244",
  "nsimeq": "\u2244",
  "nsmid": "\u2224",
  "nspar": "\u2226",
  "nsqsube": "\u22E2",
  "nsqsupe": "\u22E3",
  "nsub": "\u2284",
  "nsubE": "\u2AC5\u0338",
  "nsube": "\u2288",
  "nsubset": "\u2282\u20D2",
  "nsubseteq": "\u2288",
  "nsubseteqq": "\u2AC5\u0338",
  "nsucc": "\u2281",
  "nsucceq": "\u2AB0\u0338",
  "nsup": "\u2285",
  "nsupE": "\u2AC6\u0338",
  "nsupe": "\u2289",
  "nsupset": "\u2283\u20D2",
  "nsupseteq": "\u2289",
  "nsupseteqq": "\u2AC6\u0338",
  "ntgl": "\u2279",
  "Ntilde": "\u00D1",
  "ntilde": "\u00F1",
  "ntlg": "\u2278",
  "ntriangleleft": "\u22EA",
  "ntrianglelefteq": "\u22EC",
  "ntriangleright": "\u22EB",
  "ntrianglerighteq": "\u22ED",
  "Nu": "\u039D",
  "nu": "\u03BD",
  "num": "\u0023",
  "numero": "\u2116",
  "numsp": "\u2007",
  "nvap": "\u224D\u20D2",
  "nVDash": "\u22AF",
  "nVdash": "\u22AE",
  "nvDash": "\u22AD",
  "nvdash": "\u22AC",
  "nvge": "\u2265\u20D2",
  "nvgt": "\u003E\u20D2",
  "nvHarr": "\u2904",
  "nvinfin": "\u29DE",
  "nvlArr": "\u2902",
  "nvle": "\u2264\u20D2",
  "nvlt": "\u003C\u20D2",
  "nvltrie": "\u22B4\u20D2",
  "nvrArr": "\u2903",
  "nvrtrie": "\u22B5\u20D2",
  "nvsim": "\u223C\u20D2",
  "nwarhk": "\u2923",
  "nwArr": "\u21D6",
  "nwarr": "\u2196",
  "nwarrow": "\u2196",
  "nwnear": "\u2927",
  "Oacute": "\u00D3",
  "oacute": "\u00F3",
  "oast": "\u229B",
  "ocir": "\u229A",
  "Ocirc": "\u00D4",
  "ocirc": "\u00F4",
  "Ocy": "\u041E",
  "ocy": "\u043E",
  "odash": "\u229D",
  "Odblac": "\u0150",
  "odblac": "\u0151",
  "odiv": "\u2A38",
  "odot": "\u2299",
  "odsold": "\u29BC",
  "OElig": "\u0152",
  "oelig": "\u0153",
  "ofcir": "\u29BF",
  "Ofr": "\uD835\uDD12",
  "ofr": "\uD835\uDD2C",
  "ogon": "\u02DB",
  "Ograve": "\u00D2",
  "ograve": "\u00F2",
  "ogt": "\u29C1",
  "ohbar": "\u29B5",
  "ohm": "\u03A9",
  "oint": "\u222E",
  "olarr": "\u21BA",
  "olcir": "\u29BE",
  "olcross": "\u29BB",
  "oline": "\u203E",
  "olt": "\u29C0",
  "Omacr": "\u014C",
  "omacr": "\u014D",
  "Omega": "\u03A9",
  "omega": "\u03C9",
  "Omicron": "\u039F",
  "omicron": "\u03BF",
  "omid": "\u29B6",
  "ominus": "\u2296",
  "Oopf": "\uD835\uDD46",
  "oopf": "\uD835\uDD60",
  "opar": "\u29B7",
  "OpenCurlyDoubleQuote": "\u201C",
  "OpenCurlyQuote": "\u2018",
  "operp": "\u29B9",
  "oplus": "\u2295",
  "Or": "\u2A54",
  "or": "\u2228",
  "orarr": "\u21BB",
  "ord": "\u2A5D",
  "order": "\u2134",
  "orderof": "\u2134",
  "ordf": "\u00AA",
  "ordm": "\u00BA",
  "origof": "\u22B6",
  "oror": "\u2A56",
  "orslope": "\u2A57",
  "orv": "\u2A5B",
  "oS": "\u24C8",
  "Oscr": "\uD835\uDCAA",
  "oscr": "\u2134",
  "Oslash": "\u00D8",
  "oslash": "\u00F8",
  "osol": "\u2298",
  "Otilde": "\u00D5",
  "otilde": "\u00F5",
  "Otimes": "\u2A37",
  "otimes": "\u2297",
  "otimesas": "\u2A36",
  "Ouml": "\u00D6",
  "ouml": "\u00F6",
  "ovbar": "\u233D",
  "OverBar": "\u203E",
  "OverBrace": "\u23DE",
  "OverBracket": "\u23B4",
  "OverParenthesis": "\u23DC",
  "par": "\u2225",
  "para": "\u00B6",
  "parallel": "\u2225",
  "parsim": "\u2AF3",
  "parsl": "\u2AFD",
  "part": "\u2202",
  "PartialD": "\u2202",
  "Pcy": "\u041F",
  "pcy": "\u043F",
  "percnt": "\u0025",
  "period": "\u002E",
  "permil": "\u2030",
  "perp": "\u22A5",
  "pertenk": "\u2031",
  "Pfr": "\uD835\uDD13",
  "pfr": "\uD835\uDD2D",
  "Phi": "\u03A6",
  "phi": "\u03C6",
  "phiv": "\u03D5",
  "phmmat": "\u2133",
  "phone": "\u260E",
  "Pi": "\u03A0",
  "pi": "\u03C0",
  "pitchfork": "\u22D4",
  "piv": "\u03D6",
  "planck": "\u210F",
  "planckh": "\u210E",
  "plankv": "\u210F",
  "plus": "\u002B",
  "plusacir": "\u2A23",
  "plusb": "\u229E",
  "pluscir": "\u2A22",
  "plusdo": "\u2214",
  "plusdu": "\u2A25",
  "pluse": "\u2A72",
  "PlusMinus": "\u00B1",
  "plusmn": "\u00B1",
  "plussim": "\u2A26",
  "plustwo": "\u2A27",
  "pm": "\u00B1",
  "Poincareplane": "\u210C",
  "pointint": "\u2A15",
  "Popf": "\u2119",
  "popf": "\uD835\uDD61",
  "pound": "\u00A3",
  "Pr": "\u2ABB",
  "pr": "\u227A",
  "prap": "\u2AB7",
  "prcue": "\u227C",
  "prE": "\u2AB3",
  "pre": "\u2AAF",
  "prec": "\u227A",
  "precapprox": "\u2AB7",
  "preccurlyeq": "\u227C",
  "Precedes": "\u227A",
  "PrecedesEqual": "\u2AAF",
  "PrecedesSlantEqual": "\u227C",
  "PrecedesTilde": "\u227E",
  "preceq": "\u2AAF",
  "precnapprox": "\u2AB9",
  "precneqq": "\u2AB5",
  "precnsim": "\u22E8",
  "precsim": "\u227E",
  "Prime": "\u2033",
  "prime": "\u2032",
  "primes": "\u2119",
  "prnap": "\u2AB9",
  "prnE": "\u2AB5",
  "prnsim": "\u22E8",
  "prod": "\u220F",
  "Product": "\u220F",
  "profalar": "\u232E",
  "profline": "\u2312",
  "profsurf": "\u2313",
  "prop": "\u221D",
  "Proportion": "\u2237",
  "Proportional": "\u221D",
  "propto": "\u221D",
  "prsim": "\u227E",
  "prurel": "\u22B0",
  "Pscr": "\uD835\uDCAB",
  "pscr": "\uD835\uDCC5",
  "Psi": "\u03A8",
  "psi": "\u03C8",
  "puncsp": "\u2008",
  "Qfr": "\uD835\uDD14",
  "qfr": "\uD835\uDD2E",
  "qint": "\u2A0C",
  "Qopf": "\u211A",
  "qopf": "\uD835\uDD62",
  "qprime": "\u2057",
  "Qscr": "\uD835\uDCAC",
  "qscr": "\uD835\uDCC6",
  "quaternions": "\u210D",
  "quatint": "\u2A16",
  "quest": "\u003F",
  "questeq": "\u225F",
  "QUOT": "\u0022",
  "quot": "\u0022",
  "rAarr": "\u21DB",
  "race": "\u223D\u0331",
  "Racute": "\u0154",
  "racute": "\u0155",
  "radic": "\u221A",
  "raemptyv": "\u29B3",
  "Rang": "\u27EB",
  "rang": "\u27E9",
  "rangd": "\u2992",
  "range": "\u29A5",
  "rangle": "\u27E9",
  "raquo": "\u00BB",
  "Rarr": "\u21A0",
  "rArr": "\u21D2",
  "rarr": "\u2192",
  "rarrap": "\u2975",
  "rarrb": "\u21E5",
  "rarrbfs": "\u2920",
  "rarrc": "\u2933",
  "rarrfs": "\u291E",
  "rarrhk": "\u21AA",
  "rarrlp": "\u21AC",
  "rarrpl": "\u2945",
  "rarrsim": "\u2974",
  "Rarrtl": "\u2916",
  "rarrtl": "\u21A3",
  "rarrw": "\u219D",
  "rAtail": "\u291C",
  "ratail": "\u291A",
  "ratio": "\u2236",
  "rationals": "\u211A",
  "RBarr": "\u2910",
  "rBarr": "\u290F",
  "rbarr": "\u290D",
  "rbbrk": "\u2773",
  "rbrace": "\u007D",
  "rbrack": "\u005D",
  "rbrke": "\u298C",
  "rbrksld": "\u298E",
  "rbrkslu": "\u2990",
  "Rcaron": "\u0158",
  "rcaron": "\u0159",
  "Rcedil": "\u0156",
  "rcedil": "\u0157",
  "rceil": "\u2309",
  "rcub": "\u007D",
  "Rcy": "\u0420",
  "rcy": "\u0440",
  "rdca": "\u2937",
  "rdldhar": "\u2969",
  "rdquo": "\u201D",
  "rdquor": "\u201D",
  "rdsh": "\u21B3",
  "Re": "\u211C",
  "real": "\u211C",
  "realine": "\u211B",
  "realpart": "\u211C",
  "reals": "\u211D",
  "rect": "\u25AD",
  "REG": "\u00AE",
  "reg": "\u00AE",
  "ReverseElement": "\u220B",
  "ReverseEquilibrium": "\u21CB",
  "ReverseUpEquilibrium": "\u296F",
  "rfisht": "\u297D",
  "rfloor": "\u230B",
  "Rfr": "\u211C",
  "rfr": "\uD835\uDD2F",
  "rHar": "\u2964",
  "rhard": "\u21C1",
  "rharu": "\u21C0",
  "rharul": "\u296C",
  "Rho": "\u03A1",
  "rho": "\u03C1",
  "rhov": "\u03F1",
  "RightAngleBracket": "\u27E9",
  "RightArrow": "\u2192",
  "Rightarrow": "\u21D2",
  "rightarrow": "\u2192",
  "RightArrowBar": "\u21E5",
  "RightArrowLeftArrow": "\u21C4",
  "rightarrowtail": "\u21A3",
  "RightCeiling": "\u2309",
  "RightDoubleBracket": "\u27E7",
  "RightDownTeeVector": "\u295D",
  "RightDownVector": "\u21C2",
  "RightDownVectorBar": "\u2955",
  "RightFloor": "\u230B",
  "rightharpoondown": "\u21C1",
  "rightharpoonup": "\u21C0",
  "rightleftarrows": "\u21C4",
  "rightleftharpoons": "\u21CC",
  "rightrightarrows": "\u21C9",
  "rightsquigarrow": "\u219D",
  "RightTee": "\u22A2",
  "RightTeeArrow": "\u21A6",
  "RightTeeVector": "\u295B",
  "rightthreetimes": "\u22CC",
  "RightTriangle": "\u22B3",
  "RightTriangleBar": "\u29D0",
  "RightTriangleEqual": "\u22B5",
  "RightUpDownVector": "\u294F",
  "RightUpTeeVector": "\u295C",
  "RightUpVector": "\u21BE",
  "RightUpVectorBar": "\u2954",
  "RightVector": "\u21C0",
  "RightVectorBar": "\u2953",
  "ring": "\u02DA",
  "risingdotseq": "\u2253",
  "rlarr": "\u21C4",
  "rlhar": "\u21CC",
  "rlm": "\u200F",
  "rmoust": "\u23B1",
  "rmoustache": "\u23B1",
  "rnmid": "\u2AEE",
  "roang": "\u27ED",
  "roarr": "\u21FE",
  "robrk": "\u27E7",
  "ropar": "\u2986",
  "Ropf": "\u211D",
  "ropf": "\uD835\uDD63",
  "roplus": "\u2A2E",
  "rotimes": "\u2A35",
  "RoundImplies": "\u2970",
  "rpar": "\u0029",
  "rpargt": "\u2994",
  "rppolint": "\u2A12",
  "rrarr": "\u21C9",
  "Rrightarrow": "\u21DB",
  "rsaquo": "\u203A",
  "Rscr": "\u211B",
  "rscr": "\uD835\uDCC7",
  "Rsh": "\u21B1",
  "rsh": "\u21B1",
  "rsqb": "\u005D",
  "rsquo": "\u2019",
  "rsquor": "\u2019",
  "rthree": "\u22CC",
  "rtimes": "\u22CA",
  "rtri": "\u25B9",
  "rtrie": "\u22B5",
  "rtrif": "\u25B8",
  "rtriltri": "\u29CE",
  "RuleDelayed": "\u29F4",
  "ruluhar": "\u2968",
  "rx": "\u211E",
  "Sacute": "\u015A",
  "sacute": "\u015B",
  "sbquo": "\u201A",
  "Sc": "\u2ABC",
  "sc": "\u227B",
  "scap": "\u2AB8",
  "Scaron": "\u0160",
  "scaron": "\u0161",
  "sccue": "\u227D",
  "scE": "\u2AB4",
  "sce": "\u2AB0",
  "Scedil": "\u015E",
  "scedil": "\u015F",
  "Scirc": "\u015C",
  "scirc": "\u015D",
  "scnap": "\u2ABA",
  "scnE": "\u2AB6",
  "scnsim": "\u22E9",
  "scpolint": "\u2A13",
  "scsim": "\u227F",
  "Scy": "\u0421",
  "scy": "\u0441",
  "sdot": "\u22C5",
  "sdotb": "\u22A1",
  "sdote": "\u2A66",
  "searhk": "\u2925",
  "seArr": "\u21D8",
  "searr": "\u2198",
  "searrow": "\u2198",
  "sect": "\u00A7",
  "semi": "\u003B",
  "seswar": "\u2929",
  "setminus": "\u2216",
  "setmn": "\u2216",
  "sext": "\u2736",
  "Sfr": "\uD835\uDD16",
  "sfr": "\uD835\uDD30",
  "sfrown": "\u2322",
  "sharp": "\u266F",
  "SHCHcy": "\u0429",
  "shchcy": "\u0449",
  "SHcy": "\u0428",
  "shcy": "\u0448",
  "ShortDownArrow": "\u2193",
  "ShortLeftArrow": "\u2190",
  "shortmid": "\u2223",
  "shortparallel": "\u2225",
  "ShortRightArrow": "\u2192",
  "ShortUpArrow": "\u2191",
  "shy": "\u00AD",
  "Sigma": "\u03A3",
  "sigma": "\u03C3",
  "sigmaf": "\u03C2",
  "sigmav": "\u03C2",
  "sim": "\u223C",
  "simdot": "\u2A6A",
  "sime": "\u2243",
  "simeq": "\u2243",
  "simg": "\u2A9E",
  "simgE": "\u2AA0",
  "siml": "\u2A9D",
  "simlE": "\u2A9F",
  "simne": "\u2246",
  "simplus": "\u2A24",
  "simrarr": "\u2972",
  "slarr": "\u2190",
  "SmallCircle": "\u2218",
  "smallsetminus": "\u2216",
  "smashp": "\u2A33",
  "smeparsl": "\u29E4",
  "smid": "\u2223",
  "smile": "\u2323",
  "smt": "\u2AAA",
  "smte": "\u2AAC",
  "smtes": "\u2AAC\uFE00",
  "SOFTcy": "\u042C",
  "softcy": "\u044C",
  "sol": "\u002F",
  "solb": "\u29C4",
  "solbar": "\u233F",
  "Sopf": "\uD835\uDD4A",
  "sopf": "\uD835\uDD64",
  "spades": "\u2660",
  "spadesuit": "\u2660",
  "spar": "\u2225",
  "sqcap": "\u2293",
  "sqcaps": "\u2293\uFE00",
  "sqcup": "\u2294",
  "sqcups": "\u2294\uFE00",
  "Sqrt": "\u221A",
  "sqsub": "\u228F",
  "sqsube": "\u2291",
  "sqsubset": "\u228F",
  "sqsubseteq": "\u2291",
  "sqsup": "\u2290",
  "sqsupe": "\u2292",
  "sqsupset": "\u2290",
  "sqsupseteq": "\u2292",
  "squ": "\u25A1",
  "Square": "\u25A1",
  "square": "\u25A1",
  "SquareIntersection": "\u2293",
  "SquareSubset": "\u228F",
  "SquareSubsetEqual": "\u2291",
  "SquareSuperset": "\u2290",
  "SquareSupersetEqual": "\u2292",
  "SquareUnion": "\u2294",
  "squarf": "\u25AA",
  "squf": "\u25AA",
  "srarr": "\u2192",
  "Sscr": "\uD835\uDCAE",
  "sscr": "\uD835\uDCC8",
  "ssetmn": "\u2216",
  "ssmile": "\u2323",
  "sstarf": "\u22C6",
  "Star": "\u22C6",
  "star": "\u2606",
  "starf": "\u2605",
  "straightepsilon": "\u03F5",
  "straightphi": "\u03D5",
  "strns": "\u00AF",
  "Sub": "\u22D0",
  "sub": "\u2282",
  "subdot": "\u2ABD",
  "subE": "\u2AC5",
  "sube": "\u2286",
  "subedot": "\u2AC3",
  "submult": "\u2AC1",
  "subnE": "\u2ACB",
  "subne": "\u228A",
  "subplus": "\u2ABF",
  "subrarr": "\u2979",
  "Subset": "\u22D0",
  "subset": "\u2282",
  "subseteq": "\u2286",
  "subseteqq": "\u2AC5",
  "SubsetEqual": "\u2286",
  "subsetneq": "\u228A",
  "subsetneqq": "\u2ACB",
  "subsim": "\u2AC7",
  "subsub": "\u2AD5",
  "subsup": "\u2AD3",
  "succ": "\u227B",
  "succapprox": "\u2AB8",
  "succcurlyeq": "\u227D",
  "Succeeds": "\u227B",
  "SucceedsEqual": "\u2AB0",
  "SucceedsSlantEqual": "\u227D",
  "SucceedsTilde": "\u227F",
  "succeq": "\u2AB0",
  "succnapprox": "\u2ABA",
  "succneqq": "\u2AB6",
  "succnsim": "\u22E9",
  "succsim": "\u227F",
  "SuchThat": "\u220B",
  "Sum": "\u2211",
  "sum": "\u2211",
  "sung": "\u266A",
  "Sup": "\u22D1",
  "sup": "\u2283",
  "sup1": "\u00B9",
  "sup2": "\u00B2",
  "sup3": "\u00B3",
  "supdot": "\u2ABE",
  "supdsub": "\u2AD8",
  "supE": "\u2AC6",
  "supe": "\u2287",
  "supedot": "\u2AC4",
  "Superset": "\u2283",
  "SupersetEqual": "\u2287",
  "suphsol": "\u27C9",
  "suphsub": "\u2AD7",
  "suplarr": "\u297B",
  "supmult": "\u2AC2",
  "supnE": "\u2ACC",
  "supne": "\u228B",
  "supplus": "\u2AC0",
  "Supset": "\u22D1",
  "supset": "\u2283",
  "supseteq": "\u2287",
  "supseteqq": "\u2AC6",
  "supsetneq": "\u228B",
  "supsetneqq": "\u2ACC",
  "supsim": "\u2AC8",
  "supsub": "\u2AD4",
  "supsup": "\u2AD6",
  "swarhk": "\u2926",
  "swArr": "\u21D9",
  "swarr": "\u2199",
  "swarrow": "\u2199",
  "swnwar": "\u292A",
  "szlig": "\u00DF",
  "Tab": "\u0009",
  "target": "\u2316",
  "Tau": "\u03A4",
  "tau": "\u03C4",
  "tbrk": "\u23B4",
  "Tcaron": "\u0164",
  "tcaron": "\u0165",
  "Tcedil": "\u0162",
  "tcedil": "\u0163",
  "Tcy": "\u0422",
  "tcy": "\u0442",
  "tdot": "\u20DB",
  "telrec": "\u2315",
  "Tfr": "\uD835\uDD17",
  "tfr": "\uD835\uDD31",
  "there4": "\u2234",
  "Therefore": "\u2234",
  "therefore": "\u2234",
  "Theta": "\u0398",
  "theta": "\u03B8",
  "thetasym": "\u03D1",
  "thetav": "\u03D1",
  "thickapprox": "\u2248",
  "thicksim": "\u223C",
  "ThickSpace": "\u205F\u200A",
  "thinsp": "\u2009",
  "ThinSpace": "\u2009",
  "thkap": "\u2248",
  "thksim": "\u223C",
  "THORN": "\u00DE",
  "thorn": "\u00FE",
  "Tilde": "\u223C",
  "tilde": "\u02DC",
  "TildeEqual": "\u2243",
  "TildeFullEqual": "\u2245",
  "TildeTilde": "\u2248",
  "times": "\u00D7",
  "timesb": "\u22A0",
  "timesbar": "\u2A31",
  "timesd": "\u2A30",
  "tint": "\u222D",
  "toea": "\u2928",
  "top": "\u22A4",
  "topbot": "\u2336",
  "topcir": "\u2AF1",
  "Topf": "\uD835\uDD4B",
  "topf": "\uD835\uDD65",
  "topfork": "\u2ADA",
  "tosa": "\u2929",
  "tprime": "\u2034",
  "TRADE": "\u2122",
  "trade": "\u2122",
  "triangle": "\u25B5",
  "triangledown": "\u25BF",
  "triangleleft": "\u25C3",
  "trianglelefteq": "\u22B4",
  "triangleq": "\u225C",
  "triangleright": "\u25B9",
  "trianglerighteq": "\u22B5",
  "tridot": "\u25EC",
  "trie": "\u225C",
  "triminus": "\u2A3A",
  "TripleDot": "\u20DB",
  "triplus": "\u2A39",
  "trisb": "\u29CD",
  "tritime": "\u2A3B",
  "trpezium": "\u23E2",
  "Tscr": "\uD835\uDCAF",
  "tscr": "\uD835\uDCC9",
  "TScy": "\u0426",
  "tscy": "\u0446",
  "TSHcy": "\u040B",
  "tshcy": "\u045B",
  "Tstrok": "\u0166",
  "tstrok": "\u0167",
  "twixt": "\u226C",
  "twoheadleftarrow": "\u219E",
  "twoheadrightarrow": "\u21A0",
  "Uacute": "\u00DA",
  "uacute": "\u00FA",
  "Uarr": "\u219F",
  "uArr": "\u21D1",
  "uarr": "\u2191",
  "Uarrocir": "\u2949",
  "Ubrcy": "\u040E",
  "ubrcy": "\u045E",
  "Ubreve": "\u016C",
  "ubreve": "\u016D",
  "Ucirc": "\u00DB",
  "ucirc": "\u00FB",
  "Ucy": "\u0423",
  "ucy": "\u0443",
  "udarr": "\u21C5",
  "Udblac": "\u0170",
  "udblac": "\u0171",
  "udhar": "\u296E",
  "ufisht": "\u297E",
  "Ufr": "\uD835\uDD18",
  "ufr": "\uD835\uDD32",
  "Ugrave": "\u00D9",
  "ugrave": "\u00F9",
  "uHar": "\u2963",
  "uharl": "\u21BF",
  "uharr": "\u21BE",
  "uhblk": "\u2580",
  "ulcorn": "\u231C",
  "ulcorner": "\u231C",
  "ulcrop": "\u230F",
  "ultri": "\u25F8",
  "Umacr": "\u016A",
  "umacr": "\u016B",
  "uml": "\u00A8",
  "UnderBar": "\u005F",
  "UnderBrace": "\u23DF",
  "UnderBracket": "\u23B5",
  "UnderParenthesis": "\u23DD",
  "Union": "\u22C3",
  "UnionPlus": "\u228E",
  "Uogon": "\u0172",
  "uogon": "\u0173",
  "Uopf": "\uD835\uDD4C",
  "uopf": "\uD835\uDD66",
  "UpArrow": "\u2191",
  "Uparrow": "\u21D1",
  "uparrow": "\u2191",
  "UpArrowBar": "\u2912",
  "UpArrowDownArrow": "\u21C5",
  "UpDownArrow": "\u2195",
  "Updownarrow": "\u21D5",
  "updownarrow": "\u2195",
  "UpEquilibrium": "\u296E",
  "upharpoonleft": "\u21BF",
  "upharpoonright": "\u21BE",
  "uplus": "\u228E",
  "UpperLeftArrow": "\u2196",
  "UpperRightArrow": "\u2197",
  "Upsi": "\u03D2",
  "upsi": "\u03C5",
  "upsih": "\u03D2",
  "Upsilon": "\u03A5",
  "upsilon": "\u03C5",
  "UpTee": "\u22A5",
  "UpTeeArrow": "\u21A5",
  "upuparrows": "\u21C8",
  "urcorn": "\u231D",
  "urcorner": "\u231D",
  "urcrop": "\u230E",
  "Uring": "\u016E",
  "uring": "\u016F",
  "urtri": "\u25F9",
  "Uscr": "\uD835\uDCB0",
  "uscr": "\uD835\uDCCA",
  "utdot": "\u22F0",
  "Utilde": "\u0168",
  "utilde": "\u0169",
  "utri": "\u25B5",
  "utrif": "\u25B4",
  "uuarr": "\u21C8",
  "Uuml": "\u00DC",
  "uuml": "\u00FC",
  "uwangle": "\u29A7",
  "vangrt": "\u299C",
  "varepsilon": "\u03F5",
  "varkappa": "\u03F0",
  "varnothing": "\u2205",
  "varphi": "\u03D5",
  "varpi": "\u03D6",
  "varpropto": "\u221D",
  "vArr": "\u21D5",
  "varr": "\u2195",
  "varrho": "\u03F1",
  "varsigma": "\u03C2",
  "varsubsetneq": "\u228A\uFE00",
  "varsubsetneqq": "\u2ACB\uFE00",
  "varsupsetneq": "\u228B\uFE00",
  "varsupsetneqq": "\u2ACC\uFE00",
  "vartheta": "\u03D1",
  "vartriangleleft": "\u22B2",
  "vartriangleright": "\u22B3",
  "Vbar": "\u2AEB",
  "vBar": "\u2AE8",
  "vBarv": "\u2AE9",
  "Vcy": "\u0412",
  "vcy": "\u0432",
  "VDash": "\u22AB",
  "Vdash": "\u22A9",
  "vDash": "\u22A8",
  "vdash": "\u22A2",
  "Vdashl": "\u2AE6",
  "Vee": "\u22C1",
  "vee": "\u2228",
  "veebar": "\u22BB",
  "veeeq": "\u225A",
  "vellip": "\u22EE",
  "Verbar": "\u2016",
  "verbar": "\u007C",
  "Vert": "\u2016",
  "vert": "\u007C",
  "VerticalBar": "\u2223",
  "VerticalLine": "\u007C",
  "VerticalSeparator": "\u2758",
  "VerticalTilde": "\u2240",
  "VeryThinSpace": "\u200A",
  "Vfr": "\uD835\uDD19",
  "vfr": "\uD835\uDD33",
  "vltri": "\u22B2",
  "vnsub": "\u2282\u20D2",
  "vnsup": "\u2283\u20D2",
  "Vopf": "\uD835\uDD4D",
  "vopf": "\uD835\uDD67",
  "vprop": "\u221D",
  "vrtri": "\u22B3",
  "Vscr": "\uD835\uDCB1",
  "vscr": "\uD835\uDCCB",
  "vsubnE": "\u2ACB\uFE00",
  "vsubne": "\u228A\uFE00",
  "vsupnE": "\u2ACC\uFE00",
  "vsupne": "\u228B\uFE00",
  "Vvdash": "\u22AA",
  "vzigzag": "\u299A",
  "Wcirc": "\u0174",
  "wcirc": "\u0175",
  "wedbar": "\u2A5F",
  "Wedge": "\u22C0",
  "wedge": "\u2227",
  "wedgeq": "\u2259",
  "weierp": "\u2118",
  "Wfr": "\uD835\uDD1A",
  "wfr": "\uD835\uDD34",
  "Wopf": "\uD835\uDD4E",
  "wopf": "\uD835\uDD68",
  "wp": "\u2118",
  "wr": "\u2240",
  "wreath": "\u2240",
  "Wscr": "\uD835\uDCB2",
  "wscr": "\uD835\uDCCC",
  "xcap": "\u22C2",
  "xcirc": "\u25EF",
  "xcup": "\u22C3",
  "xdtri": "\u25BD",
  "Xfr": "\uD835\uDD1B",
  "xfr": "\uD835\uDD35",
  "xhArr": "\u27FA",
  "xharr": "\u27F7",
  "Xi": "\u039E",
  "xi": "\u03BE",
  "xlArr": "\u27F8",
  "xlarr": "\u27F5",
  "xmap": "\u27FC",
  "xnis": "\u22FB",
  "xodot": "\u2A00",
  "Xopf": "\uD835\uDD4F",
  "xopf": "\uD835\uDD69",
  "xoplus": "\u2A01",
  "xotime": "\u2A02",
  "xrArr": "\u27F9",
  "xrarr": "\u27F6",
  "Xscr": "\uD835\uDCB3",
  "xscr": "\uD835\uDCCD",
  "xsqcup": "\u2A06",
  "xuplus": "\u2A04",
  "xutri": "\u25B3",
  "xvee": "\u22C1",
  "xwedge": "\u22C0",
  "Yacute": "\u00DD",
  "yacute": "\u00FD",
  "YAcy": "\u042F",
  "yacy": "\u044F",
  "Ycirc": "\u0176",
  "ycirc": "\u0177",
  "Ycy": "\u042B",
  "ycy": "\u044B",
  "yen": "\u00A5",
  "Yfr": "\uD835\uDD1C",
  "yfr": "\uD835\uDD36",
  "YIcy": "\u0407",
  "yicy": "\u0457",
  "Yopf": "\uD835\uDD50",
  "yopf": "\uD835\uDD6A",
  "Yscr": "\uD835\uDCB4",
  "yscr": "\uD835\uDCCE",
  "YUcy": "\u042E",
  "yucy": "\u044E",
  "Yuml": "\u0178",
  "yuml": "\u00FF",
  "Zacute": "\u0179",
  "zacute": "\u017A",
  "Zcaron": "\u017D",
  "zcaron": "\u017E",
  "Zcy": "\u0417",
  "zcy": "\u0437",
  "Zdot": "\u017B",
  "zdot": "\u017C",
  "zeetrf": "\u2128",
  "ZeroWidthSpace": "\u200B",
  "Zeta": "\u0396",
  "zeta": "\u03B6",
  "Zfr": "\u2128",
  "zfr": "\uD835\uDD37",
  "ZHcy": "\u0416",
  "zhcy": "\u0436",
  "zigrarr": "\u21DD",
  "Zopf": "\u2124",
  "zopf": "\uD835\uDD6B",
  "Zscr": "\uD835\uDCB5",
  "zscr": "\uD835\uDCCF",
  "zwj": "\u200D",
  "zwnj": "\u200C"
};
var hasOwn = Object.prototype.hasOwnProperty;

function has(object, key) {
  return object ? hasOwn.call(object, key) : false;
}

function decodeEntity(name) {
  if (has(entities, name)) {
    return entities[name];
  } else {
    return name;
  }
}

var hasOwn$1 = Object.prototype.hasOwnProperty;

function has$1(object, key) {
  return object ? hasOwn$1.call(object, key) : false;
} // Extend objects
//


function assign(obj
/*from1, from2, from3, ...*/
) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    if (!source) {
      return;
    }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be object');
    }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });
  return obj;
} ////////////////////////////////////////////////////////////////////////////////


var UNESCAPE_MD_RE = /\\([\\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function unescapeMd(str) {
  if (str.indexOf('\\') < 0) {
    return str;
  }

  return str.replace(UNESCAPE_MD_RE, '$1');
} ////////////////////////////////////////////////////////////////////////////////


function isValidEntityCode(c) {
  /*eslint no-bitwise:0*/
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) {
    return false;
  } // never used


  if (c >= 0xFDD0 && c <= 0xFDEF) {
    return false;
  }

  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) {
    return false;
  } // control codes


  if (c >= 0x00 && c <= 0x08) {
    return false;
  }

  if (c === 0x0B) {
    return false;
  }

  if (c >= 0x0E && c <= 0x1F) {
    return false;
  }

  if (c >= 0x7F && c <= 0x9F) {
    return false;
  } // out of range


  if (c > 0x10FFFF) {
    return false;
  }

  return true;
}

function fromCodePoint(c) {
  /*eslint no-bitwise:0*/
  if (c > 0xffff) {
    c -= 0x10000;
    var surrogate1 = 0xd800 + (c >> 10),
        surrogate2 = 0xdc00 + (c & 0x3ff);
    return String.fromCharCode(surrogate1, surrogate2);
  }

  return String.fromCharCode(c);
}

var NAMED_ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

function replaceEntityPattern(match, name) {
  var code = 0;
  var decoded = decodeEntity(name);

  if (name !== decoded) {
    return decoded;
  } else if (name.charCodeAt(0) === 0x23
  /* # */
  && DIGITAL_ENTITY_TEST_RE.test(name)) {
    code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);

    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
  }

  return match;
}

function replaceEntities(str) {
  if (str.indexOf('&') < 0) {
    return str;
  }

  return str.replace(NAMED_ENTITY_RE, replaceEntityPattern);
} ////////////////////////////////////////////////////////////////////////////////


var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }

  return str;
}
/**
 * Renderer rules cache
 */

var rules = {};
/**
 * Blockquotes
 */

rules.blockquote_open = function
  /* tokens, idx, options, env */
() {
  return '<blockquote>\n';
};

rules.blockquote_close = function (tokens, idx
/*, options, env */
) {
  return '</blockquote>' + getBreak(tokens, idx);
};
/**
 * Code
 */


rules.code = function (tokens, idx
/*, options, env */
) {
  if (tokens[idx].block) {
    return '<pre><code>' + escapeHtml(tokens[idx].content) + '</code></pre>' + getBreak(tokens, idx);
  }

  return '<code>' + escapeHtml(tokens[idx].content) + '</code>';
};
/**
 * Fenced code blocks
 */


rules.fence = function (tokens, idx, options, env, instance) {
  var token = tokens[idx];
  var langClass = '';
  var langPrefix = options.langPrefix;
  var langName = '',
      fences,
      fenceName;
  var highlighted;

  if (token.params) {
    //
    // ```foo bar
    //
    // Try custom renderer "foo" first. That will simplify overwrite
    // for diagrams, latex, and any other fenced block with custom look
    //
    fences = token.params.split(/\s+/g);
    fenceName = fences.join(' ');

    if (has$1(instance.rules.fence_custom, fences[0])) {
      return instance.rules.fence_custom[fences[0]](tokens, idx, options, env, instance);
    }

    langName = escapeHtml(replaceEntities(unescapeMd(fenceName)));
    langClass = ' class="' + langPrefix + langName + '"';
  }

  if (options.highlight) {
    highlighted = options.highlight.apply(options.highlight, [token.content].concat(fences)) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return '<pre><code' + langClass + '>' + highlighted + '</code></pre>' + getBreak(tokens, idx);
};

rules.fence_custom = {};
/**
 * Headings
 */

rules.heading_open = function (tokens, idx
/*, options, env */
) {
  return '<h' + tokens[idx].hLevel + '>';
};

rules.heading_close = function (tokens, idx
/*, options, env */
) {
  return '</h' + tokens[idx].hLevel + '>\n';
};
/**
 * Horizontal rules
 */


rules.hr = function (tokens, idx, options
/*, env */
) {
  return (options.xhtmlOut ? '<hr />' : '<hr>') + getBreak(tokens, idx);
};
/**
 * Bullets
 */


rules.bullet_list_open = function
  /* tokens, idx, options, env */
() {
  return '<ul>\n';
};

rules.bullet_list_close = function (tokens, idx
/*, options, env */
) {
  return '</ul>' + getBreak(tokens, idx);
};
/**
 * List items
 */


rules.list_item_open = function
  /* tokens, idx, options, env */
() {
  return '<li>';
};

rules.list_item_close = function
  /* tokens, idx, options, env */
() {
  return '</li>\n';
};
/**
 * Ordered list items
 */


rules.ordered_list_open = function (tokens, idx
/*, options, env */
) {
  var token = tokens[idx];
  var order = token.order > 1 ? ' start="' + token.order + '"' : '';
  return '<ol' + order + '>\n';
};

rules.ordered_list_close = function (tokens, idx
/*, options, env */
) {
  return '</ol>' + getBreak(tokens, idx);
};
/**
 * Paragraphs
 */


rules.paragraph_open = function (tokens, idx
/*, options, env */
) {
  return tokens[idx].tight ? '' : '<p>';
};

rules.paragraph_close = function (tokens, idx
/*, options, env */
) {
  var addBreak = !(tokens[idx].tight && idx && tokens[idx - 1].type === 'inline' && !tokens[idx - 1].content);
  return (tokens[idx].tight ? '' : '</p>') + (addBreak ? getBreak(tokens, idx) : '');
};
/**
 * Links
 */


rules.link_open = function (tokens, idx, options
/* env */
) {
  var title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
  var target = options.linkTarget ? ' target="' + options.linkTarget + '"' : '';
  return '<a href="' + escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};

rules.link_close = function
  /* tokens, idx, options, env */
() {
  return '</a>';
};
/**
 * Images
 */


rules.image = function (tokens, idx, options
/*, env */
) {
  var src = ' src="' + escapeHtml(tokens[idx].src) + '"';
  var title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
  var alt = ' alt="' + (tokens[idx].alt ? escapeHtml(replaceEntities(unescapeMd(tokens[idx].alt))) : '') + '"';
  var suffix = options.xhtmlOut ? ' /' : '';
  return '<img' + src + alt + title + suffix + '>';
};
/**
 * Tables
 */


rules.table_open = function
  /* tokens, idx, options, env */
() {
  return '<table>\n';
};

rules.table_close = function
  /* tokens, idx, options, env */
() {
  return '</table>\n';
};

rules.thead_open = function
  /* tokens, idx, options, env */
() {
  return '<thead>\n';
};

rules.thead_close = function
  /* tokens, idx, options, env */
() {
  return '</thead>\n';
};

rules.tbody_open = function
  /* tokens, idx, options, env */
() {
  return '<tbody>\n';
};

rules.tbody_close = function
  /* tokens, idx, options, env */
() {
  return '</tbody>\n';
};

rules.tr_open = function
  /* tokens, idx, options, env */
() {
  return '<tr>';
};

rules.tr_close = function
  /* tokens, idx, options, env */
() {
  return '</tr>\n';
};

rules.th_open = function (tokens, idx
/*, options, env */
) {
  var token = tokens[idx];
  return '<th' + (token.align ? ' style="text-align:' + token.align + '"' : '') + '>';
};

rules.th_close = function
  /* tokens, idx, options, env */
() {
  return '</th>';
};

rules.td_open = function (tokens, idx
/*, options, env */
) {
  var token = tokens[idx];
  return '<td' + (token.align ? ' style="text-align:' + token.align + '"' : '') + '>';
};

rules.td_close = function
  /* tokens, idx, options, env */
() {
  return '</td>';
};
/**
 * Bold
 */


rules.strong_open = function
  /* tokens, idx, options, env */
() {
  return '<strong>';
};

rules.strong_close = function
  /* tokens, idx, options, env */
() {
  return '</strong>';
};
/**
 * Italicize
 */


rules.em_open = function
  /* tokens, idx, options, env */
() {
  return '<em>';
};

rules.em_close = function
  /* tokens, idx, options, env */
() {
  return '</em>';
};
/**
 * Strikethrough
 */


rules.del_open = function
  /* tokens, idx, options, env */
() {
  return '<del>';
};

rules.del_close = function
  /* tokens, idx, options, env */
() {
  return '</del>';
};
/**
 * Insert
 */


rules.ins_open = function
  /* tokens, idx, options, env */
() {
  return '<ins>';
};

rules.ins_close = function
  /* tokens, idx, options, env */
() {
  return '</ins>';
};
/**
 * Highlight
 */


rules.mark_open = function
  /* tokens, idx, options, env */
() {
  return '<mark>';
};

rules.mark_close = function
  /* tokens, idx, options, env */
() {
  return '</mark>';
};
/**
 * Super- and sub-script
 */


rules.sub = function (tokens, idx
/*, options, env */
) {
  return '<sub>' + escapeHtml(tokens[idx].content) + '</sub>';
};

rules.sup = function (tokens, idx
/*, options, env */
) {
  return '<sup>' + escapeHtml(tokens[idx].content) + '</sup>';
};
/**
 * Breaks
 */


rules.hardbreak = function (tokens, idx, options
/*, env */
) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};

rules.softbreak = function (tokens, idx, options
/*, env */
) {
  return options.breaks ? options.xhtmlOut ? '<br />\n' : '<br>\n' : '\n';
};
/**
 * Text
 */


rules.text = function (tokens, idx
/*, options, env */
) {
  return escapeHtml(tokens[idx].content);
};
/**
 * Content
 */


rules.htmlblock = function (tokens, idx
/*, options, env */
) {
  return tokens[idx].content;
};

rules.htmltag = function (tokens, idx
/*, options, env */
) {
  return tokens[idx].content;
};
/**
 * Abbreviations, initialism
 */


rules.abbr_open = function (tokens, idx
/*, options, env */
) {
  return '<abbr title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '">';
};

rules.abbr_close = function
  /* tokens, idx, options, env */
() {
  return '</abbr>';
};
/**
 * Footnotes
 */


rules.footnote_ref = function (tokens, idx) {
  var n = Number(tokens[idx].id + 1).toString();
  var id = 'fnref' + n;

  if (tokens[idx].subId > 0) {
    id += ':' + tokens[idx].subId;
  }

  return '<sup class="footnote-ref"><a href="#fn' + n + '" id="' + id + '">[' + n + ']</a></sup>';
};

rules.footnote_block_open = function (tokens, idx, options) {
  var hr = options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n';
  return hr + '<section class="footnotes">\n<ol class="footnotes-list">\n';
};

rules.footnote_block_close = function () {
  return '</ol>\n</section>\n';
};

rules.footnote_open = function (tokens, idx) {
  var id = Number(tokens[idx].id + 1).toString();
  return '<li id="fn' + id + '"  class="footnote-item">';
};

rules.footnote_close = function () {
  return '</li>\n';
};

rules.footnote_anchor = function (tokens, idx) {
  var n = Number(tokens[idx].id + 1).toString();
  var id = 'fnref' + n;

  if (tokens[idx].subId > 0) {
    id += ':' + tokens[idx].subId;
  }

  return ' <a href="#' + id + '" class="footnote-backref">↩</a>';
};
/**
 * Definition lists
 */


rules.dl_open = function () {
  return '<dl>\n';
};

rules.dt_open = function () {
  return '<dt>';
};

rules.dd_open = function () {
  return '<dd>';
};

rules.dl_close = function () {
  return '</dl>\n';
};

rules.dt_close = function () {
  return '</dt>\n';
};

rules.dd_close = function () {
  return '</dd>\n';
};
/**
 * Helper functions
 */


function nextToken(tokens, idx) {
  if (++idx >= tokens.length - 2) {
    return idx;
  }

  if (tokens[idx].type === 'paragraph_open' && tokens[idx].tight && tokens[idx + 1].type === 'inline' && tokens[idx + 1].content.length === 0 && tokens[idx + 2].type === 'paragraph_close' && tokens[idx + 2].tight) {
    return nextToken(tokens, idx + 2);
  }

  return idx;
}
/**
 * Check to see if `\n` is needed before the next token.
 *
 * @param  {Array} `tokens`
 * @param  {Number} `idx`
 * @return {String} Empty string or newline
 * @api private
 */


var getBreak = rules.getBreak = function getBreak(tokens, idx) {
  idx = nextToken(tokens, idx);

  if (idx < tokens.length && tokens[idx].type === 'list_item_close') {
    return '';
  }

  return '\n';
};
/**
 * Renderer class. Renders HTML and exposes `rules` to allow
 * local modifications.
 */


function Renderer() {
  this.rules = assign({}, rules); // exported helper, for custom rules only

  this.getBreak = rules.getBreak;
}
/**
 * Render a string of inline HTML with the given `tokens` and
 * `options`.
 *
 * @param  {Array} `tokens`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @return {String}
 * @api public
 */


Renderer.prototype.renderInline = function (tokens, options, env) {
  var _rules = this.rules;
  var len = tokens.length,
      i = 0;
  var result = '';

  while (len--) {
    result += _rules[tokens[i].type](tokens, i++, options, env, this);
  }

  return result;
};
/**
 * Render a string of HTML with the given `tokens` and
 * `options`.
 *
 * @param  {Array} `tokens`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @return {String}
 * @api public
 */


Renderer.prototype.render = function (tokens, options, env) {
  var _rules = this.rules;
  var len = tokens.length,
      i = -1;
  var result = '';

  while (++i < len) {
    if (tokens[i].type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else {
      result += _rules[tokens[i].type](tokens, i, options, env, this);
    }
  }

  return result;
};
/**
 * Ruler is a helper class for building responsibility chains from
 * parse rules. It allows:
 *
 *   - easy stack rules chains
 *   - getting main chain and named chains content (as arrays of functions)
 *
 * Helper methods, should not be used directly.
 * @api private
 */


function Ruler() {
  // List of added rules. Each element is:
  //
  // { name: XXX,
  //   enabled: Boolean,
  //   fn: Function(),
  //   alt: [ name2, name3 ] }
  //
  this.__rules__ = []; // Cached rule chains.
  //
  // First level - chain name, '' for default.
  // Second level - digital anchor for fast filtering by charcodes.
  //

  this.__cache__ = null;
}
/**
 * Find the index of a rule by `name`.
 *
 * @param  {String} `name`
 * @return {Number} Index of the given `name`
 * @api private
 */


Ruler.prototype.__find__ = function (name) {
  var len = this.__rules__.length;
  var i = -1;

  while (len--) {
    if (this.__rules__[++i].name === name) {
      return i;
    }
  }

  return -1;
};
/**
 * Build the rules lookup cache
 *
 * @api private
 */


Ruler.prototype.__compile__ = function () {
  var self = this;
  var chains = ['']; // collect unique names

  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) {
      return;
    }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });

  self.__cache__ = {};
  chains.forEach(function (chain) {
    self.__cache__[chain] = [];

    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) {
        return;
      }

      if (chain && rule.alt.indexOf(chain) < 0) {
        return;
      }

      self.__cache__[chain].push(rule.fn);
    });
  });
};
/**
 * Ruler public methods
 * ------------------------------------------------
 */

/**
 * Replace rule function
 *
 * @param  {String} `name` Rule name
 * @param  {Function `fn`
 * @param  {Object} `options`
 * @api private
 */


Ruler.prototype.at = function (name, fn, options) {
  var idx = this.__find__(name);

  var opt = options || {};

  if (idx === -1) {
    throw new Error('Parser rule not found: ' + name);
  }

  this.__rules__[idx].fn = fn;
  this.__rules__[idx].alt = opt.alt || [];
  this.__cache__ = null;
};
/**
 * Add a rule to the chain before given the `ruleName`.
 *
 * @param  {String}   `beforeName`
 * @param  {String}   `ruleName`
 * @param  {Function} `fn`
 * @param  {Object}   `options`
 * @api private
 */


Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
  var idx = this.__find__(beforeName);

  var opt = options || {};

  if (idx === -1) {
    throw new Error('Parser rule not found: ' + beforeName);
  }

  this.__rules__.splice(idx, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};
/**
 * Add a rule to the chain after the given `ruleName`.
 *
 * @param  {String}   `afterName`
 * @param  {String}   `ruleName`
 * @param  {Function} `fn`
 * @param  {Object}   `options`
 * @api private
 */


Ruler.prototype.after = function (afterName, ruleName, fn, options) {
  var idx = this.__find__(afterName);

  var opt = options || {};

  if (idx === -1) {
    throw new Error('Parser rule not found: ' + afterName);
  }

  this.__rules__.splice(idx + 1, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};
/**
 * Add a rule to the end of chain.
 *
 * @param  {String}   `ruleName`
 * @param  {Function} `fn`
 * @param  {Object}   `options`
 * @return {String}
 */


Ruler.prototype.push = function (ruleName, fn, options) {
  var opt = options || {};

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};
/**
 * Enable a rule or list of rules.
 *
 * @param  {String|Array} `list` Name or array of rule names to enable
 * @param  {Boolean} `strict` If `true`, all non listed rules will be disabled.
 * @api private
 */


Ruler.prototype.enable = function (list, strict) {
  list = !Array.isArray(list) ? [list] : list; // In strict mode disable all existing rules first

  if (strict) {
    this.__rules__.forEach(function (rule) {
      rule.enabled = false;
    });
  } // Search by name and enable


  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      throw new Error('Rules manager: invalid rule name ' + name);
    }

    this.__rules__[idx].enabled = true;
  }, this);
  this.__cache__ = null;
};
/**
 * Disable a rule or list of rules.
 *
 * @param  {String|Array} `list` Name or array of rule names to disable
 * @api private
 */


Ruler.prototype.disable = function (list) {
  list = !Array.isArray(list) ? [list] : list; // Search by name and disable

  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      throw new Error('Rules manager: invalid rule name ' + name);
    }

    this.__rules__[idx].enabled = false;
  }, this);
  this.__cache__ = null;
};
/**
 * Get a rules list as an array of functions.
 *
 * @param  {String} `chainName`
 * @return {Object}
 * @api private
 */


Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }

  return this.__cache__[chainName] || [];
};

function block(state) {
  if (state.inlineMode) {
    state.tokens.push({
      type: 'inline',
      content: state.src.replace(/\n/g, ' ').trim(),
      level: 0,
      lines: [0, 1],
      children: []
    });
  } else {
    state.block.parse(state.src, state.options, state.env, state.tokens);
  }
} // Inline parser state


function StateInline(src, parserInline, options, env, outTokens) {
  this.src = src;
  this.env = env;
  this.options = options;
  this.parser = parserInline;
  this.tokens = outTokens;
  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = '';
  this.pendingLevel = 0;
  this.cache = []; // Stores { start: end } pairs. Useful for backtrack
  // optimization of pairs parse (emphasis, strikes).
  // Link parser state vars

  this.isInLabel = false; // Set true when seek link label - we should disable
  // "paired" rules (emphasis, strikes) to not skip
  // tailing `]`

  this.linkLevel = 0; // Increment for each nesting link. Used to prevent
  // nesting in definitions

  this.linkContent = ''; // Temporary storage for link url

  this.labelUnmatchedScopes = 0; // Track unpaired `[` for link labels
  // (backtrack optimization)
} // Flush pending text
//


StateInline.prototype.pushPending = function () {
  this.tokens.push({
    type: 'text',
    content: this.pending,
    level: this.pendingLevel
  });
  this.pending = '';
}; // Push new token to "stream".
// If pending text exists - flush it as text token
//


StateInline.prototype.push = function (token) {
  if (this.pending) {
    this.pushPending();
  }

  this.tokens.push(token);
  this.pendingLevel = this.level;
}; // Store value to cache.
// !!! Implementation has parser-specific optimizations
// !!! keys MUST be integer, >= 0; values MUST be integer, > 0
//


StateInline.prototype.cacheSet = function (key, val) {
  for (var i = this.cache.length; i <= key; i++) {
    this.cache.push(0);
  }

  this.cache[key] = val;
}; // Get cache value
//


StateInline.prototype.cacheGet = function (key) {
  return key < this.cache.length ? this.cache[key] : 0;
};
/**
 * Parse link labels
 *
 * This function assumes that first character (`[`) already matches;
 * returns the end of the label.
 *
 * @param  {Object} state
 * @param  {Number} start
 * @api private
 */


function parseLinkLabel(state, start) {
  var level,
      found,
      marker,
      labelEnd = -1,
      max = state.posMax,
      oldPos = state.pos,
      oldFlag = state.isInLabel;

  if (state.isInLabel) {
    return -1;
  }

  if (state.labelUnmatchedScopes) {
    state.labelUnmatchedScopes--;
    return -1;
  }

  state.pos = start + 1;
  state.isInLabel = true;
  level = 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);

    if (marker === 0x5B
    /* [ */
    ) {
      level++;
    } else if (marker === 0x5D
    /* ] */
    ) {
      level--;

      if (level === 0) {
        found = true;
        break;
      }
    }

    state.parser.skipToken(state);
  }

  if (found) {
    labelEnd = state.pos;
    state.labelUnmatchedScopes = 0;
  } else {
    state.labelUnmatchedScopes = level - 1;
  } // restore old state


  state.pos = oldPos;
  state.isInLabel = oldFlag;
  return labelEnd;
} // Parse abbreviation definitions, i.e. `*[abbr]: description`


function parseAbbr(str, parserInline, options, env) {
  var state, labelEnd, pos, max, label, title;

  if (str.charCodeAt(0) !== 0x2A
  /* * */
  ) {
    return -1;
  }

  if (str.charCodeAt(1) !== 0x5B
  /* [ */
  ) {
    return -1;
  }

  if (str.indexOf(']:') === -1) {
    return -1;
  }

  state = new StateInline(str, parserInline, options, env, []);
  labelEnd = parseLinkLabel(state, 1);

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A
  /* : */
  ) {
    return -1;
  }

  max = state.posMax; // abbr title is always one line, so looking for ending "\n" here

  for (pos = labelEnd + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x0A) {
      break;
    }
  }

  label = str.slice(2, labelEnd);
  title = str.slice(labelEnd + 2, pos).trim();

  if (title.length === 0) {
    return -1;
  }

  if (!env.abbreviations) {
    env.abbreviations = {};
  } // prepend ':' to avoid conflict with Object.prototype members


  if (typeof env.abbreviations[':' + label] === 'undefined') {
    env.abbreviations[':' + label] = title;
  }

  return pos;
}

function abbr(state) {
  var tokens = state.tokens,
      i,
      l,
      content,
      pos;

  if (state.inlineMode) {
    return;
  } // Parse inlines


  for (i = 1, l = tokens.length - 1; i < l; i++) {
    if (tokens[i - 1].type === 'paragraph_open' && tokens[i].type === 'inline' && tokens[i + 1].type === 'paragraph_close') {
      content = tokens[i].content;

      while (content.length) {
        pos = parseAbbr(content, state.inline, state.options, state.env);

        if (pos < 0) {
          break;
        }

        content = content.slice(pos).trim();
      }

      tokens[i].content = content;

      if (!content.length) {
        tokens[i - 1].tight = true;
        tokens[i + 1].tight = true;
      }
    }
  }
}

function normalizeLink(url) {
  var normalized = replaceEntities(url); // We shouldn't care about the result of malformed URIs,
  // and should not throw an exception.

  try {
    normalized = decodeURI(normalized);
  } catch (err) {}

  return encodeURI(normalized);
}
/**
 * Parse link destination
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */


function parseLinkDestination(state, pos) {
  var code,
      level,
      link,
      start = pos,
      max = state.posMax;

  if (state.src.charCodeAt(pos) === 0x3C
  /* < */
  ) {
    pos++;

    while (pos < max) {
      code = state.src.charCodeAt(pos);

      if (code === 0x0A
      /* \n */
      ) {
        return false;
      }

      if (code === 0x3E
      /* > */
      ) {
        link = normalizeLink(unescapeMd(state.src.slice(start + 1, pos)));

        if (!state.parser.validateLink(link)) {
          return false;
        }

        state.pos = pos + 1;
        state.linkContent = link;
        return true;
      }

      if (code === 0x5C
      /* \ */
      && pos + 1 < max) {
        pos += 2;
        continue;
      }

      pos++;
    } // no closing '>'


    return false;
  } // this should be ... } else { ... branch


  level = 0;

  while (pos < max) {
    code = state.src.charCodeAt(pos);

    if (code === 0x20) {
      break;
    } // ascii control chars


    if (code < 0x20 || code === 0x7F) {
      break;
    }

    if (code === 0x5C
    /* \ */
    && pos + 1 < max) {
      pos += 2;
      continue;
    }

    if (code === 0x28
    /* ( */
    ) {
      level++;

      if (level > 1) {
        break;
      }
    }

    if (code === 0x29
    /* ) */
    ) {
      level--;

      if (level < 0) {
        break;
      }
    }

    pos++;
  }

  if (start === pos) {
    return false;
  }

  link = unescapeMd(state.src.slice(start, pos));

  if (!state.parser.validateLink(link)) {
    return false;
  }

  state.linkContent = link;
  state.pos = pos;
  return true;
}
/**
 * Parse link title
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */


function parseLinkTitle(state, pos) {
  var code,
      start = pos,
      max = state.posMax,
      marker = state.src.charCodeAt(pos);

  if (marker !== 0x22
  /* " */
  && marker !== 0x27
  /* ' */
  && marker !== 0x28
  /* ( */
  ) {
    return false;
  }

  pos++; // if opening marker is "(", switch it to closing marker ")"

  if (marker === 0x28) {
    marker = 0x29;
  }

  while (pos < max) {
    code = state.src.charCodeAt(pos);

    if (code === marker) {
      state.pos = pos + 1;
      state.linkContent = unescapeMd(state.src.slice(start + 1, pos));
      return true;
    }

    if (code === 0x5C
    /* \ */
    && pos + 1 < max) {
      pos += 2;
      continue;
    }

    pos++;
  }

  return false;
}

function normalizeReference(str) {
  // use .toUpperCase() instead of .toLowerCase()
  // here to avoid a conflict with Object.prototype
  // members (most notably, `__proto__`)
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
}

function parseReference(str, parser, options, env) {
  var state, labelEnd, pos, max, code, start, href, title, label;

  if (str.charCodeAt(0) !== 0x5B
  /* [ */
  ) {
    return -1;
  }

  if (str.indexOf(']:') === -1) {
    return -1;
  }

  state = new StateInline(str, parser, options, env, []);
  labelEnd = parseLinkLabel(state, 0);

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A
  /* : */
  ) {
    return -1;
  }

  max = state.posMax; // [label]:   destination   'title'
  //         ^^^ skip optional whitespace here

  for (pos = labelEnd + 2; pos < max; pos++) {
    code = state.src.charCodeAt(pos);

    if (code !== 0x20 && code !== 0x0A) {
      break;
    }
  } // [label]:   destination   'title'
  //            ^^^^^^^^^^^ parse this


  if (!parseLinkDestination(state, pos)) {
    return -1;
  }

  href = state.linkContent;
  pos = state.pos; // [label]:   destination   'title'
  //                       ^^^ skipping those spaces

  start = pos;

  for (pos = pos + 1; pos < max; pos++) {
    code = state.src.charCodeAt(pos);

    if (code !== 0x20 && code !== 0x0A) {
      break;
    }
  } // [label]:   destination   'title'
  //                          ^^^^^^^ parse this


  if (pos < max && start !== pos && parseLinkTitle(state, pos)) {
    title = state.linkContent;
    pos = state.pos;
  } else {
    title = '';
    pos = start;
  } // ensure that the end of the line is empty


  while (pos < max && state.src.charCodeAt(pos) === 0x20
  /* space */
  ) {
    pos++;
  }

  if (pos < max && state.src.charCodeAt(pos) !== 0x0A) {
    return -1;
  }

  label = normalizeReference(str.slice(1, labelEnd));

  if (typeof env.references[label] === 'undefined') {
    env.references[label] = {
      title: title,
      href: href
    };
  }

  return pos;
}

function references(state) {
  var tokens = state.tokens,
      i,
      l,
      content,
      pos;
  state.env.references = state.env.references || {};

  if (state.inlineMode) {
    return;
  } // Scan definitions in paragraph inlines


  for (i = 1, l = tokens.length - 1; i < l; i++) {
    if (tokens[i].type === 'inline' && tokens[i - 1].type === 'paragraph_open' && tokens[i + 1].type === 'paragraph_close') {
      content = tokens[i].content;

      while (content.length) {
        pos = parseReference(content, state.inline, state.options, state.env);

        if (pos < 0) {
          break;
        }

        content = content.slice(pos).trim();
      }

      tokens[i].content = content;

      if (!content.length) {
        tokens[i - 1].tight = true;
        tokens[i + 1].tight = true;
      }
    }
  }
}

function inline(state) {
  var tokens = state.tokens,
      tok,
      i,
      l; // Parse inlines

  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];

    if (tok.type === 'inline') {
      state.inline.parse(tok.content, state.options, state.env, tok.children);
    }
  }
}

function footnote_block(state) {
  var i,
      l,
      j,
      t,
      lastParagraph,
      list,
      tokens,
      current,
      currentLabel,
      level = 0,
      insideRef = false,
      refTokens = {};

  if (!state.env.footnotes) {
    return;
  }

  state.tokens = state.tokens.filter(function (tok) {
    if (tok.type === 'footnote_reference_open') {
      insideRef = true;
      current = [];
      currentLabel = tok.label;
      return false;
    }

    if (tok.type === 'footnote_reference_close') {
      insideRef = false; // prepend ':' to avoid conflict with Object.prototype members

      refTokens[':' + currentLabel] = current;
      return false;
    }

    if (insideRef) {
      current.push(tok);
    }

    return !insideRef;
  });

  if (!state.env.footnotes.list) {
    return;
  }

  list = state.env.footnotes.list;
  state.tokens.push({
    type: 'footnote_block_open',
    level: level++
  });

  for (i = 0, l = list.length; i < l; i++) {
    state.tokens.push({
      type: 'footnote_open',
      id: i,
      level: level++
    });

    if (list[i].tokens) {
      tokens = [];
      tokens.push({
        type: 'paragraph_open',
        tight: false,
        level: level++
      });
      tokens.push({
        type: 'inline',
        content: '',
        level: level,
        children: list[i].tokens
      });
      tokens.push({
        type: 'paragraph_close',
        tight: false,
        level: --level
      });
    } else if (list[i].label) {
      tokens = refTokens[':' + list[i].label];
    }

    state.tokens = state.tokens.concat(tokens);

    if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
      lastParagraph = state.tokens.pop();
    } else {
      lastParagraph = null;
    }

    t = list[i].count > 0 ? list[i].count : 1;

    for (j = 0; j < t; j++) {
      state.tokens.push({
        type: 'footnote_anchor',
        id: i,
        subId: j,
        level: level
      });
    }

    if (lastParagraph) {
      state.tokens.push(lastParagraph);
    }

    state.tokens.push({
      type: 'footnote_close',
      level: --level
    });
  }

  state.tokens.push({
    type: 'footnote_block_close',
    level: --level
  });
} // Enclose abbreviations in <abbr> tags
//


var PUNCT_CHARS = ' \n()[]\'".,!?-'; // from Google closure library
// http://closure-library.googlecode.com/git-history/docs/local_closure_goog_string_string.js.source.html#line1021

function regEscape(s) {
  return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1');
}

function abbr2(state) {
  var i,
      j,
      l,
      tokens,
      token,
      text,
      nodes,
      pos,
      level,
      reg,
      m,
      regText,
      blockTokens = state.tokens;

  if (!state.env.abbreviations) {
    return;
  }

  if (!state.env.abbrRegExp) {
    regText = '(^|[' + PUNCT_CHARS.split('').map(regEscape).join('') + '])' + '(' + Object.keys(state.env.abbreviations).map(function (x) {
      return x.substr(1);
    }).sort(function (a, b) {
      return b.length - a.length;
    }).map(regEscape).join('|') + ')' + '($|[' + PUNCT_CHARS.split('').map(regEscape).join('') + '])';
    state.env.abbrRegExp = new RegExp(regText, 'g');
  }

  reg = state.env.abbrRegExp;

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline') {
      continue;
    }

    tokens = blockTokens[j].children; // We scan from the end, to keep position when new tags added.

    for (i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];

      if (token.type !== 'text') {
        continue;
      }

      pos = 0;
      text = token.content;
      reg.lastIndex = 0;
      level = token.level;
      nodes = [];

      while (m = reg.exec(text)) {
        if (reg.lastIndex > pos) {
          nodes.push({
            type: 'text',
            content: text.slice(pos, m.index + m[1].length),
            level: level
          });
        }

        nodes.push({
          type: 'abbr_open',
          title: state.env.abbreviations[':' + m[2]],
          level: level++
        });
        nodes.push({
          type: 'text',
          content: m[2],
          level: level
        });
        nodes.push({
          type: 'abbr_close',
          level: --level
        });
        pos = reg.lastIndex - m[3].length;
      }

      if (!nodes.length) {
        continue;
      }

      if (pos < text.length) {
        nodes.push({
          type: 'text',
          content: text.slice(pos),
          level: level
        });
      } // replace current node


      blockTokens[j].children = tokens = [].concat(tokens.slice(0, i), nodes, tokens.slice(i + 1));
    }
  }
} // Simple typographical replacements
//
// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4


var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  'c': '©',
  'r': '®',
  'p': '§',
  'tm': '™'
};

function replaceScopedAbbr(str) {
  if (str.indexOf('(') < 0) {
    return str;
  }

  return str.replace(SCOPED_ABBR_RE, function (match, name) {
    return SCOPED_ABBR[name.toLowerCase()];
  });
}

function replace(state) {
  var i, token, text, inlineTokens, blkIdx;

  if (!state.options.typographer) {
    return;
  }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== 'inline') {
      continue;
    }

    inlineTokens = state.tokens[blkIdx].children;

    for (i = inlineTokens.length - 1; i >= 0; i--) {
      token = inlineTokens[i];

      if (token.type === 'text') {
        text = token.content;
        text = replaceScopedAbbr(text);

        if (RARE_RE.test(text)) {
          text = text.replace(/\+-/g, '±') // .., ..., ....... -> …
          // but ?..... & !..... -> ?.. & !..
          .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..').replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',') // em-dash
          .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2') // en-dash
          .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2').replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
        }

        token.content = text;
      }
    }
  }
} // Convert straight quotation marks to typographic ones
//


var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var PUNCT_RE = /[-\s()\[\]]/;
var APOSTROPHE = '’'; // This function returns true if the character at `pos`
// could be inside a word.

function isLetter(str, pos) {
  if (pos < 0 || pos >= str.length) {
    return false;
  }

  return !PUNCT_RE.test(str[pos]);
}

function replaceAt(str, index, ch) {
  return str.substr(0, index) + ch + str.substr(index + 1);
}

function smartquotes(state) {
  /*eslint max-depth:0*/
  var i, token, text, t, pos, max, thisLevel, lastSpace, nextSpace, item, canOpen, canClose, j, isSingle, blkIdx, tokens, stack;

  if (!state.options.typographer) {
    return;
  }

  stack = [];

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== 'inline') {
      continue;
    }

    tokens = state.tokens[blkIdx].children;
    stack.length = 0;

    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      if (token.type !== 'text' || QUOTE_TEST_RE.test(token.text)) {
        continue;
      }

      thisLevel = tokens[i].level;

      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) {
          break;
        }
      }

      stack.length = j + 1;
      text = token.content;
      pos = 0;
      max = text.length;
      /*eslint no-labels:0,block-scoped-var:0*/

      OUTER: while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        t = QUOTE_RE.exec(text);

        if (!t) {
          break;
        }

        lastSpace = !isLetter(text, t.index - 1);
        pos = t.index + 1;
        isSingle = t[0] === "'";
        nextSpace = !isLetter(text, pos);

        if (!nextSpace && !lastSpace) {
          // middle of word
          if (isSingle) {
            token.content = replaceAt(token.content, t.index, APOSTROPHE);
          }

          continue;
        }

        canOpen = !nextSpace;
        canClose = !lastSpace;

        if (canClose) {
          // this could be a closing quote, rewind the stack to get a match
          for (j = stack.length - 1; j >= 0; j--) {
            item = stack[j];

            if (stack[j].level < thisLevel) {
              break;
            }

            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];

              if (isSingle) {
                tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, state.options.quotes[2]);
                token.content = replaceAt(token.content, t.index, state.options.quotes[3]);
              } else {
                tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, state.options.quotes[0]);
                token.content = replaceAt(token.content, t.index, state.options.quotes[1]);
              }

              stack.length = j;
              continue OUTER;
            }
          }
        }

        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
      }
    }
  }
}
/**
 * Core parser `rules`
 */


var _rules = [['block', block], ['abbr', abbr], ['references', references], ['inline', inline], ['footnote_tail', footnote_block], ['abbr2', abbr2], ['replacements', replace], ['smartquotes', smartquotes]];
/**
 * Class for top level (`core`) parser rules
 *
 * @api private
 */

function Core() {
  this.options = {};
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}
/**
 * Process rules with the given `state`
 *
 * @param  {Object} `state`
 * @api private
 */


Core.prototype.process = function (state) {
  var i, l, rules;
  rules = this.ruler.getRules('');

  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
}; // Parser state class


function StateBlock(src, parser, options, env, tokens) {
  var ch, s, start, pos, len, indent, indent_found;
  this.src = src; // Shortcuts to simplify nested calls

  this.parser = parser;
  this.options = options;
  this.env = env; //
  // Internal state vartiables
  //

  this.tokens = tokens;
  this.bMarks = []; // line begin offsets for fast jumps

  this.eMarks = []; // line end offsets for fast jumps

  this.tShift = []; // indent for each line
  // block parser variables

  this.blkIndent = 0; // required block content indent
  // (for example, if we are in list)

  this.line = 0; // line index in src

  this.lineMax = 0; // lines count

  this.tight = false; // loose/tight mode for lists

  this.parentType = 'root'; // if `list`, block parser stops on two newlines

  this.ddIndent = -1; // indent of the current dd block (-1 if there isn't any)

  this.level = 0; // renderer

  this.result = ''; // Create caches
  // Generate markers.

  s = this.src;
  indent = 0;
  indent_found = false;

  for (start = pos = indent = 0, len = s.length; pos < len; pos++) {
    ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (ch === 0x20
      /* space */
      ) {
        indent++;
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) {
        pos++;
      }

      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      indent_found = false;
      indent = 0;
      start = pos + 1;
    }
  } // Push fake entry to simplify cache bounds checks


  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.lineMax = this.bMarks.length - 1; // don't count last fake line
}

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }

  return from;
}; // Skip spaces from given position.


StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== 0x20
    /* space */
    ) {
      break;
    }
  }

  return pos;
}; // Skip char codes from given position


StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) {
      break;
    }
  }

  return pos;
}; // Skip char codes reverse from given position - 1


StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) {
    return pos;
  }

  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) {
      return pos + 1;
    }
  }

  return pos;
}; // cut lines range from source.


StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  var i,
      first,
      last,
      queue,
      shift,
      line = begin;

  if (begin >= end) {
    return '';
  } // Opt: don't use push queue for single line;


  if (line + 1 === end) {
    first = this.bMarks[line] + Math.min(this.tShift[line], indent);
    last = keepLastLF ? this.eMarks[line] + 1 : this.eMarks[line];
    return this.src.slice(first, last);
  }

  queue = new Array(end - begin);

  for (i = 0; line < end; line++, i++) {
    shift = this.tShift[line];

    if (shift > indent) {
      shift = indent;
    }

    if (shift < 0) {
      shift = 0;
    }

    first = this.bMarks[line] + shift;

    if (line + 1 < end || keepLastLF) {
      // No need for bounds check because we have fake entry on tail.
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    queue[i] = this.src.slice(first, last);
  }

  return queue.join('');
}; // Code block (4 spaces padded)


function code(state, startLine, endLine
/*, silent*/
) {
  var nextLine, last;

  if (state.tShift[startLine] - state.blkIndent < 4) {
    return false;
  }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }

    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }

    break;
  }

  state.line = nextLine;
  state.tokens.push({
    type: 'code',
    content: state.getLines(startLine, last, 4 + state.blkIndent, true),
    block: true,
    lines: [startLine, state.line],
    level: state.level
  });
  return true;
} // fences (``` lang, ~~~ lang)


function fences(state, startLine, endLine, silent) {
  var marker,
      len,
      params,
      nextLine,
      mem,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 3 > max) {
    return false;
  }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x7E
  /* ~ */
  && marker !== 0x60
  /* ` */
  ) {
    return false;
  } // scan marker length


  mem = pos;
  pos = state.skipChars(pos, marker);
  len = pos - mem;

  if (len < 3) {
    return false;
  }

  params = state.src.slice(pos, max).trim();

  if (params.indexOf('`') >= 0) {
    return false;
  } // Since start is found, we can report success here in validation mode


  if (silent) {
    return true;
  } // search end of block


  nextLine = startLine;

  for (;;) {
    nextLine++;

    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.tShift[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) {
      continue;
    }

    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker); // closing code fence must be at least as long as the opening one

    if (pos - mem < len) {
      continue;
    } // make sure tail has spaces only


    pos = state.skipSpaces(pos);

    if (pos < max) {
      continue;
    }

    haveEndMarker = true; // found!

    break;
  } // If a fence has heading spaces, they should be removed from its inner block


  len = state.tShift[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  state.tokens.push({
    type: 'fence',
    params: params,
    content: state.getLines(startLine + 1, nextLine, len, true),
    lines: [startLine, state.line],
    level: state.level
  });
  return true;
} // Block quotes


function blockquote(state, startLine, endLine, silent) {
  var nextLine,
      lastLineEmpty,
      oldTShift,
      oldBMarks,
      oldIndent,
      oldParentType,
      lines,
      terminatorRules,
      i,
      l,
      terminate,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos > max) {
    return false;
  } // check the block quote marker


  if (state.src.charCodeAt(pos++) !== 0x3E
  /* > */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  } // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode


  if (silent) {
    return true;
  } // skip one optional space after '>'


  if (state.src.charCodeAt(pos) === 0x20) {
    pos++;
  }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;
  oldBMarks = [state.bMarks[startLine]];
  state.bMarks[startLine] = pos; // check if we have an empty blockquote

  pos = pos < max ? state.skipSpaces(pos) : pos;
  lastLineEmpty = pos >= max;
  oldTShift = [state.tShift[startLine]];
  state.tShift[startLine] = pos - state.bMarks[startLine];
  terminatorRules = state.parser.ruler.getRules('blockquote'); // Search the end of the block
  //
  // Block ends with either:
  //  1. an empty line outside:
  //     ```
  //     > test
  //
  //     ```
  //  2. an empty line inside:
  //     ```
  //     >
  //     test
  //     ```
  //  3. another tag
  //     ```
  //     > test
  //      - - -
  //     ```

  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src.charCodeAt(pos++) === 0x3E
    /* > */
    ) {
      // This line is inside the blockquote.
      // skip one optional space after '>'
      if (state.src.charCodeAt(pos) === 0x20) {
        pos++;
      }

      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      pos = pos < max ? state.skipSpaces(pos) : pos;
      lastLineEmpty = pos >= max;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    } // Case 2: line is not inside the blockquote, and the last line was empty.


    if (lastLineEmpty) {
      break;
    } // Case 3: another tag found.


    terminate = false;

    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      break;
    }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]); // A negative number means that this is a paragraph continuation;
    //
    // Any negative number will do the job here, but it's better for it
    // to be large enough to make any bugs obvious.

    state.tShift[nextLine] = -1337;
  }

  oldParentType = state.parentType;
  state.parentType = 'blockquote';
  state.tokens.push({
    type: 'blockquote_open',
    lines: lines = [startLine, 0],
    level: state.level++
  });
  state.parser.tokenize(state, startLine, nextLine);
  state.tokens.push({
    type: 'blockquote_close',
    level: --state.level
  });
  state.parentType = oldParentType;
  lines[1] = state.line; // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.

  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
  }

  state.blkIndent = oldIndent;
  return true;
} // Horizontal rule


function hr(state, startLine, endLine, silent) {
  var marker,
      cnt,
      ch,
      pos = state.bMarks[startLine],
      max = state.eMarks[startLine];
  pos += state.tShift[startLine];

  if (pos > max) {
    return false;
  }

  marker = state.src.charCodeAt(pos++); // Check hr marker

  if (marker !== 0x2A
  /* * */
  && marker !== 0x2D
  /* - */
  && marker !== 0x5F
  /* _ */
  ) {
    return false;
  } // markers can be mixed with spaces, but there should be at least 3 one


  cnt = 1;

  while (pos < max) {
    ch = state.src.charCodeAt(pos++);

    if (ch !== marker && ch !== 0x20
    /* space */
    ) {
      return false;
    }

    if (ch === marker) {
      cnt++;
    }
  }

  if (cnt < 3) {
    return false;
  }

  if (silent) {
    return true;
  }

  state.line = startLine + 1;
  state.tokens.push({
    type: 'hr',
    lines: [startLine, state.line],
    level: state.level
  });
  return true;
} // Lists
// Search `[-+*][\n ]`, returns next pos arter marker on success
// or -1 on fail.


function skipBulletListMarker(state, startLine) {
  var marker, pos, max;
  pos = state.bMarks[startLine] + state.tShift[startLine];
  max = state.eMarks[startLine];

  if (pos >= max) {
    return -1;
  }

  marker = state.src.charCodeAt(pos++); // Check bullet

  if (marker !== 0x2A
  /* * */
  && marker !== 0x2D
  /* - */
  && marker !== 0x2B
  /* + */
  ) {
    return -1;
  }

  if (pos < max && state.src.charCodeAt(pos) !== 0x20) {
    // " 1.test " - is not a list item
    return -1;
  }

  return pos;
} // Search `\d+[.)][\n ]`, returns next pos arter marker on success
// or -1 on fail.


function skipOrderedListMarker(state, startLine) {
  var ch,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 1 >= max) {
    return -1;
  }

  ch = state.src.charCodeAt(pos++);

  if (ch < 0x30
  /* 0 */
  || ch > 0x39
  /* 9 */
  ) {
    return -1;
  }

  for (;;) {
    // EOL -> fail
    if (pos >= max) {
      return -1;
    }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30
    /* 0 */
    && ch <= 0x39
    /* 9 */
    ) {
      continue;
    } // found valid marker


    if (ch === 0x29
    /* ) */
    || ch === 0x2e
    /* . */
    ) {
      break;
    }

    return -1;
  }

  if (pos < max && state.src.charCodeAt(pos) !== 0x20
  /* space */
  ) {
    // " 1.test " - is not a list item
    return -1;
  }

  return pos;
}

function markTightParagraphs(state, idx) {
  var i,
      l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}

function list(state, startLine, endLine, silent) {
  var nextLine,
      indent,
      oldTShift,
      oldIndent,
      oldTight,
      oldParentType,
      start,
      posAfterMarker,
      max,
      indentAfterMarker,
      markerValue,
      markerCharCode,
      isOrdered,
      contentStart,
      listTokIdx,
      prevEmptyEnd,
      listLines,
      itemLines,
      tight = true,
      terminatorRules,
      i,
      l,
      terminate; // Detect list type and position after marker

  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  } // We should terminate list on style change. Remember first one to compare.


  markerCharCode = state.src.charCodeAt(posAfterMarker - 1); // For validation mode we can terminate immediately

  if (silent) {
    return true;
  } // Start list


  listTokIdx = state.tokens.length;

  if (isOrdered) {
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));
    state.tokens.push({
      type: 'ordered_list_open',
      order: markerValue,
      lines: listLines = [startLine, 0],
      level: state.level++
    });
  } else {
    state.tokens.push({
      type: 'bullet_list_open',
      lines: listLines = [startLine, 0],
      level: state.level++
    });
  } //
  // Iterate list items
  //


  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.parser.ruler.getRules('list');

  while (nextLine < endLine) {
    contentStart = state.skipSpaces(posAfterMarker);
    max = state.eMarks[nextLine];

    if (contentStart >= max) {
      // trimming space in "-    \n  3" case, indent is 1 here
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = contentStart - posAfterMarker;
    } // If we have more than 4 spaces, the indent is 1
    // (the rest is just indented code block)


    if (indentAfterMarker > 4) {
      indentAfterMarker = 1;
    } // If indent is less than 1, assume that it's one, example:
    //  "-\n  test"


    if (indentAfterMarker < 1) {
      indentAfterMarker = 1;
    } // "  -  test"
    //  ^^^^^ - calculating total length of this thing


    indent = posAfterMarker - state.bMarks[nextLine] + indentAfterMarker; // Run subparser & write tokens

    state.tokens.push({
      type: 'list_item_open',
      lines: itemLines = [startLine, 0],
      level: state.level++
    });
    oldIndent = state.blkIndent;
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldParentType = state.parentType;
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.blkIndent = indent;
    state.tight = true;
    state.parentType = 'list';
    state.parser.tokenize(state, startLine, endLine, true); // If any of list item is tight, mark list as tight

    if (!state.tight || prevEmptyEnd) {
      tight = false;
    } // Item become loose if finish with empty line,
    // but we should filter last element, because it means list finish


    prevEmptyEnd = state.line - startLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = oldIndent;
    state.tShift[startLine] = oldTShift;
    state.tight = oldTight;
    state.parentType = oldParentType;
    state.tokens.push({
      type: 'list_item_close',
      level: --state.level
    });
    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];

    if (nextLine >= endLine) {
      break;
    }

    if (state.isEmpty(nextLine)) {
      break;
    } //
    // Try to check if list is terminated or continued.
    //


    if (state.tShift[nextLine] < state.blkIndent) {
      break;
    } // fail if terminating block found


    terminate = false;

    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      break;
    } // fail if list has another type


    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);

      if (posAfterMarker < 0) {
        break;
      }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);

      if (posAfterMarker < 0) {
        break;
      }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
      break;
    }
  } // Finilize list


  state.tokens.push({
    type: isOrdered ? 'ordered_list_close' : 'bullet_list_close',
    level: --state.level
  });
  listLines[1] = nextLine;
  state.line = nextLine; // mark paragraphs tight if needed

  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
} // Process footnote reference list


function footnote(state, startLine, endLine, silent) {
  var oldBMark,
      oldTShift,
      oldParentType,
      pos,
      label,
      start = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine]; // line should be at least 5 chars - "[^x]:"

  if (start + 4 > max) {
    return false;
  }

  if (state.src.charCodeAt(start) !== 0x5B
  /* [ */
  ) {
    return false;
  }

  if (state.src.charCodeAt(start + 1) !== 0x5E
  /* ^ */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  for (pos = start + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x20) {
      return false;
    }

    if (state.src.charCodeAt(pos) === 0x5D
    /* ] */
    ) {
      break;
    }
  }

  if (pos === start + 2) {
    return false;
  } // no empty footnote labels


  if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A
  /* : */
  ) {
    return false;
  }

  if (silent) {
    return true;
  }

  pos++;

  if (!state.env.footnotes) {
    state.env.footnotes = {};
  }

  if (!state.env.footnotes.refs) {
    state.env.footnotes.refs = {};
  }

  label = state.src.slice(start + 2, pos - 2);
  state.env.footnotes.refs[':' + label] = -1;
  state.tokens.push({
    type: 'footnote_reference_open',
    label: label,
    level: state.level++
  });
  oldBMark = state.bMarks[startLine];
  oldTShift = state.tShift[startLine];
  oldParentType = state.parentType;
  state.tShift[startLine] = state.skipSpaces(pos) - pos;
  state.bMarks[startLine] = pos;
  state.blkIndent += 4;
  state.parentType = 'footnote';

  if (state.tShift[startLine] < state.blkIndent) {
    state.tShift[startLine] += state.blkIndent;
    state.bMarks[startLine] -= state.blkIndent;
  }

  state.parser.tokenize(state, startLine, endLine, true);
  state.parentType = oldParentType;
  state.blkIndent -= 4;
  state.tShift[startLine] = oldTShift;
  state.bMarks[startLine] = oldBMark;
  state.tokens.push({
    type: 'footnote_reference_close',
    level: --state.level
  });
  return true;
} // heading (#, ##, ...)


function heading(state, startLine, endLine, silent) {
  var ch,
      level,
      tmp,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos >= max) {
    return false;
  }

  ch = state.src.charCodeAt(pos);

  if (ch !== 0x23
  /* # */
  || pos >= max) {
    return false;
  } // count heading level


  level = 1;
  ch = state.src.charCodeAt(++pos);

  while (ch === 0x23
  /* # */
  && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || pos < max && ch !== 0x20
  /* space */
  ) {
    return false;
  }

  if (silent) {
    return true;
  } // Let's cut tails like '    ###  ' from the end of string


  max = state.skipCharsBack(max, 0x20, pos); // space

  tmp = state.skipCharsBack(max, 0x23, pos); // #

  if (tmp > pos && state.src.charCodeAt(tmp - 1) === 0x20
  /* space */
  ) {
    max = tmp;
  }

  state.line = startLine + 1;
  state.tokens.push({
    type: 'heading_open',
    hLevel: level,
    lines: [startLine, state.line],
    level: state.level
  }); // only if header is not empty

  if (pos < max) {
    state.tokens.push({
      type: 'inline',
      content: state.src.slice(pos, max).trim(),
      level: state.level + 1,
      lines: [startLine, state.line],
      children: []
    });
  }

  state.tokens.push({
    type: 'heading_close',
    hLevel: level,
    level: state.level
  });
  return true;
} // lheading (---, ===)


function lheading(state, startLine, endLine
/*, silent*/
) {
  var marker,
      pos,
      max,
      next = startLine + 1;

  if (next >= endLine) {
    return false;
  }

  if (state.tShift[next] < state.blkIndent) {
    return false;
  } // Scan next line


  if (state.tShift[next] - state.blkIndent > 3) {
    return false;
  }

  pos = state.bMarks[next] + state.tShift[next];
  max = state.eMarks[next];

  if (pos >= max) {
    return false;
  }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x2D
  /* - */
  && marker !== 0x3D
  /* = */
  ) {
    return false;
  }

  pos = state.skipChars(pos, marker);
  pos = state.skipSpaces(pos);

  if (pos < max) {
    return false;
  }

  pos = state.bMarks[startLine] + state.tShift[startLine];
  state.line = next + 1;
  state.tokens.push({
    type: 'heading_open',
    hLevel: marker === 0x3D
    /* = */
    ? 1 : 2,
    lines: [startLine, state.line],
    level: state.level
  });
  state.tokens.push({
    type: 'inline',
    content: state.src.slice(pos, state.eMarks[startLine]).trim(),
    level: state.level + 1,
    lines: [startLine, state.line - 1],
    children: []
  });
  state.tokens.push({
    type: 'heading_close',
    hLevel: marker === 0x3D
    /* = */
    ? 1 : 2,
    level: state.level
  });
  return true;
} // List of valid html blocks names, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#html-blocks


var html_blocks = {};
['article', 'aside', 'button', 'blockquote', 'body', 'canvas', 'caption', 'col', 'colgroup', 'dd', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'iframe', 'li', 'map', 'object', 'ol', 'output', 'p', 'pre', 'progress', 'script', 'section', 'style', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'tr', 'thead', 'ul', 'video'].forEach(function (name) {
  html_blocks[name] = true;
}); // HTML block

var HTML_TAG_OPEN_RE = /^<([a-zA-Z]{1,15})[\s\/>]/;
var HTML_TAG_CLOSE_RE = /^<\/([a-zA-Z]{1,15})[\s>]/;

function isLetter$1(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case

  return lc >= 0x61
  /* a */
  && lc <= 0x7a
  /* z */
  ;
}

function htmlblock(state, startLine, endLine, silent) {
  var ch,
      match,
      nextLine,
      pos = state.bMarks[startLine],
      max = state.eMarks[startLine],
      shift = state.tShift[startLine];
  pos += shift;

  if (!state.options.html) {
    return false;
  }

  if (shift > 3 || pos + 2 >= max) {
    return false;
  }

  if (state.src.charCodeAt(pos) !== 0x3C
  /* < */
  ) {
    return false;
  }

  ch = state.src.charCodeAt(pos + 1);

  if (ch === 0x21
  /* ! */
  || ch === 0x3F
  /* ? */
  ) {
    // Directive start / comment start / processing instruction start
    if (silent) {
      return true;
    }
  } else if (ch === 0x2F
  /* / */
  || isLetter$1(ch)) {
    // Probably start or end of tag
    if (ch === 0x2F
    /* \ */
    ) {
      // closing tag
      match = state.src.slice(pos, max).match(HTML_TAG_CLOSE_RE);

      if (!match) {
        return false;
      }
    } else {
      // opening tag
      match = state.src.slice(pos, max).match(HTML_TAG_OPEN_RE);

      if (!match) {
        return false;
      }
    } // Make sure tag name is valid


    if (html_blocks[match[1].toLowerCase()] !== true) {
      return false;
    }

    if (silent) {
      return true;
    }
  } else {
    return false;
  } // If we are here - we detected HTML block.
  // Let's roll down till empty line (block end).


  nextLine = startLine + 1;

  while (nextLine < state.lineMax && !state.isEmpty(nextLine)) {
    nextLine++;
  }

  state.line = nextLine;
  state.tokens.push({
    type: 'htmlblock',
    level: state.level,
    lines: [startLine, state.line],
    content: state.getLines(startLine, nextLine, 0, true)
  });
  return true;
} // GFM table, non-standard


function getLine$1(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];
  return state.src.substr(pos, max - pos);
}

function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, rows, cell, aligns, t, tableLines, tbodyLines; // should have at least three lines

  if (startLine + 2 > endLine) {
    return false;
  }

  nextLine = startLine + 1;

  if (state.tShift[nextLine] < state.blkIndent) {
    return false;
  } // first character of the second line should be '|' or '-'


  pos = state.bMarks[nextLine] + state.tShift[nextLine];

  if (pos >= state.eMarks[nextLine]) {
    return false;
  }

  ch = state.src.charCodeAt(pos);

  if (ch !== 0x7C
  /* | */
  && ch !== 0x2D
  /* - */
  && ch !== 0x3A
  /* : */
  ) {
    return false;
  }

  lineText = getLine$1(state, startLine + 1);

  if (!/^[-:| ]+$/.test(lineText)) {
    return false;
  }

  rows = lineText.split('|');

  if (rows <= 2) {
    return false;
  }

  aligns = [];

  for (i = 0; i < rows.length; i++) {
    t = rows[i].trim();

    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === rows.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) {
      return false;
    }

    if (t.charCodeAt(t.length - 1) === 0x3A
    /* : */
    ) {
      aligns.push(t.charCodeAt(0) === 0x3A
      /* : */
      ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A
    /* : */
    ) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine$1(state, startLine).trim();

  if (lineText.indexOf('|') === -1) {
    return false;
  }

  rows = lineText.replace(/^\||\|$/g, '').split('|');

  if (aligns.length !== rows.length) {
    return false;
  }

  if (silent) {
    return true;
  }

  state.tokens.push({
    type: 'table_open',
    lines: tableLines = [startLine, 0],
    level: state.level++
  });
  state.tokens.push({
    type: 'thead_open',
    lines: [startLine, startLine + 1],
    level: state.level++
  });
  state.tokens.push({
    type: 'tr_open',
    lines: [startLine, startLine + 1],
    level: state.level++
  });

  for (i = 0; i < rows.length; i++) {
    state.tokens.push({
      type: 'th_open',
      align: aligns[i],
      lines: [startLine, startLine + 1],
      level: state.level++
    });
    state.tokens.push({
      type: 'inline',
      content: rows[i].trim(),
      lines: [startLine, startLine + 1],
      level: state.level,
      children: []
    });
    state.tokens.push({
      type: 'th_close',
      level: --state.level
    });
  }

  state.tokens.push({
    type: 'tr_close',
    level: --state.level
  });
  state.tokens.push({
    type: 'thead_close',
    level: --state.level
  });
  state.tokens.push({
    type: 'tbody_open',
    lines: tbodyLines = [startLine + 2, 0],
    level: state.level++
  });

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.tShift[nextLine] < state.blkIndent) {
      break;
    }

    lineText = getLine$1(state, nextLine).trim();

    if (lineText.indexOf('|') === -1) {
      break;
    }

    rows = lineText.replace(/^\||\|$/g, '').split('|');
    state.tokens.push({
      type: 'tr_open',
      level: state.level++
    });

    for (i = 0; i < rows.length; i++) {
      state.tokens.push({
        type: 'td_open',
        align: aligns[i],
        level: state.level++
      }); // 0x7c === '|'

      cell = rows[i].substring(rows[i].charCodeAt(0) === 0x7c ? 1 : 0, rows[i].charCodeAt(rows[i].length - 1) === 0x7c ? rows[i].length - 1 : rows[i].length).trim();
      state.tokens.push({
        type: 'inline',
        content: cell,
        level: state.level,
        children: []
      });
      state.tokens.push({
        type: 'td_close',
        level: --state.level
      });
    }

    state.tokens.push({
      type: 'tr_close',
      level: --state.level
    });
  }

  state.tokens.push({
    type: 'tbody_close',
    level: --state.level
  });
  state.tokens.push({
    type: 'table_close',
    level: --state.level
  });
  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
} // Definition lists
// Search `[:~][\n ]`, returns next pos after marker on success
// or -1 on fail.


function skipMarker(state, line) {
  var pos,
      marker,
      start = state.bMarks[line] + state.tShift[line],
      max = state.eMarks[line];

  if (start >= max) {
    return -1;
  } // Check bullet


  marker = state.src.charCodeAt(start++);

  if (marker !== 0x7E
  /* ~ */
  && marker !== 0x3A
  /* : */
  ) {
    return -1;
  }

  pos = state.skipSpaces(start); // require space after ":"

  if (start === pos) {
    return -1;
  } // no empty definitions, e.g. "  : "


  if (pos >= max) {
    return -1;
  }

  return pos;
}

function markTightParagraphs$1(state, idx) {
  var i,
      l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}

function deflist(state, startLine, endLine, silent) {
  var contentStart, ddLine, dtLine, itemLines, listLines, listTokIdx, nextLine, oldIndent, oldDDIndent, oldParentType, oldTShift, oldTight, prevEmptyEnd, tight;

  if (silent) {
    // quirk: validation mode validates a dd block only, not a whole deflist
    if (state.ddIndent < 0) {
      return false;
    }

    return skipMarker(state, startLine) >= 0;
  }

  nextLine = startLine + 1;

  if (state.isEmpty(nextLine)) {
    if (++nextLine > endLine) {
      return false;
    }
  }

  if (state.tShift[nextLine] < state.blkIndent) {
    return false;
  }

  contentStart = skipMarker(state, nextLine);

  if (contentStart < 0) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  } // Start list


  listTokIdx = state.tokens.length;
  state.tokens.push({
    type: 'dl_open',
    lines: listLines = [startLine, 0],
    level: state.level++
  }); //
  // Iterate list items
  //

  dtLine = startLine;
  ddLine = nextLine; // One definition list can contain multiple DTs,
  // and one DT can be followed by multiple DDs.
  //
  // Thus, there is two loops here, and label is
  // needed to break out of the second one
  //

  /*eslint no-labels:0,block-scoped-var:0*/

  OUTER: for (;;) {
    tight = true;
    prevEmptyEnd = false;
    state.tokens.push({
      type: 'dt_open',
      lines: [dtLine, dtLine],
      level: state.level++
    });
    state.tokens.push({
      type: 'inline',
      content: state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim(),
      level: state.level + 1,
      lines: [dtLine, dtLine],
      children: []
    });
    state.tokens.push({
      type: 'dt_close',
      level: --state.level
    });

    for (;;) {
      state.tokens.push({
        type: 'dd_open',
        lines: itemLines = [nextLine, 0],
        level: state.level++
      });
      oldTight = state.tight;
      oldDDIndent = state.ddIndent;
      oldIndent = state.blkIndent;
      oldTShift = state.tShift[ddLine];
      oldParentType = state.parentType;
      state.blkIndent = state.ddIndent = state.tShift[ddLine] + 2;
      state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
      state.tight = true;
      state.parentType = 'deflist';
      state.parser.tokenize(state, ddLine, endLine, true); // If any of list item is tight, mark list as tight

      if (!state.tight || prevEmptyEnd) {
        tight = false;
      } // Item become loose if finish with empty line,
      // but we should filter last element, because it means list finish


      prevEmptyEnd = state.line - ddLine > 1 && state.isEmpty(state.line - 1);
      state.tShift[ddLine] = oldTShift;
      state.tight = oldTight;
      state.parentType = oldParentType;
      state.blkIndent = oldIndent;
      state.ddIndent = oldDDIndent;
      state.tokens.push({
        type: 'dd_close',
        level: --state.level
      });
      itemLines[1] = nextLine = state.line;

      if (nextLine >= endLine) {
        break OUTER;
      }

      if (state.tShift[nextLine] < state.blkIndent) {
        break OUTER;
      }

      contentStart = skipMarker(state, nextLine);

      if (contentStart < 0) {
        break;
      }

      ddLine = nextLine; // go to the next loop iteration:
      // insert DD tag and repeat checking
    }

    if (nextLine >= endLine) {
      break;
    }

    dtLine = nextLine;

    if (state.isEmpty(dtLine)) {
      break;
    }

    if (state.tShift[dtLine] < state.blkIndent) {
      break;
    }

    ddLine = dtLine + 1;

    if (ddLine >= endLine) {
      break;
    }

    if (state.isEmpty(ddLine)) {
      ddLine++;
    }

    if (ddLine >= endLine) {
      break;
    }

    if (state.tShift[ddLine] < state.blkIndent) {
      break;
    }

    contentStart = skipMarker(state, ddLine);

    if (contentStart < 0) {
      break;
    } // go to the next loop iteration:
    // insert DT and DD tags and repeat checking

  } // Finilize list


  state.tokens.push({
    type: 'dl_close',
    level: --state.level
  });
  listLines[1] = nextLine;
  state.line = nextLine; // mark paragraphs tight if needed

  if (tight) {
    markTightParagraphs$1(state, listTokIdx);
  }

  return true;
} // Paragraph


function paragraph(state, startLine
/*, endLine*/
) {
  var endLine,
      content,
      terminate,
      i,
      l,
      nextLine = startLine + 1,
      terminatorRules;
  endLine = state.lineMax; // jump line-by-line until empty one or EOF

  if (nextLine < endLine && !state.isEmpty(nextLine)) {
    terminatorRules = state.parser.ruler.getRules('paragraph');

    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.tShift[nextLine] - state.blkIndent > 3) {
        continue;
      } // Some tags can terminate paragraph without empty line.


      terminate = false;

      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }

      if (terminate) {
        break;
      }
    }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
  state.line = nextLine;

  if (content.length) {
    state.tokens.push({
      type: 'paragraph_open',
      tight: false,
      lines: [startLine, state.line],
      level: state.level
    });
    state.tokens.push({
      type: 'inline',
      content: content,
      level: state.level + 1,
      lines: [startLine, state.line],
      children: []
    });
    state.tokens.push({
      type: 'paragraph_close',
      tight: false,
      level: state.level
    });
  }

  return true;
}
/**
 * Parser rules
 */


var _rules$1 = [['code', code], ['fences', fences, ['paragraph', 'blockquote', 'list']], ['blockquote', blockquote, ['paragraph', 'blockquote', 'list']], ['hr', hr, ['paragraph', 'blockquote', 'list']], ['list', list, ['paragraph', 'blockquote']], ['footnote', footnote, ['paragraph']], ['heading', heading, ['paragraph', 'blockquote']], ['lheading', lheading], ['htmlblock', htmlblock, ['paragraph', 'blockquote']], ['table', table, ['paragraph']], ['deflist', deflist, ['paragraph']], ['paragraph', paragraph]];
/**
 * Block Parser class
 *
 * @api private
 */

function ParserBlock() {
  this.ruler = new Ruler();

  for (var i = 0; i < _rules$1.length; i++) {
    this.ruler.push(_rules$1[i][0], _rules$1[i][1], {
      alt: (_rules$1[i][2] || []).slice()
    });
  }
}
/**
 * Generate tokens for the given input range.
 *
 * @param  {Object} `state` Has properties like `src`, `parser`, `options` etc
 * @param  {Number} `startLine`
 * @param  {Number} `endLine`
 * @api private
 */


ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  var rules = this.ruler.getRules('');
  var len = rules.length;
  var line = startLine;
  var hasEmptyLines = false;
  var ok, i;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);

    if (line >= endLine) {
      break;
    } // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists


    if (state.tShift[line] < state.blkIndent) {
      break;
    } // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true


    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);

      if (ok) {
        break;
      }
    } // set state.tight iff we had an empty line before current tag
    // i.e. latest empty line should not count


    state.tight = !hasEmptyLines; // paragraph might "eat" one newline after it in nested lists

    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++; // two empty lines should stop the parser in list mode

      if (line < endLine && state.parentType === 'list' && state.isEmpty(line)) {
        break;
      }

      state.line = line;
    }
  }
};

var TABS_SCAN_RE = /[\n\t]/g;
var NEWLINES_RE = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
var SPACES_RE = /\u00a0/g;
/**
 * Tokenize the given `str`.
 *
 * @param  {String} `str` Source string
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @param  {Array} `outTokens`
 * @api private
 */

ParserBlock.prototype.parse = function (str, options, env, outTokens) {
  var state,
      lineStart = 0,
      lastTabPos = 0;

  if (!str) {
    return [];
  } // Normalize spaces


  str = str.replace(SPACES_RE, ' '); // Normalize newlines

  str = str.replace(NEWLINES_RE, '\n'); // Replace tabs with proper number of spaces (1..4)

  if (str.indexOf('\t') >= 0) {
    str = str.replace(TABS_SCAN_RE, function (match, offset) {
      var result;

      if (str.charCodeAt(offset) === 0x0A) {
        lineStart = offset + 1;
        lastTabPos = 0;
        return match;
      }

      result = '    '.slice((offset - lineStart - lastTabPos) % 4);
      lastTabPos = offset - lineStart + 1;
      return result;
    });
  }

  state = new StateBlock(str, this, options, env, outTokens);
  this.tokenize(state, state.line, state.lineMax);
}; // Skip text characters for text token, place those to pending buffer
// and increment current pos
// Rule to skip pure text
// '{}$%@~+=:' reserved for extentions


function isTerminatorChar(ch) {
  switch (ch) {
    case 0x0A
    /* \n */
    :
    case 0x5C
    /* \ */
    :
    case 0x60
    /* ` */
    :
    case 0x2A
    /* * */
    :
    case 0x5F
    /* _ */
    :
    case 0x5E
    /* ^ */
    :
    case 0x5B
    /* [ */
    :
    case 0x5D
    /* ] */
    :
    case 0x21
    /* ! */
    :
    case 0x26
    /* & */
    :
    case 0x3C
    /* < */
    :
    case 0x3E
    /* > */
    :
    case 0x7B
    /* { */
    :
    case 0x7D
    /* } */
    :
    case 0x24
    /* $ */
    :
    case 0x25
    /* % */
    :
    case 0x40
    /* @ */
    :
    case 0x7E
    /* ~ */
    :
    case 0x2B
    /* + */
    :
    case 0x3D
    /* = */
    :
    case 0x3A
    /* : */
    :
      return true;

    default:
      return false;
  }
}

function text(state, silent) {
  var pos = state.pos;

  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }

  if (pos === state.pos) {
    return false;
  }

  if (!silent) {
    state.pending += state.src.slice(state.pos, pos);
  }

  state.pos = pos;
  return true;
} // Proceess '\n'


function newline(state, silent) {
  var pmax,
      max,
      pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A
  /* \n */
  ) {
    return false;
  }

  pmax = state.pending.length - 1;
  max = state.posMax; // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.

  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        // Strip out all trailing spaces on this line.
        for (var i = pmax - 2; i >= 0; i--) {
          if (state.pending.charCodeAt(i) !== 0x20) {
            state.pending = state.pending.substring(0, i + 1);
            break;
          }
        }

        state.push({
          type: 'hardbreak',
          level: state.level
        });
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push({
          type: 'softbreak',
          level: state.level
        });
      }
    } else {
      state.push({
        type: 'softbreak',
        level: state.level
      });
    }
  }

  pos++; // skip heading spaces for next line

  while (pos < max && state.src.charCodeAt(pos) === 0x20) {
    pos++;
  }

  state.pos = pos;
  return true;
} // Proceess escaped chars and hardbreaks


var ESCAPED = [];

for (var i$1 = 0; i$1 < 256; i$1++) {
  ESCAPED.push(0);
}

'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'.split('').forEach(function (ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});

function escape(state, silent) {
  var ch,
      pos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x5C
  /* \ */
  ) {
    return false;
  }

  pos++;

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) {
        state.pending += state.src[pos];
      }

      state.pos += 2;
      return true;
    }

    if (ch === 0x0A) {
      if (!silent) {
        state.push({
          type: 'hardbreak',
          level: state.level
        });
      }

      pos++; // skip leading whitespaces from next line

      while (pos < max && state.src.charCodeAt(pos) === 0x20) {
        pos++;
      }

      state.pos = pos;
      return true;
    }
  }

  if (!silent) {
    state.pending += '\\';
  }

  state.pos++;
  return true;
} // Parse backticks


function backticks(state, silent) {
  var start,
      max,
      marker,
      matchStart,
      matchEnd,
      pos = state.pos,
      ch = state.src.charCodeAt(pos);

  if (ch !== 0x60
  /* ` */
  ) {
    return false;
  }

  start = pos;
  pos++;
  max = state.posMax;

  while (pos < max && state.src.charCodeAt(pos) === 0x60
  /* ` */
  ) {
    pos++;
  }

  marker = state.src.slice(start, pos);
  matchStart = matchEnd = pos;

  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
    matchEnd = matchStart + 1;

    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60
    /* ` */
    ) {
      matchEnd++;
    }

    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        state.push({
          type: 'code',
          content: state.src.slice(pos, matchStart).replace(/[ \n]+/g, ' ').trim(),
          block: false,
          level: state.level
        });
      }

      state.pos = matchEnd;
      return true;
    }
  }

  if (!silent) {
    state.pending += marker;
  }

  state.pos += marker.length;
  return true;
} // Process ~~deleted text~~


function del(state, silent) {
  var found,
      pos,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x7E
  /* ~ */
  ) {
    return false;
  }

  if (silent) {
    return false;
  } // don't run any pairs in validation mode


  if (start + 4 >= max) {
    return false;
  }

  if (state.src.charCodeAt(start + 1) !== 0x7E
  /* ~ */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (lastChar === 0x7E
  /* ~ */
  ) {
    return false;
  }

  if (nextChar === 0x7E
  /* ~ */
  ) {
    return false;
  }

  if (nextChar === 0x20 || nextChar === 0x0A) {
    return false;
  }

  pos = start + 2;

  while (pos < max && state.src.charCodeAt(pos) === 0x7E
  /* ~ */
  ) {
    pos++;
  }

  if (pos > start + 3) {
    // sequence of 4+ markers taking as literal, same as in a emphasis
    state.pos += pos - start;

    if (!silent) {
      state.pending += state.src.slice(start, pos);
    }

    return true;
  }

  state.pos = start + 2;
  stack = 1;

  while (state.pos + 1 < max) {
    if (state.src.charCodeAt(state.pos) === 0x7E
    /* ~ */
    ) {
      if (state.src.charCodeAt(state.pos + 1) === 0x7E
      /* ~ */
      ) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max ? state.src.charCodeAt(state.pos + 2) : -1;

        if (nextChar !== 0x7E
        /* ~ */
        && lastChar !== 0x7E
        /* ~ */
        ) {
          if (lastChar !== 0x20 && lastChar !== 0x0A) {
            // closing '~~'
            stack--;
          } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
            // opening '~~'
            stack++;
          } // else {
          //  // standalone ' ~~ ' indented with spaces
          // }


          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  } // found!


  state.posMax = state.pos;
  state.pos = start + 2;

  if (!silent) {
    state.push({
      type: 'del_open',
      level: state.level++
    });
    state.parser.tokenize(state);
    state.push({
      type: 'del_close',
      level: --state.level
    });
  }

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
} // Process ++inserted text++


function ins(state, silent) {
  var found,
      pos,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x2B
  /* + */
  ) {
    return false;
  }

  if (silent) {
    return false;
  } // don't run any pairs in validation mode


  if (start + 4 >= max) {
    return false;
  }

  if (state.src.charCodeAt(start + 1) !== 0x2B
  /* + */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (lastChar === 0x2B
  /* + */
  ) {
    return false;
  }

  if (nextChar === 0x2B
  /* + */
  ) {
    return false;
  }

  if (nextChar === 0x20 || nextChar === 0x0A) {
    return false;
  }

  pos = start + 2;

  while (pos < max && state.src.charCodeAt(pos) === 0x2B
  /* + */
  ) {
    pos++;
  }

  if (pos !== start + 2) {
    // sequence of 3+ markers taking as literal, same as in a emphasis
    state.pos += pos - start;

    if (!silent) {
      state.pending += state.src.slice(start, pos);
    }

    return true;
  }

  state.pos = start + 2;
  stack = 1;

  while (state.pos + 1 < max) {
    if (state.src.charCodeAt(state.pos) === 0x2B
    /* + */
    ) {
      if (state.src.charCodeAt(state.pos + 1) === 0x2B
      /* + */
      ) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max ? state.src.charCodeAt(state.pos + 2) : -1;

        if (nextChar !== 0x2B
        /* + */
        && lastChar !== 0x2B
        /* + */
        ) {
          if (lastChar !== 0x20 && lastChar !== 0x0A) {
            // closing '++'
            stack--;
          } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
            // opening '++'
            stack++;
          } // else {
          //  // standalone ' ++ ' indented with spaces
          // }


          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  } // found!


  state.posMax = state.pos;
  state.pos = start + 2;

  if (!silent) {
    state.push({
      type: 'ins_open',
      level: state.level++
    });
    state.parser.tokenize(state);
    state.push({
      type: 'ins_close',
      level: --state.level
    });
  }

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
} // Process ==highlighted text==


function mark(state, silent) {
  var found,
      pos,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x3D
  /* = */
  ) {
    return false;
  }

  if (silent) {
    return false;
  } // don't run any pairs in validation mode


  if (start + 4 >= max) {
    return false;
  }

  if (state.src.charCodeAt(start + 1) !== 0x3D
  /* = */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (lastChar === 0x3D
  /* = */
  ) {
    return false;
  }

  if (nextChar === 0x3D
  /* = */
  ) {
    return false;
  }

  if (nextChar === 0x20 || nextChar === 0x0A) {
    return false;
  }

  pos = start + 2;

  while (pos < max && state.src.charCodeAt(pos) === 0x3D
  /* = */
  ) {
    pos++;
  }

  if (pos !== start + 2) {
    // sequence of 3+ markers taking as literal, same as in a emphasis
    state.pos += pos - start;

    if (!silent) {
      state.pending += state.src.slice(start, pos);
    }

    return true;
  }

  state.pos = start + 2;
  stack = 1;

  while (state.pos + 1 < max) {
    if (state.src.charCodeAt(state.pos) === 0x3D
    /* = */
    ) {
      if (state.src.charCodeAt(state.pos + 1) === 0x3D
      /* = */
      ) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max ? state.src.charCodeAt(state.pos + 2) : -1;

        if (nextChar !== 0x3D
        /* = */
        && lastChar !== 0x3D
        /* = */
        ) {
          if (lastChar !== 0x20 && lastChar !== 0x0A) {
            // closing '=='
            stack--;
          } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
            // opening '=='
            stack++;
          } // else {
          //  // standalone ' == ' indented with spaces
          // }


          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  } // found!


  state.posMax = state.pos;
  state.pos = start + 2;

  if (!silent) {
    state.push({
      type: 'mark_open',
      level: state.level++
    });
    state.parser.tokenize(state);
    state.push({
      type: 'mark_close',
      level: --state.level
    });
  }

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
} // Process *this* and _that_


function isAlphaNum(code) {
  return code >= 0x30
  /* 0 */
  && code <= 0x39
  /* 9 */
  || code >= 0x41
  /* A */
  && code <= 0x5A
  /* Z */
  || code >= 0x61
  /* a */
  && code <= 0x7A
  /* z */
  ;
} // parse sequence of emphasis markers,
// "start" should point at a valid marker


function scanDelims(state, start) {
  var pos = start,
      lastChar,
      nextChar,
      count,
      can_open = true,
      can_close = true,
      max = state.posMax,
      marker = state.src.charCodeAt(start);
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;

  while (pos < max && state.src.charCodeAt(pos) === marker) {
    pos++;
  }

  if (pos >= max) {
    can_open = false;
  }

  count = pos - start;

  if (count >= 4) {
    // sequence of four or more unescaped markers can't start/end an emphasis
    can_open = can_close = false;
  } else {
    nextChar = pos < max ? state.src.charCodeAt(pos) : -1; // check whitespace conditions

    if (nextChar === 0x20 || nextChar === 0x0A) {
      can_open = false;
    }

    if (lastChar === 0x20 || lastChar === 0x0A) {
      can_close = false;
    }

    if (marker === 0x5F
    /* _ */
    ) {
      // check if we aren't inside the word
      if (isAlphaNum(lastChar)) {
        can_open = false;
      }

      if (isAlphaNum(nextChar)) {
        can_close = false;
      }
    }
  }

  return {
    can_open: can_open,
    can_close: can_close,
    delims: count
  };
}

function emphasis(state, silent) {
  var startCount,
      count,
      found,
      oldCount,
      newCount,
      stack,
      res,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker !== 0x5F
  /* _ */
  && marker !== 0x2A
  /* * */
  ) {
    return false;
  }

  if (silent) {
    return false;
  } // don't run any pairs in validation mode


  res = scanDelims(state, start);
  startCount = res.delims;

  if (!res.can_open) {
    state.pos += startCount;

    if (!silent) {
      state.pending += state.src.slice(start, state.pos);
    }

    return true;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  state.pos = start + startCount;
  stack = [startCount];

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;

      if (res.can_close) {
        oldCount = stack.pop();
        newCount = count;

        while (oldCount !== newCount) {
          if (newCount < oldCount) {
            stack.push(oldCount - newCount);
            break;
          } // assert(newCount > oldCount)


          newCount -= oldCount;

          if (stack.length === 0) {
            break;
          }

          state.pos += oldCount;
          oldCount = stack.pop();
        }

        if (stack.length === 0) {
          startCount = oldCount;
          found = true;
          break;
        }

        state.pos += count;
        continue;
      }

      if (res.can_open) {
        stack.push(count);
      }

      state.pos += count;
      continue;
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  } // found!


  state.posMax = state.pos;
  state.pos = start + startCount;

  if (!silent) {
    if (startCount === 2 || startCount === 3) {
      state.push({
        type: 'strong_open',
        level: state.level++
      });
    }

    if (startCount === 1 || startCount === 3) {
      state.push({
        type: 'em_open',
        level: state.level++
      });
    }

    state.parser.tokenize(state);

    if (startCount === 1 || startCount === 3) {
      state.push({
        type: 'em_close',
        level: --state.level
      });
    }

    if (startCount === 2 || startCount === 3) {
      state.push({
        type: 'strong_close',
        level: --state.level
      });
    }
  }

  state.pos = state.posMax + startCount;
  state.posMax = max;
  return true;
} // Process ~subscript~
// same as UNESCAPE_MD_RE plus a space


var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function sub(state, silent) {
  var found,
      content,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(start) !== 0x7E
  /* ~ */
  ) {
    return false;
  }

  if (silent) {
    return false;
  } // don't run any pairs in validation mode


  if (start + 2 >= max) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  state.pos = start + 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x7E
    /* ~ */
    ) {
      found = true;
      break;
    }

    state.parser.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 1, state.pos); // don't allow unescaped spaces/newlines inside

  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  } // found!


  state.posMax = state.pos;
  state.pos = start + 1;

  if (!silent) {
    state.push({
      type: 'sub',
      level: state.level,
      content: content.replace(UNESCAPE_RE, '$1')
    });
  }

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
} // Process ^superscript^
// same as UNESCAPE_MD_RE plus a space


var UNESCAPE_RE$1 = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function sup(state, silent) {
  var found,
      content,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(start) !== 0x5E
  /* ^ */
  ) {
    return false;
  }

  if (silent) {
    return false;
  } // don't run any pairs in validation mode


  if (start + 2 >= max) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  state.pos = start + 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x5E
    /* ^ */
    ) {
      found = true;
      break;
    }

    state.parser.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 1, state.pos); // don't allow unescaped spaces/newlines inside

  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  } // found!


  state.posMax = state.pos;
  state.pos = start + 1;

  if (!silent) {
    state.push({
      type: 'sup',
      level: state.level,
      content: content.replace(UNESCAPE_RE$1, '$1')
    });
  }

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
} // Process [links](<to> "stuff")


function links(state, silent) {
  var labelStart,
      labelEnd,
      label,
      href,
      title,
      pos,
      ref,
      code,
      isImage = false,
      oldPos = state.pos,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker === 0x21
  /* ! */
  ) {
    isImage = true;
    marker = state.src.charCodeAt(++start);
  }

  if (marker !== 0x5B
  /* [ */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  labelStart = start + 1;
  labelEnd = parseLinkLabel(state, start); // parser failed to find ']', so it's not a valid link

  if (labelEnd < 0) {
    return false;
  }

  pos = labelEnd + 1;

  if (pos < max && state.src.charCodeAt(pos) === 0x28
  /* ( */
  ) {
    //
    // Inline link
    //
    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;

    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);

      if (code !== 0x20 && code !== 0x0A) {
        break;
      }
    }

    if (pos >= max) {
      return false;
    } // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination


    start = pos;

    if (parseLinkDestination(state, pos)) {
      href = state.linkContent;
      pos = state.pos;
    } else {
      href = '';
    } // [link](  <href>  "title"  )
    //                ^^ skipping these spaces


    start = pos;

    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);

      if (code !== 0x20 && code !== 0x0A) {
        break;
      }
    } // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title


    if (pos < max && start !== pos && parseLinkTitle(state, pos)) {
      title = state.linkContent;
      pos = state.pos; // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces

      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);

        if (code !== 0x20 && code !== 0x0A) {
          break;
        }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29
    /* ) */
    ) {
      state.pos = oldPos;
      return false;
    }

    pos++;
  } else {
    //
    // Link reference
    //
    // do not allow nested reference links
    if (state.linkLevel > 0) {
      return false;
    } // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)


    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);

      if (code !== 0x20 && code !== 0x0A) {
        break;
      }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B
    /* [ */
    ) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);

      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = start - 1;
      }
    } // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)


    if (!label) {
      if (typeof label === 'undefined') {
        pos = labelEnd + 1;
      }

      label = state.src.slice(labelStart, labelEnd);
    }

    ref = state.env.references[normalizeReference(label)];

    if (!ref) {
      state.pos = oldPos;
      return false;
    }

    href = ref.href;
    title = ref.title;
  } //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //


  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    if (isImage) {
      state.push({
        type: 'image',
        src: href,
        title: title,
        alt: state.src.substr(labelStart, labelEnd - labelStart),
        level: state.level
      });
    } else {
      state.push({
        type: 'link_open',
        href: href,
        title: title,
        level: state.level++
      });
      state.linkLevel++;
      state.parser.tokenize(state);
      state.linkLevel--;
      state.push({
        type: 'link_close',
        level: --state.level
      });
    }
  }

  state.pos = pos;
  state.posMax = max;
  return true;
} // Process inline footnotes (^[...])


function footnote_inline(state, silent) {
  var labelStart,
      labelEnd,
      footnoteId,
      oldLength,
      max = state.posMax,
      start = state.pos;

  if (start + 2 >= max) {
    return false;
  }

  if (state.src.charCodeAt(start) !== 0x5E
  /* ^ */
  ) {
    return false;
  }

  if (state.src.charCodeAt(start + 1) !== 0x5B
  /* [ */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  labelStart = start + 2;
  labelEnd = parseLinkLabel(state, start + 1); // parser failed to find ']', so it's not a valid note

  if (labelEnd < 0) {
    return false;
  } // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //


  if (!silent) {
    if (!state.env.footnotes) {
      state.env.footnotes = {};
    }

    if (!state.env.footnotes.list) {
      state.env.footnotes.list = [];
    }

    footnoteId = state.env.footnotes.list.length;
    state.pos = labelStart;
    state.posMax = labelEnd;
    state.push({
      type: 'footnote_ref',
      id: footnoteId,
      level: state.level
    });
    state.linkLevel++;
    oldLength = state.tokens.length;
    state.parser.tokenize(state);
    state.env.footnotes.list[footnoteId] = {
      tokens: state.tokens.splice(oldLength)
    };
    state.linkLevel--;
  }

  state.pos = labelEnd + 1;
  state.posMax = max;
  return true;
} // Process footnote references ([^...])


function footnote_ref(state, silent) {
  var label,
      pos,
      footnoteId,
      footnoteSubId,
      max = state.posMax,
      start = state.pos; // should be at least 4 chars - "[^x]"

  if (start + 3 > max) {
    return false;
  }

  if (!state.env.footnotes || !state.env.footnotes.refs) {
    return false;
  }

  if (state.src.charCodeAt(start) !== 0x5B
  /* [ */
  ) {
    return false;
  }

  if (state.src.charCodeAt(start + 1) !== 0x5E
  /* ^ */
  ) {
    return false;
  }

  if (state.level >= state.options.maxNesting) {
    return false;
  }

  for (pos = start + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x20) {
      return false;
    }

    if (state.src.charCodeAt(pos) === 0x0A) {
      return false;
    }

    if (state.src.charCodeAt(pos) === 0x5D
    /* ] */
    ) {
      break;
    }
  }

  if (pos === start + 2) {
    return false;
  } // no empty footnote labels


  if (pos >= max) {
    return false;
  }

  pos++;
  label = state.src.slice(start + 2, pos - 1);

  if (typeof state.env.footnotes.refs[':' + label] === 'undefined') {
    return false;
  }

  if (!silent) {
    if (!state.env.footnotes.list) {
      state.env.footnotes.list = [];
    }

    if (state.env.footnotes.refs[':' + label] < 0) {
      footnoteId = state.env.footnotes.list.length;
      state.env.footnotes.list[footnoteId] = {
        label: label,
        count: 0
      };
      state.env.footnotes.refs[':' + label] = footnoteId;
    } else {
      footnoteId = state.env.footnotes.refs[':' + label];
    }

    footnoteSubId = state.env.footnotes.list[footnoteId].count;
    state.env.footnotes.list[footnoteId].count++;
    state.push({
      type: 'footnote_ref',
      id: footnoteId,
      subId: footnoteSubId,
      level: state.level
    });
  }

  state.pos = pos;
  state.posMax = max;
  return true;
} // List of valid url schemas, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#autolinks


var url_schemas = ['coap', 'doi', 'javascript', 'aaa', 'aaas', 'about', 'acap', 'cap', 'cid', 'crid', 'data', 'dav', 'dict', 'dns', 'file', 'ftp', 'geo', 'go', 'gopher', 'h323', 'http', 'https', 'iax', 'icap', 'im', 'imap', 'info', 'ipp', 'iris', 'iris.beep', 'iris.xpc', 'iris.xpcs', 'iris.lwz', 'ldap', 'mailto', 'mid', 'msrp', 'msrps', 'mtqp', 'mupdate', 'news', 'nfs', 'ni', 'nih', 'nntp', 'opaquelocktoken', 'pop', 'pres', 'rtsp', 'service', 'session', 'shttp', 'sieve', 'sip', 'sips', 'sms', 'snmp', 'soap.beep', 'soap.beeps', 'tag', 'tel', 'telnet', 'tftp', 'thismessage', 'tn3270', 'tip', 'tv', 'urn', 'vemmi', 'ws', 'wss', 'xcon', 'xcon-userid', 'xmlrpc.beep', 'xmlrpc.beeps', 'xmpp', 'z39.50r', 'z39.50s', 'adiumxtra', 'afp', 'afs', 'aim', 'apt', 'attachment', 'aw', 'beshare', 'bitcoin', 'bolo', 'callto', 'chrome', 'chrome-extension', 'com-eventbrite-attendee', 'content', 'cvs', 'dlna-playsingle', 'dlna-playcontainer', 'dtn', 'dvb', 'ed2k', 'facetime', 'feed', 'finger', 'fish', 'gg', 'git', 'gizmoproject', 'gtalk', 'hcp', 'icon', 'ipn', 'irc', 'irc6', 'ircs', 'itms', 'jar', 'jms', 'keyparc', 'lastfm', 'ldaps', 'magnet', 'maps', 'market', 'message', 'mms', 'ms-help', 'msnim', 'mumble', 'mvn', 'notes', 'oid', 'palm', 'paparazzi', 'platform', 'proxy', 'psyc', 'query', 'res', 'resource', 'rmi', 'rsync', 'rtmp', 'secondlife', 'sftp', 'sgn', 'skype', 'smb', 'soldat', 'spotify', 'ssh', 'steam', 'svn', 'teamspeak', 'things', 'udp', 'unreal', 'ut2004', 'ventrilo', 'view-source', 'webcal', 'wtai', 'wyciwyg', 'xfire', 'xri', 'ymsgr']; // Process autolinks '<protocol:...>'

/*eslint max-len:0*/

var EMAIL_RE = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;

function autolink(state, silent) {
  var tail,
      linkMatch,
      emailMatch,
      url,
      fullUrl,
      pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x3C
  /* < */
  ) {
    return false;
  }

  tail = state.src.slice(pos);

  if (tail.indexOf('>') < 0) {
    return false;
  }

  linkMatch = tail.match(AUTOLINK_RE);

  if (linkMatch) {
    if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) {
      return false;
    }

    url = linkMatch[0].slice(1, -1);
    fullUrl = normalizeLink(url);

    if (!state.parser.validateLink(url)) {
      return false;
    }

    if (!silent) {
      state.push({
        type: 'link_open',
        href: fullUrl,
        level: state.level
      });
      state.push({
        type: 'text',
        content: url,
        level: state.level + 1
      });
      state.push({
        type: 'link_close',
        level: state.level
      });
    }

    state.pos += linkMatch[0].length;
    return true;
  }

  emailMatch = tail.match(EMAIL_RE);

  if (emailMatch) {
    url = emailMatch[0].slice(1, -1);
    fullUrl = normalizeLink('mailto:' + url);

    if (!state.parser.validateLink(fullUrl)) {
      return false;
    }

    if (!silent) {
      state.push({
        type: 'link_open',
        href: fullUrl,
        level: state.level
      });
      state.push({
        type: 'text',
        content: url,
        level: state.level + 1
      });
      state.push({
        type: 'link_close',
        level: state.level
      });
    }

    state.pos += emailMatch[0].length;
    return true;
  }

  return false;
} // Regexps to match html elements


function replace$1(regex, options) {
  regex = regex.source;
  options = options || '';
  return function self(name, val) {
    if (!name) {
      return new RegExp(regex, options);
    }

    val = val.source || val;
    regex = regex.replace(name, val);
    return self;
  };
}

var attr_name = /[a-zA-Z_:][a-zA-Z0-9:._-]*/;
var unquoted = /[^"'=<>`\x00-\x20]+/;
var single_quoted = /'[^']*'/;
var double_quoted = /"[^"]*"/;
/*eslint no-spaced-func:0*/

var attr_value = replace$1(/(?:unquoted|single_quoted|double_quoted)/)('unquoted', unquoted)('single_quoted', single_quoted)('double_quoted', double_quoted)();
var attribute = replace$1(/(?:\s+attr_name(?:\s*=\s*attr_value)?)/)('attr_name', attr_name)('attr_value', attr_value)();
var open_tag = replace$1(/<[A-Za-z][A-Za-z0-9]*attribute*\s*\/?>/)('attribute', attribute)();
var close_tag = /<\/[A-Za-z][A-Za-z0-9]*\s*>/;
var comment = /<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->/;
var processing = /<[?].*?[?]>/;
var declaration = /<![A-Z]+\s+[^>]*>/;
var cdata = /<!\[CDATA\[[\s\S]*?\]\]>/;
var HTML_TAG_RE = replace$1(/^(?:open_tag|close_tag|comment|processing|declaration|cdata)/)('open_tag', open_tag)('close_tag', close_tag)('comment', comment)('processing', processing)('declaration', declaration)('cdata', cdata)(); // Process html tags

function isLetter$2(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case

  return lc >= 0x61
  /* a */
  && lc <= 0x7a
  /* z */
  ;
}

function htmltag(state, silent) {
  var ch,
      match,
      max,
      pos = state.pos;

  if (!state.options.html) {
    return false;
  } // Check start


  max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x3C
  /* < */
  || pos + 2 >= max) {
    return false;
  } // Quick fail on second char


  ch = state.src.charCodeAt(pos + 1);

  if (ch !== 0x21
  /* ! */
  && ch !== 0x3F
  /* ? */
  && ch !== 0x2F
  /* / */
  && !isLetter$2(ch)) {
    return false;
  }

  match = state.src.slice(pos).match(HTML_TAG_RE);

  if (!match) {
    return false;
  }

  if (!silent) {
    state.push({
      type: 'htmltag',
      content: state.src.slice(pos, pos + match[0].length),
      level: state.level
    });
  }

  state.pos += match[0].length;
  return true;
} // Process html entity - &#123;, &#xAF;, &quot;, ...


var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;

function entity(state, silent) {
  var ch,
      code,
      match,
      pos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26
  /* & */
  ) {
    return false;
  }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23
    /* # */
    ) {
      match = state.src.slice(pos).match(DIGITAL_RE);

      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }

        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);

      if (match) {
        var decoded = decodeEntity(match[1]);

        if (match[1] !== decoded) {
          if (!silent) {
            state.pending += decoded;
          }

          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) {
    state.pending += '&';
  }

  state.pos++;
  return true;
}
/**
 * Inline Parser `rules`
 */


var _rules$2 = [['text', text], ['newline', newline], ['escape', escape], ['backticks', backticks], ['del', del], ['ins', ins], ['mark', mark], ['emphasis', emphasis], ['sub', sub], ['sup', sup], ['links', links], ['footnote_inline', footnote_inline], ['footnote_ref', footnote_ref], ['autolink', autolink], ['htmltag', htmltag], ['entity', entity]];
/**
 * Inline Parser class. Note that link validation is stricter
 * in Remarkable than what is specified by CommonMark. If you
 * want to change this you can use a custom validator.
 *
 * @api private
 */

function ParserInline() {
  this.ruler = new Ruler();

  for (var i = 0; i < _rules$2.length; i++) {
    this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
  } // Can be overridden with a custom validator


  this.validateLink = validateLink;
}
/**
 * Skip a single token by running all rules in validation mode.
 * Returns `true` if any rule reports success.
 *
 * @param  {Object} `state`
 * @api privage
 */


ParserInline.prototype.skipToken = function (state) {
  var rules = this.ruler.getRules('');
  var len = rules.length;
  var pos = state.pos;
  var i, cached_pos;

  if ((cached_pos = state.cacheGet(pos)) > 0) {
    state.pos = cached_pos;
    return;
  }

  for (i = 0; i < len; i++) {
    if (rules[i](state, true)) {
      state.cacheSet(pos, state.pos);
      return;
    }
  }

  state.pos++;
  state.cacheSet(pos, state.pos);
};
/**
 * Generate tokens for the given input range.
 *
 * @param  {Object} `state`
 * @api private
 */


ParserInline.prototype.tokenize = function (state) {
  var rules = this.ruler.getRules('');
  var len = rules.length;
  var end = state.posMax;
  var ok, i;

  while (state.pos < end) {
    // Try all possible rules.
    // On success, the rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true
    for (i = 0; i < len; i++) {
      ok = rules[i](state, false);

      if (ok) {
        break;
      }
    }

    if (ok) {
      if (state.pos >= end) {
        break;
      }

      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};
/**
 * Parse the given input string.
 *
 * @param  {String} `str`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @param  {Array} `outTokens`
 * @api private
 */


ParserInline.prototype.parse = function (str, options, env, outTokens) {
  var state = new StateInline(str, this, options, env, outTokens);
  this.tokenize(state);
};
/**
 * Validate the given `url` by checking for bad protocols.
 *
 * @param  {String} `url`
 * @return {Boolean}
 */


function validateLink(url) {
  var BAD_PROTOCOLS = ['vbscript', 'javascript', 'file', 'data'];
  var str = url.trim().toLowerCase(); // Care about digital entities "javascript&#x3A;alert(1)"

  str = replaceEntities(str);

  if (str.indexOf(':') !== -1 && BAD_PROTOCOLS.indexOf(str.split(':')[0]) !== -1) {
    return false;
  }

  return true;
} // Remarkable default options


var defaultConfig = {
  options: {
    html: false,
    // Enable HTML tags in source
    xhtmlOut: false,
    // Use '/' to close single tags (<br />)
    breaks: false,
    // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-',
    // CSS language prefix for fenced blocks
    linkTarget: '',
    // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    maxNesting: 20 // Internal protection, recursion limit

  },
  components: {
    core: {
      rules: ['block', 'inline', 'references', 'replacements', 'smartquotes', 'references', 'abbr2', 'footnote_tail']
    },
    block: {
      rules: ['blockquote', 'code', 'fences', 'footnote', 'heading', 'hr', 'htmlblock', 'lheading', 'list', 'paragraph', 'table']
    },
    inline: {
      rules: ['autolink', 'backticks', 'del', 'emphasis', 'entity', 'escape', 'footnote_ref', 'htmltag', 'links', 'newline', 'text']
    }
  }
}; // Remarkable default options

var fullConfig = {
  options: {
    html: false,
    // Enable HTML tags in source
    xhtmlOut: false,
    // Use '/' to close single tags (<br />)
    breaks: false,
    // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-',
    // CSS language prefix for fenced blocks
    linkTarget: '',
    // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    maxNesting: 20 // Internal protection, recursion limit

  },
  components: {
    // Don't restrict core/block/inline rules
    core: {},
    block: {},
    inline: {}
  }
}; // Commonmark default options

var commonmarkConfig = {
  options: {
    html: true,
    // Enable HTML tags in source
    xhtmlOut: true,
    // Use '/' to close single tags (<br />)
    breaks: false,
    // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-',
    // CSS language prefix for fenced blocks
    linkTarget: '',
    // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    maxNesting: 20 // Internal protection, recursion limit

  },
  components: {
    core: {
      rules: ['block', 'inline', 'references', 'abbr2']
    },
    block: {
      rules: ['blockquote', 'code', 'fences', 'heading', 'hr', 'htmlblock', 'lheading', 'list', 'paragraph']
    },
    inline: {
      rules: ['autolink', 'backticks', 'emphasis', 'entity', 'escape', 'htmltag', 'links', 'newline', 'text']
    }
  }
};
/**
 * Preset configs
 */

var config = {
  'default': defaultConfig,
  'full': fullConfig,
  'commonmark': commonmarkConfig
};
/**
 * The `StateCore` class manages state.
 *
 * @param {Object} `instance` Remarkable instance
 * @param {String} `str` Markdown string
 * @param {Object} `env`
 */

function StateCore(instance, str, env) {
  this.src = str;
  this.env = env;
  this.options = instance.options;
  this.tokens = [];
  this.inlineMode = false;
  this.inline = instance.inline;
  this.block = instance.block;
  this.renderer = instance.renderer;
  this.typographer = instance.typographer;
}
/**
 * The main `Remarkable` class. Create an instance of
 * `Remarkable` with a `preset` and/or `options`.
 *
 * @param {String} `preset` If no preset is given, `default` is used.
 * @param {Object} `options`
 */


function Remarkable(preset, options) {
  if (typeof preset !== 'string') {
    options = preset;
    preset = 'default';
  }

  if (options && options.linkify != null) {
    console.warn('linkify option is removed. Use linkify plugin instead:\n\n' + 'import Remarkable from \'remarkable\';\n' + 'import linkify from \'remarkable/linkify\';\n' + 'new Remarkable().use(linkify)\n');
  }

  this.inline = new ParserInline();
  this.block = new ParserBlock();
  this.core = new Core();
  this.renderer = new Renderer();
  this.ruler = new Ruler();
  this.options = {};
  this.configure(config[preset]);
  this.set(options || {});
}
/**
 * Set options as an alternative to passing them
 * to the constructor.
 *
 * ```js
 * md.set({typographer: true});
 * ```
 * @param {Object} `options`
 * @api public
 */


Remarkable.prototype.set = function (options) {
  assign(this.options, options);
};
/**
 * Batch loader for components rules states, and options
 *
 * @param  {Object} `presets`
 */


Remarkable.prototype.configure = function (presets) {
  var self = this;

  if (!presets) {
    throw new Error('Wrong `remarkable` preset, check name/content');
  }

  if (presets.options) {
    self.set(presets.options);
  }

  if (presets.components) {
    Object.keys(presets.components).forEach(function (name) {
      if (presets.components[name].rules) {
        self[name].ruler.enable(presets.components[name].rules, true);
      }
    });
  }
};
/**
 * Use a plugin.
 *
 * ```js
 * var md = new Remarkable();
 *
 * md.use(plugin1)
 *   .use(plugin2, opts)
 *   .use(plugin3);
 * ```
 *
 * @param  {Function} `plugin`
 * @param  {Object} `options`
 * @return {Object} `Remarkable` for chaining
 */


Remarkable.prototype.use = function (plugin, options) {
  plugin(this, options);
  return this;
};
/**
 * Parse the input `string` and return a tokens array.
 * Modifies `env` with definitions data.
 *
 * @param  {String} `string`
 * @param  {Object} `env`
 * @return {Array} Array of tokens
 */


Remarkable.prototype.parse = function (str, env) {
  var state = new StateCore(this, str, env);
  this.core.process(state);
  return state.tokens;
};
/**
 * The main `.render()` method that does all the magic :)
 *
 * @param  {String} `string`
 * @param  {Object} `env`
 * @return {String} Rendered HTML.
 */


Remarkable.prototype.render = function (str, env) {
  env = env || {};
  return this.renderer.render(this.parse(str, env), this.options, env);
};
/**
 * Parse the given content `string` as a single string.
 *
 * @param  {String} `string`
 * @param  {Object} `env`
 * @return {Array} Array of tokens
 */


Remarkable.prototype.parseInline = function (str, env) {
  var state = new StateCore(this, str, env);
  state.inlineMode = true;
  this.core.process(state);
  return state.tokens;
};
/**
 * Render a single content `string`, without wrapping it
 * to paragraphs
 *
 * @param  {String} `str`
 * @param  {Object} `env`
 * @return {String}
 */


Remarkable.prototype.renderInline = function (str, env) {
  env = env || {};
  return this.renderer.render(this.parseInline(str, env), this.options, env);
};

/**
 * Plugin for Remarkable Markdown processor which transforms $..$ and $$..$$ sequences into math HTML using the
 * Katex package.
 */

const rkatex = (md, options) => {
  const backslash = '\\';
  const dollar = '$';
  const opts = options || {};
  const delimiter = opts.delimiter || dollar;

  if (delimiter.length !== 1) {
    throw new Error('invalid delimiter');
  }

  const katex = require$$0__default;
  /**
   * Render the contents as KaTeX
   */


  const renderKatex = (source, displayMode) => katex.renderToString(source, {
    displayMode: displayMode,
    throwOnError: false
  });
  /**
   * Parse '$$' as a block. Based off of similar method in remarkable.
   */


  const parseBlockKatex = (state, startLine, endLine) => {
    let haveEndMarker = false;
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    if (pos + 1 > max) {
      return false;
    }

    const marker = state.src.charAt(pos);

    if (marker !== delimiter) {
      return false;
    } // scan marker length


    let mem = pos;
    pos = state.skipChars(pos, marker);
    let len = pos - mem;

    if (len !== 2) {
      return false;
    } // search end of block


    let nextLine = startLine;

    for (;;) {
      ++nextLine;

      if (nextLine >= endLine) {
        break;
      }

      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.tShift[nextLine] < state.blkIndent) {
        break;
      }

      if (state.src.charAt(pos) !== delimiter) {
        continue;
      }

      if (state.tShift[nextLine] - state.blkIndent >= 4) {
        continue;
      }

      pos = state.skipChars(pos, marker);

      if (pos - mem < len) {
        continue;
      }

      pos = state.skipSpaces(pos);

      if (pos < max) {
        continue;
      }

      haveEndMarker = true;
      break;
    } // If a fence has heading spaces, they should be removed from its inner block


    len = state.tShift[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);
    const content = state.getLines(startLine + 1, nextLine, len, true).replace(/[ \n]+/g, ' ').trim();
    state.tokens.push({
      type: 'katex',
      params: null,
      content: content,
      lines: [startLine, state.line],
      level: state.level,
      block: true
    });
    return true;
  };
  /**
   * Look for '$' or '$$' spans in Markdown text. Based off of the 'fenced' parser in remarkable.
   */


  const parseInlineKatex = (state, silent) => {
    const start = state.pos;
    const max = state.posMax;
    let pos = start; // Unexpected starting character

    if (state.src.charAt(pos) !== delimiter) {
      return false;
    }

    ++pos;

    while (pos < max && state.src.charAt(pos) === delimiter) {
      ++pos;
    } // Capture the length of the starting delimiter -- closing one must match in size


    const marker = state.src.slice(start, pos);

    if (marker.length > 2) {
      return false;
    }

    const spanStart = pos;
    let escapedDepth = 0;

    while (pos < max) {
      const char = state.src.charAt(pos);

      if (char === '{' && (pos == 0 || state.src.charAt(pos - 1) != backslash)) {
        escapedDepth += 1;
      } else if (char === '}' && (pos == 0 || state.src.charAt(pos - 1) != backslash)) {
        escapedDepth -= 1;

        if (escapedDepth < 0) {
          return false;
        }
      } else if (char === delimiter && escapedDepth === 0) {
        const matchStart = pos;
        let matchEnd = pos + 1;

        while (matchEnd < max && state.src.charAt(matchEnd) === delimiter) {
          ++matchEnd;
        }

        if (matchEnd - matchStart === marker.length) {
          if (!silent) {
            const content = state.src.slice(spanStart, matchStart).replace(/[ \n]+/g, ' ').trim();
            state.push({
              type: 'katex',
              content: content,
              block: marker.length > 1,
              level: state.level
            });
          }

          state.pos = matchEnd;
          return true;
        }
      }

      pos += 1;
    }

    if (!silent) {
      state.pending += marker;
    }

    state.pos += marker.length;
    return true;
  };

  md.inline.ruler.push('katex', parseInlineKatex, options);
  md.block.ruler.push('katex', parseBlockKatex, options);

  md.renderer.rules.katex = (tokens, idx) => renderKatex(tokens[idx].content, tokens[idx].block);

  md.renderer.rules.katex.delimiter = delimiter;
};

var remarkableKatex = rkatex;

let loading$1;

const autoload$1 = () => {
  loading$1 || (loading$1 = loadJS([{
    type: 'script',
    data: {
      src: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js'
    }
  }]));
  return loading$1;
};

const name$2 = 'katex';
function transform$2(transformHooks) {
  const renderKatex = (source, displayMode) => {
    const {
      katex
    } = window;

    if (katex) {
      return katex.renderToString(source, {
        displayMode,
        throwOnError: false
      });
    }

    autoload$1().then(() => {
      transformHooks.retransform.call();
    });
    return source;
  };

  let enableFeature = () => {};

  transformHooks.parser.tap(md => {
    md.use(remarkableKatex);

    md.renderer.rules.katex = (tokens, idx) => {
      enableFeature();
      const result = renderKatex(tokens[idx].content, tokens[idx].block);
      return result;
    };
  });
  transformHooks.transform.tap((_, context) => {
    enableFeature = () => {
      context.features[name$2] = true;
    };
  });
  return {
    styles: [{
      type: 'stylesheet',
      data: {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css'
      }
    }],
    scripts: [{
      type: 'iife',
      data: {
        fn: getMarkmap => {
          window.WebFontConfig = {
            custom: {
              families: ['KaTeX_AMS', 'KaTeX_Caligraphic:n4,n7', 'KaTeX_Fraktur:n4,n7', 'KaTeX_Main:n4,n7,i4,i7', 'KaTeX_Math:i4,i7', 'KaTeX_Script', 'KaTeX_SansSerif:n4,n7,i4', 'KaTeX_Size1', 'KaTeX_Size2', 'KaTeX_Size3', 'KaTeX_Size4', 'KaTeX_Typewriter']
            },
            active: () => {
              getMarkmap().refreshHook.call();
            }
          };
        },

        getParams({
          getMarkmap
        }) {
          return [getMarkmap];
        }

      }
    }, {
      type: 'script',
      data: {
        src: 'https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js',
        defer: true
      }
    }]
  };
}

var katex = /*#__PURE__*/Object.freeze({
__proto__: null,
name: name$2,
transform: transform$2
});

let loading;

const autoload = () => {
  loading || (loading = loadJS([{
    type: 'script',
    data: {
      src: `https://cdn.jsdelivr.net/npm/prismjs@${"1.28.0"}/components/prism-core.min.js`
    }
  }, {
    type: 'script',
    data: {
      src: `https://cdn.jsdelivr.net/npm/prismjs@${"1.28.0"}/plugins/autoloader/prism-autoloader.min.js`
    }
  }]));
  return loading;
};

function loadLanguageAndRefresh(lang, transformHooks) {
  autoload().then(() => {
    window.Prism.plugins.autoloader.loadLanguages([lang], () => {
      transformHooks.retransform.call();
    });
  });
}

const name$1 = 'prism';
function transform$1(transformHooks) {
  let enableFeature = () => {};

  transformHooks.parser.tap(md => {
    md.set({
      highlight: (str, lang) => {
        var _Prism$languages;

        enableFeature();
        const {
          Prism
        } = window;
        const grammar = Prism == null ? void 0 : (_Prism$languages = Prism.languages) == null ? void 0 : _Prism$languages[lang];

        if (!grammar) {
          loadLanguageAndRefresh(lang, transformHooks);
          return '';
        }

        return Prism.highlight(str, grammar, lang);
      }
    });
  });
  transformHooks.transform.tap((_, context) => {
    enableFeature = () => {
      context.features[name$1] = true;
    };
  });
  return {
    styles: [{
      type: 'stylesheet',
      data: {
        href: `https://cdn.jsdelivr.net/npm/prismjs@${"1.28.0"}/themes/prism.css`
      }
    }]
  };
}

var prism = /*#__PURE__*/Object.freeze({
__proto__: null,
name: name$1,
transform: transform$1
});

/*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return typeof subject === 'undefined' || subject === null;
}

function isObject(subject) {
  return typeof subject === 'object' && subject !== null;
}

function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;else if (isNothing(sequence)) return [];
  return [sequence];
}

function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}

function repeat(string, count) {
  var result = '',
      cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}

function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}

var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
}; // YAML error class. http://stackoverflow.com/questions/8458984

function formatError(exception, compact) {
  var where = '',
      message = exception.reason || '(unknown reason)';
  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}

function YAMLException$1(reason, mark) {
  // Super constructor
  Error.call(this);
  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false); // Include stack trace in error object

  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = new Error().stack || '';
  }
} // Inherit from Error


YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;

YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};

var exception = YAMLException$1; // get snippet for a single line, respecting maxLength

function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position

  };
}

function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}

function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== 'number') options.indent = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter !== 'number') options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = '',
      i,
      line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}

var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = ['kind', 'multi', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'representName', 'defaultStyle', 'styleAliases'];
var YAML_NODE_KINDS = ['scalar', 'sequence', 'mapping'];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  }); // TODO: Add tag format check.

  this.options = options; // keep original options in case user wants to extend this type later

  this.tag = tag;
  this.kind = options['kind'] || null;

  this.resolve = options['resolve'] || function () {
    return true;
  };

  this.construct = options['construct'] || function (data) {
    return data;
  };

  this.instanceOf = options['instanceOf'] || null;
  this.predicate = options['predicate'] || null;
  this.represent = options['represent'] || null;
  this.representName = options['representName'] || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.multi = options['multi'] || false;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

var type = Type$1;
/*eslint-disable max-len*/

function compileList(schema, name) {
  var result = [];
  schema[name].forEach(function (currentType) {
    var newIndex = result.length;
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}

function
  /* lists... */
compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  },
      index,
      length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }

  return result;
}

function Schema$1(definition) {
  return this.extend(definition);
}

Schema$1.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof type) {
    // Schema.extend(type)
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception('Schema.extend argument should be a Type, [ Type ], ' + 'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type$1.loadKind && type$1.loadKind !== 'scalar') {
      throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type$1.multi) {
      throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });
  explicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};

var schema = Schema$1;
var str = new type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) {
    return data !== null ? data : '';
  }
});
var seq = new type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) {
    return data !== null ? data : [];
  }
});
var map = new type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [str, seq, map]
});

function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === '~' || max === 4 && (data === 'null' || data === 'Null' || data === 'NULL');
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

var _null = new type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () {
      return '~';
    },
    lowercase: function () {
      return 'null';
    },
    uppercase: function () {
      return 'NULL';
    },
    camelcase: function () {
      return 'Null';
    },
    empty: function () {
      return '';
    }
  },
  defaultStyle: 'lowercase'
});

function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === 'true' || data === 'True' || data === 'TRUE') || max === 5 && (data === 'false' || data === 'False' || data === 'FALSE');
}

function constructYamlBoolean(data) {
  return data === 'true' || data === 'True' || data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

var bool = new type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) {
      return object ? 'true' : 'false';
    },
    uppercase: function (object) {
      return object ? 'TRUE' : 'FALSE';
    },
    camelcase: function (object) {
      return object ? 'True' : 'False';
    }
  },
  defaultStyle: 'lowercase'
});

function isHexCode(c) {
  return 0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  || 0x41
  /* A */
  <= c && c <= 0x46
  /* F */
  || 0x61
  /* a */
  <= c && c <= 0x66
  /* f */
  ;
}

function isOctCode(c) {
  return 0x30
  /* 0 */
  <= c && c <= 0x37
  /* 7 */
  ;
}

function isDecCode(c) {
  return 0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  ;
}

function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;
  if (!max) return false;
  ch = data[index]; // sign

  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index]; // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }

      return hasDigits && ch !== '_';
    }

    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }

      return hasDigits && ch !== '_';
    }

    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }

      return hasDigits && ch !== '_';
    }
  } // base 10 (except 0)
  // value should not start with `_`;


  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;

    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }

    hasDigits = true;
  } // Should have digits and should not end with `_`


  if (!hasDigits || ch === '_') return false;
  return true;
}

function constructYamlInteger(data) {
  var value = data,
      sign = 1,
      ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return Object.prototype.toString.call(object) === '[object Number]' && object % 1 === 0 && !common.isNegativeZero(object);
}

var int = new type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function (obj) {
      return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1);
    },
    octal: function (obj) {
      return obj >= 0 ? '0o' + obj.toString(8) : '-0o' + obj.toString(8).slice(1);
    },
    decimal: function (obj) {
      return obj.toString(10);
    },

    /* eslint-disable max-len */
    hexadecimal: function (obj) {
      return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() : '-0x' + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary: [2, 'bin'],
    octal: [8, 'oct'],
    decimal: [10, 'dec'],
    hexadecimal: [16, 'hex']
  }
});
var YAML_FLOAT_PATTERN = new RegExp( // 2.5e4, 2.5 and integers
'^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' + // .2e4, .2
// special case, seems not from spec
'|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' + // .inf
'|[-+]?\\.(?:inf|Inf|INF)' + // .nan
'|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, '').toLowerCase();
  sign = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === '.nan') {
    return NaN;
  }

  return sign * parseFloat(value, 10);
}

var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase':
        return '.nan';

      case 'uppercase':
        return '.NAN';

      case 'camelcase':
        return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase':
        return '.inf';

      case 'uppercase':
        return '.INF';

      case 'camelcase':
        return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase':
        return '-.inf';

      case 'uppercase':
        return '-.INF';

      case 'camelcase':
        return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10); // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return Object.prototype.toString.call(object) === '[object Number]' && (object % 1 !== 0 || common.isNegativeZero(object));
}

var float = new type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});
var json = failsafe.extend({
  implicit: [_null, bool, int, float]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
'-([0-9][0-9])' + // [2] month
'-([0-9][0-9])$'); // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
'-([0-9][0-9]?)' + // [2] month
'-([0-9][0-9]?)' + // [3] day
'(?:[Tt]|[ \\t]+)' + // ...
'([0-9][0-9]?)' + // [4] hour
':([0-9][0-9])' + // [5] minute
':([0-9][0-9])' + // [6] second
'(?:\\.([0-9]*))?' + // [7] fraction
'(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
'(?::([0-9][0-9]))?))?$'); // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match,
      year,
      month,
      day,
      hour,
      minute,
      second,
      fraction = 0,
      delta = null,
      tz_hour,
      tz_minute,
      date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error('Date resolve error'); // match: [1] year [2] month [3] day

  year = +match[1];
  month = +match[2] - 1; // JS month starts with 0

  day = +match[3];

  if (!match[4]) {
    // no hour
    return new Date(Date.UTC(year, month, day));
  } // match: [4] hour [5] minute [6] second [7] fraction


  hour = +match[4];
  minute = +match[5];
  second = +match[6];

  if (match[7]) {
    fraction = match[7].slice(0, 3);

    while (fraction.length < 3) {
      // milli-seconds
      fraction += '0';
    }

    fraction = +fraction;
  } // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute


  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds

    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}

function representYamlTimestamp(object
/*, style*/
) {
  return object.toISOString();
}

var timestamp = new type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

var merge = new type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});
/*eslint-disable no-bitwise*/
// [ 64, 65, 66 ] -> [ padding, CR, LF ]

var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';

function resolveYamlBinary(data) {
  if (data === null) return false;
  var code,
      idx,
      bitlen = 0,
      max = data.length,
      map = BASE64_MAP; // Convert one by one.

  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx)); // Skip CR/LF

    if (code > 64) continue; // Fail on illegal characters

    if (code < 0) return false;
    bitlen += 6;
  } // If there are any bits left, source was corrupted


  return bitlen % 8 === 0;
}

function constructYamlBinary(data) {
  var idx,
      tailbits,
      input = data.replace(/[\r\n=]/g, ''),
      // remove CR/LF & padding to simplify scan
  max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = []; // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 0xFF);
      result.push(bits >> 8 & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = bits << 6 | map.indexOf(input.charAt(idx));
  } // Dump tail


  tailbits = max % 4 * 6;

  if (tailbits === 0) {
    result.push(bits >> 16 & 0xFF);
    result.push(bits >> 8 & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 0xFF);
    result.push(bits >> 2 & 0xFF);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object
/*, style*/
) {
  var result = '',
      bits = 0,
      idx,
      tail,
      max = object.length,
      map = BASE64_MAP; // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map[bits >> 18 & 0x3F];
      result += map[bits >> 12 & 0x3F];
      result += map[bits >> 6 & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  } // Dump tail


  tail = max % 3;

  if (tail === 0) {
    result += map[bits >> 18 & 0x3F];
    result += map[bits >> 12 & 0x3F];
    result += map[bits >> 6 & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[bits >> 10 & 0x3F];
    result += map[bits >> 4 & 0x3F];
    result += map[bits << 2 & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[bits >> 2 & 0x3F];
    result += map[bits << 4 & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) === '[object Uint8Array]';
}

var binary = new type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [],
      index,
      length,
      pair,
      pairKey,
      pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;else return false;
      }
    }

    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

var omap = new type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;
  var index,
      length,
      pair,
      keys,
      result,
      object = data;
  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== '[object Object]') return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];
  var index,
      length,
      pair,
      keys,
      result,
      object = data;
  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }

  return result;
}

var pairs = new type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;
  var key,
      object = data;

  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

var set = new type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

var _default = core.extend({
  implicit: [timestamp, merge],
  explicit: [binary, omap, pairs, set]
});
/*eslint-disable max-len,no-use-before-define*/


var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;

function _class(obj) {
  return Object.prototype.toString.call(obj);
}

function is_EOL(c) {
  return c === 0x0A
  /* LF */
  || c === 0x0D
  /* CR */
  ;
}

function is_WHITE_SPACE(c) {
  return c === 0x09
  /* Tab */
  || c === 0x20
  /* Space */
  ;
}

function is_WS_OR_EOL(c) {
  return c === 0x09
  /* Tab */
  || c === 0x20
  /* Space */
  || c === 0x0A
  /* LF */
  || c === 0x0D
  /* CR */
  ;
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C
  /* , */
  || c === 0x5B
  /* [ */
  || c === 0x5D
  /* ] */
  || c === 0x7B
  /* { */
  || c === 0x7D
  /* } */
  ;
}

function fromHexCode(c) {
  var lc;

  if (0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  ) {
    return c - 0x30;
  }
  /*eslint-disable no-bitwise*/


  lc = c | 0x20;

  if (0x61
  /* a */
  <= lc && lc <= 0x66
  /* f */
  ) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78
  /* x */
  ) {
    return 2;
  }

  if (c === 0x75
  /* u */
  ) {
    return 4;
  }

  if (c === 0x55
  /* U */
  ) {
    return 8;
  }

  return 0;
}

function fromDecimalCode(c) {
  if (0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  ) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return c === 0x30
  /* 0 */
  ? '\x00' : c === 0x61
  /* a */
  ? '\x07' : c === 0x62
  /* b */
  ? '\x08' : c === 0x74
  /* t */
  ? '\x09' : c === 0x09
  /* Tab */
  ? '\x09' : c === 0x6E
  /* n */
  ? '\x0A' : c === 0x76
  /* v */
  ? '\x0B' : c === 0x66
  /* f */
  ? '\x0C' : c === 0x72
  /* r */
  ? '\x0D' : c === 0x65
  /* e */
  ? '\x1B' : c === 0x20
  /* Space */
  ? ' ' : c === 0x22
  /* " */
  ? '\x22' : c === 0x2F
  /* / */
  ? '/' : c === 0x5C
  /* \ */
  ? '\x5C' : c === 0x4E
  /* N */
  ? '\x85' : c === 0x5F
  /* _ */
  ? '\xA0' : c === 0x4C
  /* L */
  ? '\u2028' : c === 0x50
  /* P */
  ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  } // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF


  return String.fromCharCode((c - 0x010000 >> 10) + 0xD800, (c - 0x010000 & 0x03FF) + 0xDC00);
}

var simpleEscapeCheck = new Array(256); // integer, for fast access

var simpleEscapeMap = new Array(256);

for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}

function State$1(input, options) {
  this.input = input;
  this.filename = options['filename'] || null;
  this.schema = options['schema'] || _default;
  this.onWarning = options['onWarning'] || null; // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive

  this.legacy = options['legacy'] || false;
  this.json = options['json'] || false;
  this.listener = options['listener'] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0; // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation

  this.firstTabInLine = -1;
  this.documents = [];
  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/
}

function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}

var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = minor < 2;

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};

function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);

        if (!(_character === 0x09 || 0x20 <= _character && _character <= 0x10FFFF)) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity; // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).

  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  } // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)


  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }

  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    } // used for this specific key only because Object.defineProperty is slow


    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }

    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A
  /* LF */
  ) {
    state.position++;
  } else if (ch === 0x0D
  /* CR */
  ) {
    state.position++;

    if (state.input.charCodeAt(state.position) === 0x0A
    /* LF */
    ) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09
      /* Tab */
      && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23
    /* # */
    ) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A
      /* LF */
      && ch !== 0x0D
      /* CR */
      && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20
      /* Space */
      ) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;
  ch = state.input.charCodeAt(_position); // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.

  if ((ch === 0x2D
  /* - */
  || ch === 0x2E
  /* . */
  ) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}

function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 0x23
  /* # */
  || ch === 0x26
  /* & */
  || ch === 0x2A
  /* * */
  || ch === 0x21
  /* ! */
  || ch === 0x7C
  /* | */
  || ch === 0x3E
  /* > */
  || ch === 0x27
  /* ' */
  || ch === 0x22
  /* " */
  || ch === 0x25
  /* % */
  || ch === 0x40
  /* @ */
  || ch === 0x60
  /* ` */
  ) {
    return false;
  }

  if (ch === 0x3F
  /* ? */
  || ch === 0x2D
  /* - */
  ) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A
    /* : */
    ) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 0x23
    /* # */
    ) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27
  /* ' */
  ) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27
    /* ' */
    ) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27
      /* ' */
      ) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22
  /* " */
  ) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22
    /* " */
    ) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 0x5C
    /* \ */
    ) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent); // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag = state.tag,
      _result,
      _anchor = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B
  /* [ */
  ) {
    terminator = 0x5D;
    /* ] */

    isMapping = false;
    _result = [];
  } else if (ch === 0x7B
  /* { */
  ) {
    terminator = 0x7D;
    /* } */

    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C
    /* , */
    ) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F
    /* ? */
    ) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.

    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A
    /* : */
    ) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C
    /* , */
    ) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent = nodeIndent,
      emptyLines = 0,
      atMoreIndented = false,
      tmp,
      ch;
  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C
  /* | */
  ) {
    folding = false;
  } else if (ch === 0x3E
  /* > */
  ) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B
    /* + */
    || ch === 0x2D
    /* - */
    ) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 0x2B
        /* + */
        ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }
    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));

    if (ch === 0x23
    /* # */
    ) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20
    /* Space */
    ) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    } // End of the scalar.


    if (state.lineIndent < textIndent) {
      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      } // Break this `while` cycle and go to the funciton's epilogue.


      break;
    } // Folded style: use fancy rules to handle line breaks.


    if (folding) {
      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true; // except for the first content line (cf. Example 8.1)

        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines); // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1); // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) {
          // i.e. only if we have already read some scalar content.
          state.result += ' ';
        } // Several line breaks - perceive as different lines.

      } else {
        state.result += common.repeat('\n', emptyLines);
      } // Literal style: just add exact number of line breaks between content lines.

    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag = state.tag,
      _anchor = state.anchor,
      _result = [],
      following,
      detected = false,
      ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar


  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D
    /* - */
    ) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);

        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);

    _result.push(state.result);

    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }

  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag = state.tag,
      _anchor = state.anchor,
      _result = {},
      overridableKeys = Object.create(null),
      keyTag = null,
      keyNode = null,
      valueNode = null,
      atExplicitKey = false,
      detected = false,
      ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar


  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.
    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //

    if ((ch === 0x3F
    /* ? */
    || ch === 0x3A
    /* : */
    ) && is_WS_OR_EOL(following)) {
      if (ch === 0x3F
      /* ? */
      ) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following; //
      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
      //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A
        /* : */
        ) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }
      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    } //
    // Common reading code for both explicit and implicit notations.
    //


    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  } //
  // Epilogue.
  //
  // Special case: last mapping's node contains only the key in explicit notation.


  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  } // Expose the resulting mapping.


  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x21
  /* ! */
  ) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C
  /* < */
  ) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 0x21
  /* ! */
  ) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 0x3E
    /* > */
    );

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 0x21
      /* ! */
      ) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;
  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position, ch;

  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x26
  /* & */
  ) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias, ch;

  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x2A
  /* * */
  ) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1,
      // 1: this>parent, 0: this=parent, -1: this<parent
  atNewLine = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) {
        // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }

        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) {
      // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);

      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }

  return state.tag !== null || state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25
    /* % */
    ) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23
      /* # */
      ) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));

        break;
      }

      if (is_EOL(ch)) break;
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2D
  /* - */
  && state.input.charCodeAt(state.position + 1) === 0x2D
  /* - */
  && state.input.charCodeAt(state.position + 2) === 0x2D
  /* - */
  ) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 0x2E
    /* . */
    ) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }

    return;
  }

  if (state.position < state.length - 1) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}

function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {
    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A
    /* LF */
    && input.charCodeAt(input.length - 1) !== 0x0D
    /* CR */
    ) {
      input += '\n';
    } // Strip BOM


    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State$1(input, options);
  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  } // Use 0 as string terminator. That significantly simplifies bounds check.


  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20
  /* Space */
  ) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < state.length - 1) {
    readDocument(state);
  }

  return state.documents;
}

function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}

function load$1(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }

  throw new exception('expected a single document in the stream, but found more');
}

var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
/*eslint-disable no-use-before-define*/

var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 0xFEFF;
var CHAR_TAB = 0x09;
/* Tab */

var CHAR_LINE_FEED = 0x0A;
/* LF */

var CHAR_CARRIAGE_RETURN = 0x0D;
/* CR */

var CHAR_SPACE = 0x20;
/* Space */

var CHAR_EXCLAMATION = 0x21;
/* ! */

var CHAR_DOUBLE_QUOTE = 0x22;
/* " */

var CHAR_SHARP = 0x23;
/* # */

var CHAR_PERCENT = 0x25;
/* % */

var CHAR_AMPERSAND = 0x26;
/* & */

var CHAR_SINGLE_QUOTE = 0x27;
/* ' */

var CHAR_ASTERISK = 0x2A;
/* * */

var CHAR_COMMA = 0x2C;
/* , */

var CHAR_MINUS = 0x2D;
/* - */

var CHAR_COLON = 0x3A;
/* : */

var CHAR_EQUALS = 0x3D;
/* = */

var CHAR_GREATER_THAN = 0x3E;
/* > */

var CHAR_QUESTION = 0x3F;
/* ? */

var CHAR_COMMERCIAL_AT = 0x40;
/* @ */

var CHAR_LEFT_SQUARE_BRACKET = 0x5B;
/* [ */

var CHAR_RIGHT_SQUARE_BRACKET = 0x5D;
/* ] */

var CHAR_GRAVE_ACCENT = 0x60;
/* ` */

var CHAR_LEFT_CURLY_BRACKET = 0x7B;
/* { */

var CHAR_VERTICAL_LINE = 0x7C;
/* | */

var CHAR_RIGHT_CURLY_BRACKET = 0x7D;
/* } */

var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0x00] = '\\0';
ESCAPE_SEQUENCES[0x07] = '\\a';
ESCAPE_SEQUENCES[0x08] = '\\b';
ESCAPE_SEQUENCES[0x09] = '\\t';
ESCAPE_SEQUENCES[0x0A] = '\\n';
ESCAPE_SEQUENCES[0x0B] = '\\v';
ESCAPE_SEQUENCES[0x0C] = '\\f';
ESCAPE_SEQUENCES[0x0D] = '\\r';
ESCAPE_SEQUENCES[0x1B] = '\\e';
ESCAPE_SEQUENCES[0x22] = '\\"';
ESCAPE_SEQUENCES[0x5C] = '\\\\';
ESCAPE_SEQUENCES[0x85] = '\\N';
ESCAPE_SEQUENCES[0xA0] = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';
var DEPRECATED_BOOLEANS_SYNTAX = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;
  if (map === null) return {};
  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }

    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}

var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema = options['schema'] || _default;
  this.indent = Math.max(1, options['indent'] || 2);
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid = options['skipInvalid'] || false;
  this.flowLevel = common.isNothing(options['flowLevel']) ? -1 : options['flowLevel'];
  this.styleMap = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys = options['sortKeys'] || false;
  this.lineWidth = options['lineWidth'] || 80;
  this.noRefs = options['noRefs'] || false;
  this.noCompatMode = options['noCompatMode'] || false;
  this.condenseFlow = options['condenseFlow'] || false;
  this.quotingType = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options['forceQuotes'] || false;
  this.replacer = typeof options['replacer'] === 'function' ? options['replacer'] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = '';
  this.duplicates = [];
  this.usedDuplicates = null;
} // Indents every line in a string. Empty lines (\n only) are not indented.


function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);

    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;
    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
} // [33] s-white ::= s-space | s-tab


function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
} // Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.


function isPrintable(c) {
  return 0x00020 <= c && c <= 0x00007E || 0x000A1 <= c && c <= 0x00D7FF && c !== 0x2028 && c !== 0x2029 || 0x0E000 <= c && c <= 0x00FFFD && c !== CHAR_BOM || 0x10000 <= c && c <= 0x10FFFF;
} // [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark


function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM // - b-char
  && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
} // [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )


function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return ( // ns-plain-safe
  inblock ? // c = flow-in
  cIsNsCharOrWhitespace : cIsNsCharOrWhitespace // - c-flow-indicator
  && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET // ns-plain-char
  ) && c !== CHAR_SHARP // false on '#'
  && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
  || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP // change to true on '[^ ]#'
  || prev === CHAR_COLON && cIsNsChar; // change to true on ':[^ ]'
} // Simplified test for values allowed as the first character in plain style.


function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) // - s-white
  // - (c-indicator ::=
  // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
  && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
  && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE // | “%” | “@” | “`”)
  && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
} // Simplified test for values allowed as the last character in plain style.


function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
} // Same as 'string'.codePointAt(pos), but works in older browsers.


function codePointAt(string, pos) {
  var first = string.charCodeAt(pos),
      second;

  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);

    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }

  return first;
} // Determines whether block indentation indicator is required.


function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN = 1,
    STYLE_SINGLE = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED = 4,
    STYLE_DOUBLE = 5; // Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).

function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth

  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly

  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);

      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }

      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);

      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true; // Check if any line can be folded.

        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }

      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    } // in case the end is missing a \n


    hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
  } // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.


  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }

    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  } // Edge case: block indentation indicator can only have one digit.


  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  } // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.


  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }

  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
} // Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.


function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }

    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.

    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent); // Without knowing if keys are implicit/explicit, assume implicit for safety.

    var singleLineOnly = iskey // No block styles in flow mode.
    || state.flowLevel > -1 && level >= state.flowLevel;

    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
      case STYLE_PLAIN:
        return string;

      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";

      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));

      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));

      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';

      default:
        throw new exception('impossible error: invalid scalar style');
    }
  }();
} // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.


function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : ''; // note the special case: the string '\n' counts as a "trailing" empty line.

  var clip = string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : clip ? '' : '-';
  return indentIndicator + chomp + '\n';
} // (See the note for writeScalar.)


function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
} // Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.


function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g; // first line (possibly an empty line)

  var result = function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }(); // If we haven't reached the first content line yet, don't add an extra \n.


  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented; // rest of the lines

  var match;

  while (match = lineRe.exec(string)) {
    var prefix = match[1],
        line = match[2];
    moreIndented = line[0] === ' ';
    result += prefix + (!prevMoreIndented && !moreIndented && line !== '' ? '\n' : '') + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
} // Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.


function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line; // Since a more-indented line adds a \n, breaks can't be followed by a space.

  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.

  var match; // start is an inclusive index. end, curr, and next are exclusive.

  var start = 0,
      end,
      curr = 0,
      next = 0;
  var result = ''; // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.

  while (match = breakRe.exec(line)) {
    next = match.index; // maintain invariant: curr - start <= width

    if (next - start > width) {
      end = curr > start ? curr : next; // derive end <= length-2

      result += '\n' + line.slice(start, end); // skip the space that was output as \n

      start = end + 1; // derive start <= length-1
    }

    curr = next;
  } // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.


  result += '\n'; // Insert a break if the remainder is too long and there is a break available.

  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
} // Escapes a double-quoted string.


function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    } // Write only valid elements, put null instead of invalid elements.


    if (writeNode(state, level, value, false, false) || typeof value === 'undefined' && writeNode(state, level, null, false, false)) {
      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    } // Write only valid elements, put null instead of invalid elements.


    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === 'undefined' && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result = '',
      _tag = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';
    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump; // Both key and value are valid.

    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result = '',
      _tag = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer; // Allow sorting keys so that the output file is deterministic

  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new exception('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = state.tag !== null && state.tag !== '?' || state.dump && state.dump.length > 1024;

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump; // Both key and value are valid.

    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === 'object' && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
} // Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//


function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  var inblock = block;
  var tagStr;

  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if (state.tag !== null && state.tag !== '?' || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }

    if (type === '[object Object]') {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(state.tag[0] === '!' ? state.tag.slice(1) : state.tag).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;
  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }

  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);

    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;

  if (state.replacer) {
    value = state.replacer.call({
      '': value
    }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';
  return '';
}

var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};

function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' + 'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}

var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception; // Re-export all types in case user wants to create custom schema

var types = {
  binary: binary,
  float: float,
  map: map,
  null: _null,
  pairs: pairs,
  set: set,
  timestamp: timestamp,
  bool: bool,
  int: int,
  merge: merge,
  omap: omap,
  seq: seq,
  str: str
}; // Removed functions from JS-YAML 3.0.x

var safeLoad = renamed('safeLoad', 'load');
var safeLoadAll = renamed('safeLoadAll', 'loadAll');
var safeDump = renamed('safeDump', 'dump');
var jsYaml = {
  Type: Type,
  Schema: Schema,
  FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
  JSON_SCHEMA: JSON_SCHEMA,
  CORE_SCHEMA: CORE_SCHEMA,
  DEFAULT_SCHEMA: DEFAULT_SCHEMA,
  load: load,
  loadAll: loadAll,
  dump: dump,
  YAMLException: YAMLException,
  types: types,
  safeLoad: safeLoad,
  safeLoadAll: safeLoadAll,
  safeDump: safeDump
};

const name = 'frontmatter';
function transform(transformHooks) {
  transformHooks.transform.tap((md, context) => {
    const origParse = md.parse;
    md.parse = wrapFunction(origParse, {
      before(ctx) {
        const [content] = ctx.args;
        if (!content.startsWith('---\n')) return;
        const endOffset = content.indexOf('\n---\n');
        if (endOffset < 0) return;
        const raw = content.slice(4, endOffset);

        try {
          context.frontmatter = jsYaml.load(raw);
        } catch (_unused) {
          return;
        }

        const offset = endOffset + 5;
        ctx.args[0] = content.slice(offset);
      },

      after() {
        md.parse = origParse;
      }

    });
  });
  return {};
}

var frontmatter = /*#__PURE__*/Object.freeze({
__proto__: null,
name: name,
transform: transform
});

function createTransformHooks() {
  return {
    parser: new Hook(),
    transform: new Hook(),
    htmltag: new Hook(),
    retransform: new Hook()
  };
}

const plugins = [katex, prism, frontmatter];

function cleanNode(node, depth = 0) {
  if (node.type === 'heading') {
    // drop all paragraphs
    node.children = node.children.filter(item => item.type !== 'paragraph');
  } else if (node.type === 'list_item') {
    var _node$payload;

    // keep first paragraph as content of list_item, drop others
    node.children = node.children.filter(item => {
      if (['paragraph', 'fence'].includes(item.type)) {
        if (!node.content) {
          node.content = item.content;
          node.payload = _extends$1({}, node.payload, item.payload);
        }

        return false;
      }

      return true;
    });

    if (((_node$payload = node.payload) == null ? void 0 : _node$payload.index) != null) {
      node.content = `${node.payload.index}. ${node.content}`;
    }
  } else if (node.type === 'ordered_list') {
    var _node$payload$startIn, _node$payload2;

    let index = (_node$payload$startIn = (_node$payload2 = node.payload) == null ? void 0 : _node$payload2.startIndex) != null ? _node$payload$startIn : 1;
    node.children.forEach(item => {
      if (item.type === 'list_item') {
        item.payload = _extends$1({}, item.payload, {
          index
        });
        index += 1;
      }
    });
  }

  if (node.children.length === 0) {
    delete node.children;
  } else {
    node.children.forEach(child => cleanNode(child, depth + 1));

    if (node.children.length === 1 && !node.children[0].content) {
      node.children = node.children[0].children;
    }
  }

  node.depth = depth;
}

class Transformer {
  constructor(plugins$1 = plugins) {
    this.plugins = plugins$1;
    this.hooks = createTransformHooks();
    const assetsMap = {};

    for (const {
      name,
      transform
    } of plugins$1) {
      assetsMap[name] = transform(this.hooks);
    }

    this.assetsMap = assetsMap;
    const md = new Remarkable('full', {
      html: true,
      breaks: true,
      maxNesting: Infinity
    });
    md.renderer.rules.htmltag = wrapFunction(md.renderer.rules.htmltag, {
      after: ctx => {
        this.hooks.htmltag.call(ctx);
      }
    });
    this.md = md;
    this.hooks.parser.call(md);
  }

  buildTree(tokens) {
    const {
      md
    } = this;
    const root = {
      type: 'root',
      depth: 0,
      content: '',
      children: [],
      payload: {}
    };
    const stack = [root];
    let depth = 0;

    for (const token of tokens) {
      let current = stack[stack.length - 1];

      if (token.type.endsWith('_open')) {
        const type = token.type.slice(0, -5);
        const payload = {};

        if (token.lines) {
          payload.lines = token.lines;
        }

        if (type === 'heading') {
          depth = token.hLevel;

          while (((_current = current) == null ? void 0 : _current.depth) >= depth) {
            var _current;

            stack.pop();
            current = stack[stack.length - 1];
          }
        } else {
          var _current2;

          depth = Math.max(depth, ((_current2 = current) == null ? void 0 : _current2.depth) || 0) + 1;

          if (type === 'ordered_list') {
            payload.startIndex = token.order;
          }
        }

        const item = {
          type,
          depth,
          payload,
          content: '',
          children: []
        };
        current.children.push(item);
        stack.push(item);
      } else if (!current) {
        continue;
      } else if (token.type === `${current.type}_close`) {
        if (current.type === 'heading') {
          depth = current.depth;
        } else {
          stack.pop();
          depth = 0;
        }
      } else if (token.type === 'inline') {
        const revoke = this.hooks.htmltag.tap(ctx => {
          const comment = ctx.result.match(/^<!--([\s\S]*?)-->$/);
          const data = comment == null ? void 0 : comment[1].trim();

          if (data === 'fold') {
            current.payload.fold = true;
            ctx.result = '';
          }
        });
        const text = md.renderer.render([token], md.options, {});
        revoke();
        current.content = `${current.content || ''}${text}`;
      } else if (token.type === 'fence') {
        let result = md.renderer.render([token], md.options, {}); // Remarkable only adds className to `<code>` but not `<pre>`, copy it to make PrismJS style work.

        const matches = result.match(/<code( class="[^"]*")>/);
        if (matches) result = result.replace('<pre>', `<pre${matches[1]}>`);
        current.children.push({
          type: token.type,
          depth: depth + 1,
          content: result,
          children: []
        });
      } else ;
    }

    return root;
  }

  transform(content) {
    var _root$children;

    const context = {
      features: {}
    };
    this.hooks.transform.call(this.md, context);
    const tokens = this.md.parse(content, {});
    let root = this.buildTree(tokens);
    cleanNode(root);
    if (((_root$children = root.children) == null ? void 0 : _root$children.length) === 1) root = root.children[0];
    return _extends$1({}, context, {
      root
    });
  }
  /**
   * Get all assets from enabled plugins or filter them by plugin names as keys.
   */


  getAssets(keys) {
    var _keys;

    const styles = [];
    const scripts = [];
    (_keys = keys) != null ? _keys : keys = Object.keys(this.assetsMap);

    for (const assets of keys.map(key => this.assetsMap[key])) {
      if (assets) {
        if (assets.styles) styles.push(...assets.styles);
        if (assets.scripts) scripts.push(...assets.scripts);
      }
    }

    return {
      styles,
      scripts
    };
  }
  /**
   * Get used assets by features object returned by `transform`.
   */


  getUsedAssets(features) {
    return this.getAssets(Object.keys(features).filter(key => features[key]));
  }

}

exports.Transformer = Transformer;
exports.builtInPlugins = plugins;
exports.fillTemplate = fillTemplate;

}));
