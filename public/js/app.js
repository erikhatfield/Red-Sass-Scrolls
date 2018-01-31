(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("js/initialize.js", function(exports, require, module) {
'use strict';

var _verbose = require('./verbose');

var _verbose2 = _interopRequireDefault(_verbose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {
	console.log('initialized');

	(0, _verbose2.default)(false);
});

var $ = require('jquery');
var win = window; //snapshot of window object
var sections = Array.prototype.slice.call(document.querySelectorAll("#mainScrolls>section"));

//jQuery document ready event
$(document).ready(function (event) {
	console.log("jQuery doc ready!");

	initScrollVisualizer();

	var afterScrollHandler = debounce(function (e) {
		heavyScrollHandler(e);
	}, 250);

	var afterResizeHandler = debounce(function (e) {
		resizeHandler(e);
	}, 250);

	function rawScrollHandler() {
		var $topPercent = win.pageYOffset / $("#mainScrolls").height() * 100 + "%";
		$("#scrollLocation").css('top', $topPercent);

		setActiveSection(0);

		var index = window.location.hash.substr(1);
		var j = parseInt(index) + 1;
		var $topset = 1 * (win.scrollY - sections[index].offsetTop);
		var $topset2 = sections[j].offsetTop - win.scrollY;

		sections[index].querySelector('article').setAttribute('style', 'top: -' + $topset / 4 + "px");
		sections[j].querySelector('article').setAttribute('style', 'top: -' + $topset2 / 8 + "px");

		sections[j].querySelector('div>div').setAttribute('style', 'top: -' + $topset * .2 + "px");
		sections[j].querySelector('div>div').nextElementSibling.setAttribute('style', 'top: -' + $topset * .4 + "px");

		sections[j].querySelector('div>div').nextElementSibling.nextElementSibling.setAttribute('style', 'top: -' + $topset * .8 + "px");
		sections[j].querySelector('div>div').nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('style', 'top: -' + $topset * 1.6 + "px");
	}

	function heavyScrollHandler(e) {}

	function resizeHandler(e) {
		win = window; //update window obj snapshot
	}

	document.addEventListener('scroll', afterScrollHandler);
	document.addEventListener('scroll', rawScrollHandler);
	window.addEventListener('resize', afterResizeHandler);
});

function setActiveSection(__i) {
	var i = __i;
	if (sections[i] === undefined) {
		return;
	} else {
		if (win.scrollY >= sections[i].offsetTop && win.scrollY <= sections[i].offsetTop + sections[i].clientHeight) {
			sections[i].setAttribute("class", "active");
			window.location.hash = i;
			if (sections[i + 1] !== undefined) {
				sections[i + 1].setAttribute("class", "active-next");
			}
			return setActiveSection(i + 2);
		} else {
			sections[i].setAttribute("class", "");
			if (sections[i + 1] !== undefined) {
				sections[i + 1].setAttribute("class", "");
			}
			return setActiveSection(i + 1);
		}
	}
}

function initScrollVisualizer() {
	var $scrollVisualizer = document.createElement("div");
	$scrollVisualizer.setAttribute("id", "scrollVisualizer");
	document.body.append($scrollVisualizer);

	for (var i = 0; i < sections.length; i++) {
		$("#scrollVisualizer").append('<div></div>');
	}

	$("#scrollVisualizer").append('<b id="scrollLocation"></b>');

	updateScrollVisualizer();
}

function updateScrollVisualizer() {
	var divs = Array.prototype.slice.call(document.querySelectorAll("#scrollVisualizer>div"));

	for (var i = 0; i < divs.length; i++) {
		divs[i].setAttribute('style', 'height: ' + sections[i].clientHeight / $("#mainScrolls").height() * 100 + '%');
	}
	$("#scrollLocation").css('height', win.innerHeight / $("#mainScrolls").height() * 100 + '%');
}
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
		    args = arguments;
		var later = function later() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
});

require.register("js/verbose.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
function verboseInit(__verbose) {

	var $ = require('jquery');
	var isVerbose = __verbose;
	//jQuery document ready event
	$(document).ready(function (event) {
		console.log("jQuery doc ready!");

		if (isVerbose) {
			setupVerboseReader();

			//on window resize event
			var resizeTimer;
			$(window).on('resize', function (e) {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function () {
					outputWinData();
					outputMainScrollsData();
				}, 250);
			});

			var afterScrollHandler = debounce(function () {
				outputWinData();
				outputMainScrollsData();
			}, 250);

			document.addEventListener('scroll', afterScrollHandler);
		}
	});

	function setupVerboseReader() {
		var verboseReader = document.createElement("div");
		verboseReader.setAttribute("id", "verboseReader");
		document.body.appendChild(verboseReader);

		//windowObject Data
		var winData = document.createElement("section");
		winData.setAttribute("id", "winData");
		verboseReader.append(winData);

		$("#winData").click(function (e) {
			$(this).toggleClass("read");
		});
		outputWinData();

		//mainScrolls Data
		var mainScrollsData = document.createElement("section");
		mainScrollsData.setAttribute("id", "mainScrollsData");
		verboseReader.append(mainScrollsData);

		$("#mainScrollsData").click(function (e) {
			$(this).toggleClass("read");
		});
		outputMainScrollsData();
	}

	function outputMainScrollsData() {
		var win = window; //create a snapshot of the window object

		var sections = Array.prototype.slice.call(document.querySelectorAll("#mainScrolls>section"));

		var title = $("<h2></h2>").text("#mainScrolls");
		$("#mainScrollsData").html(title);

		var list = $("#mainScrollsData").append('<ul></ul>').find('ul');
		var $mainScrollsHeight = $("#mainScrolls").height();
		list.append('<li><big>' + $mainScrollsHeight + '</big></li>');
		list.append('<li><big>' + sections.length + '</big></li>');

		for (var i = 0; i < sections.length; i++) {
			list.append('<li><span><b>sections[' + i + ']: </b></span> <span><b>offsetTop: </b>' + sections[i].offsetTop + '</span></li>');
		}
	}

	function outputWinData() {
		var win = window; //create a snapshot of the window object

		var winTitle = $("<h2></h2>").text("Window Object");
		$("#winData").html(winTitle);

		var list = $("#winData").append('<ul></ul>').find('ul');
		list.append('<li><span><b>innerWidth: </b>' + win.innerWidth + '</span> <span><b>innerHeight: </b>' + win.innerHeight + '</span></li>');
		list.append('<li><span><b>outerWidth: </b>' + win.outerWidth + '</span> <span><b>outerHeight: </b>' + win.outerHeight + '</span></li>');
		list.append('<li><span><b>pageXOffset: </b>' + win.pageXOffset + '</span> <span><b>pageYOffset: </b>' + win.pageYOffset + '</span></li>');
		list.append('<li><span><b>scrollX: </b>' + win.scrollX + '</span> <span><b>scrollY: </b>' + win.scrollY + '</span></li>');
	}

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function debounce(func, wait, immediate) {
		var timeout;
		return function () {
			var context = this,
			    args = arguments;
			var later = function later() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
}

exports.default = verboseInit;
});

require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.jQuery = require("jquery");
window["$"] = require("jquery");


});})();require('___globals___');

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! modernizr 3.5.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-cssanimations-csscolumns-customelements-flexbox-history-picture-pointerevents-postmessage-sizes-srcset-webgl-websockets-webworkers-addtest-domprefixes-hasevent-mq-prefixedcssvalue-prefixes-setclasses-testallprops-testprop-teststyles !*/
!function (e, t, n) {
  function r(e, t) {
    return (typeof e === "undefined" ? "undefined" : _typeof(e)) === t;
  }function o() {
    var e, t, n, o, i, s, a;for (var l in C) {
      if (C.hasOwnProperty(l)) {
        if (e = [], t = C[l], t.name && (e.push(t.name.toLowerCase()), t.options && t.options.aliases && t.options.aliases.length)) for (n = 0; n < t.options.aliases.length; n++) {
          e.push(t.options.aliases[n].toLowerCase());
        }for (o = r(t.fn, "function") ? t.fn() : t.fn, i = 0; i < e.length; i++) {
          s = e[i], a = s.split("."), 1 === a.length ? Modernizr[a[0]] = o : (!Modernizr[a[0]] || Modernizr[a[0]] instanceof Boolean || (Modernizr[a[0]] = new Boolean(Modernizr[a[0]])), Modernizr[a[0]][a[1]] = o), w.push((o ? "" : "no-") + a.join("-"));
        }
      }
    }
  }function i(e) {
    var t = S.className,
        n = Modernizr._config.classPrefix || "";if (x && (t = t.baseVal), Modernizr._config.enableJSClass) {
      var r = new RegExp("(^|\\s)" + n + "no-js(\\s|$)");t = t.replace(r, "$1" + n + "js$2");
    }Modernizr._config.enableClasses && (t += " " + n + e.join(" " + n), x ? S.className.baseVal = t : S.className = t);
  }function s(e, t) {
    if ("object" == (typeof e === "undefined" ? "undefined" : _typeof(e))) for (var n in e) {
      P(e, n) && s(n, e[n]);
    } else {
      e = e.toLowerCase();var r = e.split("."),
          o = Modernizr[r[0]];if (2 == r.length && (o = o[r[1]]), "undefined" != typeof o) return Modernizr;t = "function" == typeof t ? t() : t, 1 == r.length ? Modernizr[r[0]] = t : (!Modernizr[r[0]] || Modernizr[r[0]] instanceof Boolean || (Modernizr[r[0]] = new Boolean(Modernizr[r[0]])), Modernizr[r[0]][r[1]] = t), i([(t && 0 != t ? "" : "no-") + r.join("-")]), Modernizr._trigger(e, t);
    }return Modernizr;
  }function a() {
    return "function" != typeof t.createElement ? t.createElement(arguments[0]) : x ? t.createElementNS.call(t, "http://www.w3.org/2000/svg", arguments[0]) : t.createElement.apply(t, arguments);
  }function l() {
    var e = t.body;return e || (e = a(x ? "svg" : "body"), e.fake = !0), e;
  }function u(e, n, r, o) {
    var i,
        s,
        u,
        f,
        d = "modernizr",
        c = a("div"),
        p = l();if (parseInt(r, 10)) for (; r--;) {
      u = a("div"), u.id = o ? o[r] : d + (r + 1), c.appendChild(u);
    }return i = a("style"), i.type = "text/css", i.id = "s" + d, (p.fake ? p : c).appendChild(i), p.appendChild(c), i.styleSheet ? i.styleSheet.cssText = e : i.appendChild(t.createTextNode(e)), c.id = d, p.fake && (p.style.background = "", p.style.overflow = "hidden", f = S.style.overflow, S.style.overflow = "hidden", S.appendChild(p)), s = n(c, e), p.fake ? (p.parentNode.removeChild(p), S.style.overflow = f, S.offsetHeight) : c.parentNode.removeChild(c), !!s;
  }function f(e, t) {
    return !!~("" + e).indexOf(t);
  }function d(e) {
    return e.replace(/([A-Z])/g, function (e, t) {
      return "-" + t.toLowerCase();
    }).replace(/^ms-/, "-ms-");
  }function c(t, n, r) {
    var o;if ("getComputedStyle" in e) {
      o = getComputedStyle.call(e, t, n);var i = e.console;if (null !== o) r && (o = o.getPropertyValue(r));else if (i) {
        var s = i.error ? "error" : "log";i[s].call(i, "getComputedStyle returning null, its possible modernizr test results are inaccurate");
      }
    } else o = !n && t.currentStyle && t.currentStyle[r];return o;
  }function p(t, r) {
    var o = t.length;if ("CSS" in e && "supports" in e.CSS) {
      for (; o--;) {
        if (e.CSS.supports(d(t[o]), r)) return !0;
      }return !1;
    }if ("CSSSupportsRule" in e) {
      for (var i = []; o--;) {
        i.push("(" + d(t[o]) + ":" + r + ")");
      }return i = i.join(" or "), u("@supports (" + i + ") { #modernizr { position: absolute; } }", function (e) {
        return "absolute" == c(e, null, "position");
      });
    }return n;
  }function m(e) {
    return e.replace(/([a-z])-([a-z])/g, function (e, t, n) {
      return t + n.toUpperCase();
    }).replace(/^-/, "");
  }function h(e, t, o, i) {
    function s() {
      u && (delete N.style, delete N.modElem);
    }if (i = r(i, "undefined") ? !1 : i, !r(o, "undefined")) {
      var l = p(e, o);if (!r(l, "undefined")) return l;
    }for (var u, d, c, h, v, A = ["modernizr", "tspan", "samp"]; !N.style && A.length;) {
      u = !0, N.modElem = a(A.shift()), N.style = N.modElem.style;
    }for (c = e.length, d = 0; c > d; d++) {
      if (h = e[d], v = N.style[h], f(h, "-") && (h = m(h)), N.style[h] !== n) {
        if (i || r(o, "undefined")) return s(), "pfx" == t ? h : !0;try {
          N.style[h] = o;
        } catch (g) {}if (N.style[h] != v) return s(), "pfx" == t ? h : !0;
      }
    }return s(), !1;
  }function v(e, t) {
    return function () {
      return e.apply(t, arguments);
    };
  }function A(e, t, n) {
    var o;for (var i in e) {
      if (e[i] in t) return n === !1 ? e[i] : (o = t[e[i]], r(o, "function") ? v(o, n || t) : o);
    }return !1;
  }function g(e, t, n, o, i) {
    var s = e.charAt(0).toUpperCase() + e.slice(1),
        a = (e + " " + O.join(s + " ") + s).split(" ");return r(t, "string") || r(t, "undefined") ? h(a, t, o, i) : (a = (e + " " + T.join(s + " ") + s).split(" "), A(a, t, n));
  }function y(e, t, r) {
    return g(e, n, n, t, r);
  }var C = [],
      b = { _version: "3.5.0", _config: { classPrefix: "", enableClasses: !0, enableJSClass: !0, usePrefixes: !0 }, _q: [], on: function on(e, t) {
      var n = this;setTimeout(function () {
        t(n[e]);
      }, 0);
    }, addTest: function addTest(e, t, n) {
      C.push({ name: e, fn: t, options: n });
    }, addAsyncTest: function addAsyncTest(e) {
      C.push({ name: null, fn: e });
    } },
      Modernizr = function Modernizr() {};Modernizr.prototype = b, Modernizr = new Modernizr();var w = [],
      S = t.documentElement,
      x = "svg" === S.nodeName.toLowerCase(),
      _ = "Moz O ms Webkit",
      T = b._config.usePrefixes ? _.toLowerCase().split(" ") : [];b._domPrefixes = T;var E = b._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];b._prefixes = E;var P;!function () {
    var e = {}.hasOwnProperty;P = r(e, "undefined") || r(e.call, "undefined") ? function (e, t) {
      return t in e && r(e.constructor.prototype[t], "undefined");
    } : function (t, n) {
      return e.call(t, n);
    };
  }(), b._l = {}, b.on = function (e, t) {
    this._l[e] || (this._l[e] = []), this._l[e].push(t), Modernizr.hasOwnProperty(e) && setTimeout(function () {
      Modernizr._trigger(e, Modernizr[e]);
    }, 0);
  }, b._trigger = function (e, t) {
    if (this._l[e]) {
      var n = this._l[e];setTimeout(function () {
        var e, r;for (e = 0; e < n.length; e++) {
          (r = n[e])(t);
        }
      }, 0), delete this._l[e];
    }
  }, Modernizr._q.push(function () {
    b.addTest = s;
  });var k = function () {
    function e(e, t) {
      var o;return e ? (t && "string" != typeof t || (t = a(t || "div")), e = "on" + e, o = e in t, !o && r && (t.setAttribute || (t = a("div")), t.setAttribute(e, ""), o = "function" == typeof t[e], t[e] !== n && (t[e] = n), t.removeAttribute(e)), o) : !1;
    }var r = !("onblur" in t.documentElement);return e;
  }();b.hasEvent = k;var z = function () {
    var t = e.matchMedia || e.msMatchMedia;return t ? function (e) {
      var n = t(e);return n && n.matches || !1;
    } : function (t) {
      var n = !1;return u("@media " + t + " { #modernizr { position: absolute; } }", function (t) {
        n = "absolute" == (e.getComputedStyle ? e.getComputedStyle(t, null) : t.currentStyle).position;
      }), n;
    };
  }();b.mq = z;var B = function B(e, t) {
    var n = !1,
        r = a("div"),
        o = r.style;if (e in o) {
      var i = T.length;for (o[e] = t, n = o[e]; i-- && !n;) {
        o[e] = "-" + T[i] + "-" + t, n = o[e];
      }
    }return "" === n && (n = !1), n;
  };b.prefixedCSSValue = B;var O = b._config.usePrefixes ? _.split(" ") : [];b._cssomPrefixes = O;var L = { elem: a("modernizr") };Modernizr._q.push(function () {
    delete L.elem;
  });var N = { style: L.elem.style };Modernizr._q.unshift(function () {
    delete N.style;
  }), b.testAllProps = g, b.testAllProps = y;b.testProp = function (e, t, r) {
    return h([e], n, t, r);
  }, b.testStyles = u;Modernizr.addTest("customelements", "customElements" in e), Modernizr.addTest("history", function () {
    var t = navigator.userAgent;return -1 === t.indexOf("Android 2.") && -1 === t.indexOf("Android 4.0") || -1 === t.indexOf("Mobile Safari") || -1 !== t.indexOf("Chrome") || -1 !== t.indexOf("Windows Phone") || "file:" === location.protocol ? e.history && "pushState" in e.history : !1;
  }), Modernizr.addTest("pointerevents", function () {
    var e = !1,
        t = T.length;for (e = Modernizr.hasEvent("pointerdown"); t-- && !e;) {
      k(T[t] + "pointerdown") && (e = !0);
    }return e;
  }), Modernizr.addTest("postmessage", "postMessage" in e), Modernizr.addTest("webgl", function () {
    var t = a("canvas"),
        n = "probablySupportsContext" in t ? "probablySupportsContext" : "supportsContext";return n in t ? t[n]("webgl") || t[n]("experimental-webgl") : "WebGLRenderingContext" in e;
  });var R = !1;try {
    R = "WebSocket" in e && 2 === e.WebSocket.CLOSING;
  } catch (j) {}Modernizr.addTest("websockets", R), Modernizr.addTest("cssanimations", y("animationName", "a", !0)), function () {
    Modernizr.addTest("csscolumns", function () {
      var e = !1,
          t = y("columnCount");try {
        e = !!t, e && (e = new Boolean(e));
      } catch (n) {}return e;
    });for (var e, t, n = ["Width", "Span", "Fill", "Gap", "Rule", "RuleColor", "RuleStyle", "RuleWidth", "BreakBefore", "BreakAfter", "BreakInside"], r = 0; r < n.length; r++) {
      e = n[r].toLowerCase(), t = y("column" + n[r]), ("breakbefore" === e || "breakafter" === e || "breakinside" == e) && (t = t || y(n[r])), Modernizr.addTest("csscolumns." + e, t);
    }
  }(), Modernizr.addTest("flexbox", y("flexBasis", "1px", !0)), Modernizr.addTest("picture", "HTMLPictureElement" in e), Modernizr.addAsyncTest(function () {
    var e,
        t,
        n,
        r = a("img"),
        o = "sizes" in r;!o && "srcset" in r ? (t = "data:image/gif;base64,R0lGODlhAgABAPAAAP///wAAACH5BAAAAAAALAAAAAACAAEAAAICBAoAOw==", e = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", n = function n() {
      s("sizes", 2 == r.width);
    }, r.onload = n, r.onerror = n, r.setAttribute("sizes", "9px"), r.srcset = e + " 1w," + t + " 8w", r.src = e) : s("sizes", o);
  }), Modernizr.addTest("srcset", "srcset" in a("img")), Modernizr.addTest("webworkers", "Worker" in e), o(), i(w), delete b.addTest, delete b.addAsyncTest;for (var M = 0; M < Modernizr._q.length; M++) {
    Modernizr._q[M]();
  }e.Modernizr = Modernizr;
}(window, document);
require('js/initialize');
//# sourceMappingURL=app.js.map