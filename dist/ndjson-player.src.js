/**
 * Author : A.Lepe (dev@alepe.com)
 * License: MIT
 * Version: 0.1.8
 * Updated: 2024-12-11
 * Content: ndjson-player.src.js (Bundle Source)
 */

/**
 * Author : A.Lepe (dev@alepe.com) - intellisrc.com
 * License: MIT
 * Version: 2.1.1
 * Updated: 2022-02-24
 * Content: Core (Debug)
 */

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.m2d2 = factory();
  }
}(this, function() {
// ------- Functions -------
"use strict";
/**
 * Functions useful to work with Javascript data and DOM
 * Used mainly in M2D2 core library but exposed to the
 * consumer.
 * @Author: A.Lepe <dev@alepe.com>
 *
 * This extension provides:
 * $.isString
 * $.isBool
 * $.isNumeric
 * $.isSelectorID
 * $.isPlainObject
 * $.isObject
 * $.isArray
 * $.isFunction
 * $.isElement
 * $.isNode
 * $.isHtml
 * $.isEmpty
 * $.isVisible
 * $.inView
 * $.cleanArray
 * $.isValidElement
 * $.exists
 * $.getAttrOrProp
 * $.hasAttrOrProp
 * $.hasAttr
 * $.hasProp
 * $.setPropOrAttr
 * $.setAttr
 * $.defineProp
 * $.htmlElement
 * $.newElement
 * $.newEmptyNode
 * $.getMethods
 * $.appendAllChild
 * $.prependAllChild
 */
class Utils {
	/**
	 * Return true if variable is string
	 * @param {*} v
	 * @returns {boolean}
	 */
    isString(v) {
        return typeof v === 'string';
    };
	/**
	 * Return true if variable is a boolean
	 * @param {*} b
	 * @returns {boolean}
	 */
    isBool(b) {
        return typeof b === 'boolean';
    };
	/**
	 * Return true if variable is a number
	 * @param {*} n
	 * @returns {boolean}
	 */
    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
	/**
	 * Return true if selector us an id selector
	 * @param {string} s
	 * @returns {boolean}
	 */
    isSelectorID(s) {
        return (s + "").trim().indexOf("#") === 0;
    };
	/**
	 * Returns true if object is a "plain" object (not an array)
	 * @param o
	 * @returns {boolean}
	 */
    isPlainObject(o) {
        return o.constructor.name === "Object";
    };
	/**
	 * Returns true if variable is an object (any kind, e.g. Array)
	 * @param {*} oa
	 * @returns {boolean}
	 */
    isObject(oa) {
        return typeof oa === 'object';
    };
	/**
	 * Returns true if object is an array
	 * @param {object} a
	 * @returns {boolean}
	 */
    isArray(a) {
        return Array.isArray(a);
    };
	/**
	 * Returns true if object is a function
	 * @param {object} f
	 * @returns {boolean}
	 */
    isFunction(f) {
        return typeof f === 'function';
    };
	/**
	 * Returns true if object is an HTMLElement
	 * @param {object} n
	 * @returns {boolean}
	 */
    isElement(n) {
        return n instanceof HTMLElement;
    };

	/**
	 * Return true if object is a Node or DocumentFragment
	 * @param {object} n
	 * @returns {boolean}
	 */
    isNode(n) {
    	return (n instanceof Node || n instanceof DocumentFragment);
	}
	/**
	 * Return true if string seems to be an HTML code
	 * @param {string} s
	 * @returns {boolean}
	 */
    isHtml(s) {
        return (s + "").trim().indexOf("<") !== -1;
    };
	/**
	 * Checks if an object is empty
	 * @param {object} obj
	 * @returns {boolean}
	 */
    isEmpty(obj) {
        return obj === undefined || (this.isObject(obj) && Object.keys(obj).length === 0) || obj === "";
    };
    /**
     * Checks if an element is visible
     * @param {HtmlElement}
     * @returns {boolean}
     */
    isVisible(elem) {
        if(! this.isElement(elem)) {
            console.log("(isVisible) Not an element: ");
            console.log(elem);
            return false;
        }
        const display = elem.style.display !== "none";
        const notHidden = elem.style.visibility !== "hidden";
        return display && notHidden;
    };
    /**
     * Checks if element is in view
     * @param {HtmlElement}
     * @returns {boolean}
     */
    inView(elem) {
        const rect = elem.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 &&
               rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
               rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
               rect.width > 0 && rect.height > 0
    }
	/**
	 * Remove null, empty or undefined values from an array
	 * @param {Array} a
	 * @returns {Array}
	 */
    cleanArray(a) {
        return a.filter(function(e){ return e === 0 || e });
    };
	/**
	 * Checks if a tag name is a valid HTML element
	 * @param {string} tagName
	 * @returns {boolean}
	 */
    isValidElement(tagName) {
        const $node = this.newElement(tagName);
        return tagName !== "template" && $node.constructor.name !== "HTMLUnknownElement";
    }
    /**
     * Returns true if element exists in DOM based on selector
     */
    exists(selector) {
        return document.querySelector(selector) !== null;
    }
	/**
	 * Get attribute or property
	 * @param {HTMLElement} $node
	 * @param {string} key
	 * @returns {*}
	 */
	getAttrOrProp ($node, key) {
		let value = "";
		if(this.hasAttrOrProp($node,  key)) {
			value = this.hasAttr($node, key) ? $node.getAttribute(key): $node[key];
		}
		return value
	}
	/**
	 * If a node contains either a property or an attribute
	 * @private
	 * @param {HTMLElement} $node
	 * @param {String} key
	 * @return {boolean}
	 */
	hasAttrOrProp ($node, key) {
		return this.hasAttr($node, key) || this.hasProp($node, key);
	}
	/**
	 * If a node has an attribute
	 * @private
	 * @param {HTMLElement} $node
	 * @param {string} attr
	 * @return {boolean}
	 */
	hasAttr ($node, attr) {
		let hasAttr = false;
		if($node && !this.isNumeric(attr)) {
			switch(attr) {
				case "checked":
					hasAttr = ($node.type !== undefined && ($node.type === "radio" || $node.type === "checkbox"));
					break;
				default:
					hasAttr = $node.hasAttribute !== undefined ? $node.hasAttribute(attr) : false;
			}
		}
		return hasAttr;
	}
	/**
	 * If a node has a property which is not an attribute
	 * @private
	 * @param {HTMLElement} $node
	 * @param {string} prop
	 * @returns {boolean}
	 */
	hasProp ($node, prop) {
		let hasProp = false;
		if($node && !this.isNumeric(prop)) {
		    let has = $node[prop] !== undefined;
		    if(has && $node[prop] === null && prop === "value") {
				has = false;
			}
			hasProp = (has &&! ($node[prop] instanceof Node)) &&! $node.hasAttribute(prop);
		}
		return hasProp;
	}

	/**
	 * Set the value of a property which is true/false
	 * @private
	 * @param {HTMLElement} $node
	 * @param {string} key
	 * @param {*} value
	 */
	setPropOrAttr ($node, key, value) {
	    if(this.hasProp($node, key)) {
	    	try {
				$node[key] = value;
			} catch(ignore) { //If fails, set it as attribute: (e.g. input.list)
				this.setAttr($node, key, value);
			}
	    } else {
	        this.setAttr($node, key, value);
    	}
	}

    /**
     * Set attribute to node. If value is false, will remove it.
	 * @private
	 * @param {HTMLElement} $node
	 * @param {string} key
	 * @param {*} value
     */
	setAttr ($node, key, value) {
        if(value) {
            $node.setAttribute(key, value);
        } else {
            $node.removeAttribute(key);
        }
	}
	/**
	 * Define a property to an object
	 * @private
	 * @param {Object} obj
	 * @param {string} prop
	 * @param {string} def
	 */
	defineProp (obj, prop, def) {
		if(this.isObject(obj)) {
			if(obj[prop] === undefined) {
				Object.defineProperty(obj, prop, {
					enumerable: false,
					writable: true
				});
				obj[prop] = def;
			}
		}
	}
	/**
	 * Creates a Node using HTML code
	 * @param {string} html
	 * @returns {HTMLElement}
	 */
	htmlElement(html) {
		//return document.createRange().createContextualFragment(html); FIXME
		const template = this.newElement("template");
        template.innerHTML = html.trim();
        return template.content.firstChild;
	};
	/**
	 * Creates a Node with a tag name
	 * @param {string} tagName
	 * @returns {HTMLElement}
	 */
	newElement(tagName) {
		return document.createElement(tagName);
	};
	/**
	 * Creates an empty node (DocumentFragment)
	 * @returns {DocumentFragment}
	 */
	newEmptyNode() {
		return new DocumentFragment()
	}
	/**
	 * Get all methods of class object
	 * https://stackoverflow.com/a/67260131/196507
	 * @param {object} obj
	 * @returns {Array}
	 */
	getMethods(obj) {
		const o = Reflect.getPrototypeOf(obj);
		const x = Reflect.getPrototypeOf(o);
		return Reflect.ownKeys(o).filter(it => Reflect.ownKeys(x).indexOf(it) < 0);
	};
	/**
	 * Append all child from one node to another
	 * @param {HTMLElement} $srcNode
	 * @param {HTMLElement} $tgtNode
	 */
	appendAllChild($srcNode, $tgtNode) {
		//Update all at once
		//$node.append(...$outElem.childNodes); //<-- works but it is slower
		while ($srcNode.firstChild) {
			$tgtNode.append($srcNode.firstChild);
		}
	}
	/**
	 * Prepend all child from one node to another
	 * @param {HTMLElement} $srcNode
	 * @param {HTMLElement} $tgtNode
	 */
	prependAllChild($srcNode, $tgtNode) {
		//Update all at once
		//$node.append(...$outElem.childNodes); //<-- works but it is slower
		while ($srcNode.firstChild) {
			$tgtNode.prepend($srcNode.firstChild);
		}
	}
}

/**
 * @author: A. Lepe
 * @url : https://gitlab.com/intellisrc/m2d2/
 * @since: May, 2018
 * @version: 2.0.0
 * @updated: 2021-04-16
 *
 *
 * M2D2 Class
 */
class m2d2 {
    'use strict';
	_stored = {
		events : [],
		datasetNodes : [],
		datasets : [],
		styleNodes : [],
		styles : []
	}
	static storedEventsTimeout = 50; //ms to group same events
	static short = true; //Enable short assignation (false = better performance) TODO: document (use Proxy like: obj.a = "text")
	static updates = true; //Enable "onupdate" (false = better performance) TODO: document (use MutationObserver)
	static utils = new Utils();

	constructor() {}
	//------------------------- STATIC -----------------------------
	static instance = new m2d2();
	static extensions = {}; // Additional properties for DOM
	static main = (() => {
		const f = (selector, object) => {
			const node = this.instance.getProxyNode(selector, object);
			// TEST: 13
			if(node && node.onready && m2d2.utils.isFunction(node.onready)) {
				node.addEventListener("ready", node.onready, { once : true });
				// This will be called just after the object has been returned (to be sure it was created)
				// Without setTimeout "onready" would be the same as "onload".
				setTimeout(() => {
                    node.dispatchEvent(new CustomEvent('ready'));
				}, 10); //TODO: Document
			}
			// Store references to datasets (used later in onpudate dataset, style):
			["dataset","style"].forEach(i => {
			    if(node && node[i]) {
				    this.instance._stored[i + "s"].push(node[i]);
				    this.instance._stored[i + "Nodes"].push(node);
				}
			})
			return node;
		}
	    // Extends Utils:
	    m2d2.utils.getMethods(m2d2.utils).forEach(k => { f[k] = m2d2.utils[k] });
		return f;
	})();
	/**
	 * Initialization. Use: m2d2.ready()
	 * @param { function } callback
	 */
	static ready(callback) {
		document.addEventListener("DOMContentLoaded", () => {
            callback(m2d2.main);
		});
	}

	/**
	 * Execute something on load. It will search for extensions.
	 * @param {function} callback
	 * TEST: 00
	 */
	static load(callback) {
	    if(callback !== undefined) {
            const ext = callback(m2d2.main); //main can be extended here
            if(m2d2.utils.isObject(ext) && !m2d2.utils.isEmpty(ext)) {
                Object.keys(ext).forEach(k => {
                    if(m2d2.utils.isValidElement(k)) {
                        if(m2d2.extensions[k] === undefined) {
                            m2d2.extensions[k] = {};
                        }
                        // Check that we are not replacing any existing property:
                        const $node = m2d2.utils.newElement(k);
                        Object.keys(ext[k]).forEach(it => {
                            if(m2d2.utils.hasProp($node, it)) {
                                console.log("Warning: property [" + it + "] already exists " +
                                    "in node: [" + k + "] while trying to extend it. " +
                                    "Unexpected behaviour may happen.");
                            }
                        });
                        Object.assign(m2d2.extensions[k], ext[k]);
                    } else {
                        if(m2d2.extensions["*"] === undefined) {
                            m2d2.extensions["*"] = {};
                        }
                        const $node = m2d2.utils.newElement("div");
                        Object.keys(ext[k]).forEach(it => {
                            if(m2d2.utils.hasProp($node, it)) {
                                console.log("Warning: property [" + it + "] already exists " +
                                    "in Node while trying to extend it. " +
                                    "Unexpected behaviour may happen.");
                            }
                        });
                        Object.assign(m2d2.extensions["*"], ext[k]);
                    }
                });
            }
		}
		return m2d2.main; //TODO: documentation : const $ = m2d2.load();
	}
	/**
	 * M2D2 Will set all extensions to DOM objects //TODO: documentation
	 * @param {string, HTMLElement} selector
	 * @param {HTMLElement, Node} [$root]
	 * @returns {HTMLElement}
	 * TEST: 01
	 */
	extDom(selector, $root) {
		if(! selector) {  // Do not proceed if selector is null, empty or undefined
			console.error("Selector was empty");
			return null;
		}
		if($root === undefined) { $root = document }
		const $node = m2d2.utils.isNode(selector) ? selector : $root.querySelector(selector);
		if(! $node) {
			if(m2d2.utils.isString(selector)) {
				console.error("Selector: " + selector + " didn't match any element in node:");
				console.log($root);
			} else {
				console.error("Node was null");
			}
			return null;
		}
		if($node._m2d2 === undefined) {
			$node._m2d2 = true; //flag to prevent it from re-assign methods
			["parent","sibling","next","prev","find","findAll","onupdate","onready","show","onshow","inView","css","text","html","getData","index"].forEach(f => {
				if($node.hasOwnProperty(f)) {
					console.log("Node already had ["+f+"] property. It might cause unexpected behaviour.")
					console.log("You may need to update the M2D2 version or report it to: github.com/intellisrc/m2d2/")
				}
			});
			// Properties:
			// TEST: 01, ...
			Object.defineProperty($node, "text", {
				get() { return this.childNodes.length ? this.innerText : this.textContent; },
				set(value) {
					// text should only change Text nodes and not children: //TODO: documentation
					if(this.childNodes.length) {
						let found = false;
						this.childNodes.forEach(n => {
							if(n.constructor.name === "Text") {
								n.nodeValue = value;
								found = true;
							}
						});
						if(! found) {
							this.prepend(document.createTextNode(value));
						}
					} else {
						this.textContent = value
					}
				}
			});
			// TEST: 43,13,27,...
			Object.defineProperty($node, "html", {
				get() { return this.innerHTML; },
				set(value) { this.innerHTML = value;  }
			});
			// TEST: 02
			Object.defineProperty($node, "css", {   //TODO: document new behaviour
				get() {
				    return this.classList;
				},
				set(value) {
				    if(m2d2.utils.isArray(value)) {
    				    this.className = value.join(" ");
				    } else if(m2d2.utils.isString(value)) {
    				    this.className = value;
				    } else if(m2d2.utils.isPlainObject(value)) {
				        Object.keys(value).forEach(c => {
				            if(value[c]) {
				                this.classList.add(c);
				            } else {
				                this.classList.remove(c);
				            }
				        });
				    } else {
				        console.error("Trying to assign a wrong value to css : " + value);
				    }
				}
			});
			// TEST: 16
			Object.defineProperty($node, "show", {
				get() { //TODO: document
				    return m2d2.utils.isVisible(this);
				},
				set(show) {
                    const cssDisplay = () => {
                        return getComputedStyle(this, null).display;
                    };
                    const defaultDisplay = () => {
                        const b = document.getElementsByTagName("body")[0];
                        const t = document.createElement("template");
                        const n = document.createElement(this.tagName);
                        t.append(n);
                        b.append(t);
                        const display = getComputedStyle(n, null).display;
                        t.remove();
                        return display;
                    };
                    if(show) {
                        if(cssDisplay() === "none") {
                            if(this._m2d2_display) {
                                this.style.display = this._m2d2_display;
                            } else {
                                this.style.removeProperty("display");
                                if(cssDisplay() === "none") {
                                    const defaultShow = defaultDisplay();
                                    this.style.display = this.dataset.display || (defaultShow !== "none" ? defaultShow : "block");
                                }
                            }
                            // TEST: 16
                            if(this.onshow !== undefined && m2d2.utils.isFunction(this.onshow)) { //TODO: document onshow
                                this.onshow(this);
                            }
                        }
                    } else {
                        const stored = this.style.display !== "none" ? this.style.display : cssDisplay();
                        if(stored !== "none") {
                            this._m2d2_display = stored;
                        }
                        this.style.display = "none"
                    }
				}
			});
			//TODO: document how to extend
			//TODO: test
			let extend = {};
			if(m2d2.extensions["*"] !== undefined) {
				Object.assign(extend, m2d2.extensions["*"]);
			}
			if(m2d2.extensions[$node.tagName] !== undefined) {
				Object.assign(extend, m2d2.extensions[$node.tagName]);
			}
			// Functions:
			Object.assign($node, {
			    inView: () => { //TODO: document
			        return m2d2.utils.inView($node);
			    },
				next: () => { //TEST: 07
				    return $node.nextElementSibling;
				},
				prev: () => { //TEST: 07
                    return $node.previousElementSibling;
				},
				parent: () => { //TODO: test
					return this.extDom($node.parentElement);
				},
				sibling: (sel) => { //TODO: test
					return $node.parentElement.find(sel);
				},
				find: (it) => { // Test: 04
					const node = $node.querySelector(it)
					return node ? this.extDom(node) : null;
				},
				findAll: (it) => { //TEST: 05
					const nodeList = it === undefined ? Array.from($node.children) : $node.querySelectorAll(it);
					nodeList.forEach(n => { this.extDom(n) });
					return nodeList;
				},
			}, extend);
			// Some elements like <OPTION> already have index
			if($node.index === undefined) {
				$node.index = () => { //TEST: 07
					return Array.from($node.parentNode.children).indexOf($node);
				}
			}
			// Let attributes know about changes in values //TODO: test
			if(["INPUT", "TEXTAREA", "SELECT"].indexOf($node.tagName) >= 0 && m2d2.utils.hasAttrOrProp($node, "value")) {
				$node.oninput = function() { this.setAttribute("value", this.value )}
			}
			// Add getData() to form: //TODO: document
			if($node.tagName === "FORM") {
				$node.getData = function (includeNotVisible) { //TODO document: includeNotVisible
					const data = {};
					const fd = new FormData(this);
					const include = includeNotVisible || false;
					for (let pair of fd.entries()) {
                        const elem = $node.find("[name='"+pair[0]+"']");
						if(include || elem.type === "hidden" || elem.show) {
							data[pair[0]] = elem.type === "file" ? elem.files : pair[1];
                        }
					}
					return data;
				}
			}
			return $node;
		} else {
			return $node;
		}
	}
	/**
	 * M2D2 will create custom links and properties
	 * @param {string, HTMLElement, Node} selector
	 * @param {Object} object
	 * @returns {HTMLElement, Proxy}
	 * TEST: 03,...
	 */
	doDom(selector, object) {
		// When no selector is specified, set "body"
		if(m2d2.utils.isObject(selector) && object === undefined) {
			object = selector;
			selector = m2d2.utils.newEmptyNode(); //TODO: document
			if(object.warn === undefined) {
			    object.warn = false;
			}
		}
		if(!(m2d2.utils.isString(selector) || m2d2.utils.isElement(selector) || m2d2.utils.isNode(selector))) {
			console.error("Selector is not a string or a Node:")
			console.log(selector);
			return null;
		}
		if(m2d2.utils.isString(selector) &&! document.querySelector(selector)) {
		    console.log("Selected element doesn't exists: " + selector)
		    return null;
		}
		const $node = this.extDom(selector); // Be sure that $node is an extended DOM object
		// If there is no object return only extension
		if(object === undefined) { //TODO: documentation: extending nodes
			return $node;
		}
		object = this.plainToObject($node, object); // Be sure it's an object

		// TEST: 03
		// We filter-out some known keys:
		Object.keys(object).filter(it => ! ["tagName"].includes(it)).forEach(key => {
			let origValue = object[key];
			if(origValue === undefined || origValue === null) {
			    console.log("Value was not set for key: " + key + ", 'empty' was used in object: ");
			    console.log(object);
			    console.log("In node:");
			    console.log($node);
			    origValue = "";
	 		}
            //Look for onupdate inline ([ Node, string ])
            let value = this.updateValue($node, key, origValue);
			//Look for property first:
			let isProp = m2d2.utils.hasProp($node, key);
			let isAttr = m2d2.utils.hasAttr($node, key);
			//Identify if value matches property type:
			let foundMatch = false;
			if(isAttr || isProp) {
				// noinspection FallThroughInSwitchStatementJS
				switch(true) {
					// Math found:
					case key === "value" && m2d2.utils.hasProp($node, "valueAsDate") && value instanceof Date: // Dates
						key = "valueAsDate"; //renamed value to valueAsDate
					case key === "css": // css is a Proxy so it fails to verify:
					case typeof value === typeof $node[key]: //Same Time
					case m2d2.utils.isString($node[key]) && m2d2.utils.isNumeric(value): //Numeric properties
					case (m2d2.utils.isFunction(value) && m2d2.utils.isObject($node[key])): //Functions
					case m2d2.utils.isBool(value) && m2d2.utils.isString($node[key]): //Boolean
					case typeof $node[key] === "object" && $node.tagName === "INPUT": //Cases like "list" in input
						foundMatch = true;
						break;
				}
			}
			// Properties and Attributes:
			if(foundMatch) {
				let error = false;
				switch(key) {
					case "classList": //TODO: test
						if(m2d2.utils.isArray(value)) {
							value.forEach(v => {
								$node[key].add(v);
							});
						} else if(m2d2.utils.isString(value)) {
							$node[key].add(value);
						} else {
							error = true;
						}
						break
					case "style": //TODO: test
					case "dataset": //TODO: as it is already a DOM, we don't need it maybe?
						if(m2d2.utils.isPlainObject(value)) {
							Object.keys(value).forEach(k => {
								$node[key][k] = this.updateValue($node[key], k, value[k]);
							});
						} else {
							error = true;
						}
						break
					default:
						switch(true) {
							case m2d2.utils.isBool(value): // boolean properties
							case m2d2.utils.hasAttrOrProp($node, key):
                                m2d2.utils.setPropOrAttr($node, key, value);
								break
							default:
								$node[key] = value;
						}
				}
				if(error) {
					console.error("Invalid value passed to '" + key + "': ")
					console.log(value);
					console.log("Into Node:");
					console.log($node);
				}
			// Look for elements:
			} else {
			    const options = [];
			    try {
			        // TEST: 03
			        // Functions can not be placed directly into elements, so we skip
			        if(key !== "template" &&! m2d2.utils.isFunction(value)) {
                        //Look for ID:
                        if(key && key.match(/^\w/)) {
                            let elem = $node.find("#" + key);
                            if(elem && options.indexOf(elem) === -1) { options.push(elem); }
                            //Look for name:
                            elem = $node.find("[name='"+key+"']");
                            if(elem && options.indexOf(elem) === -1) { options.push(elem); }
                            //Look for class:
                            const elems = Array.from($node.findAll("." + key)).filter(i => options.indexOf(i) < 0)
                            if(elems.length > 0) { elems.forEach(e => options.push(e)) }
                        }
                        //Look for element or free selector (e.g: "div > span"):
                        const elems =  Array.from($node.findAll(key)).filter(i => options.indexOf(i) < 0)
                        if(elems.length > 0) { elems.forEach(e => options.push(e)) }
                    }
				} catch(e) {
				    console.error("Invalid selector: " + key);
				    console.log(e);
				    return;
				}
				if(options.length > 1) {
					const items = [];
					options.forEach(item => {
						items.push(this.render(item, key, value));
					});
					this.linkNode($node, key, items);
					if(value.warn === undefined || value.warn !== false) { //TODO: document
						console.log("Multiple elements were assigned with key: [" + key + "] under node: ")
						console.log($node);
						console.log("It might be what we expect, but if it is not expected it could result " +
									"on some elements mistakenly rendered. You can specify " +
									"'warn : false' under that element to hide this message.") //TODO: add link to reference
					}
				} else if(options.length === 1) { // Found single option: place values
					const opt = options[0];
					if(m2d2.utils.isElement(opt)) { //TODO: test (no template or no items)
                        const obj = this.plainToObject(opt, value);
                        const opt_key = m2d2.utils.isPlainObject(obj) && Object.keys(obj).length >= 1 ? Object.keys(obj)[0] : null;
                        if(opt_key) {
                            value = this.updateValue(opt, opt_key, origValue);
                        }
						if(m2d2.utils.isArray(value)) { // Process Array
							const template = object["template"];
							this.doItems(opt, value, template);
							this.linkNode($node, key, opt);
						} else { // Normal Objects:
							this.renderAndLink($node, opt, key, value);
						}
					} else {
						console.error("BUG: It should have been a node but got: ");
						console.log(opt);
						console.log("Parent node:")
						console.log($node);
					}
				} else if(options.length === 0) { //No options found: create nodes
				    // Make "items" optional: //TODO: document
					if(key === "template" && object["items"] === undefined) {
					    key = "items";
					    value = [];
					}
					const isFunc = m2d2.utils.isFunction(value);
					if(value.tagName !== undefined) {
						const $newNode = this.appendElement($node, value.tagName);
						this.renderAndLink($node, $newNode, key, value);
					} else if(m2d2.utils.isValidElement(key) &&! isFunc) {
						const $newNode = this.appendElement($node, key);
						this.renderAndLink($node, $newNode, key, value);
					} else if(key === "items") { //Items creation
						const template = object["template"];
						// Allow use of plain object to specify value -> text //TODO: documentation
						if(m2d2.utils.isPlainObject(value)) {
						    const valTmp = [];
						    Object.keys(value).forEach(o => {
						    	let obj;
						    	if($node.tagName === "DL") { //TODO: document DL
									obj = { dt : o, dd : value[o] }
								} else {
									obj = { text: value[o] };
									if (m2d2.utils.hasAttrOrProp($node, "value")) {
										obj.value = o;
									} else {
										obj.dataset = {id: o};
									}
								}
								valTmp.push(obj);
							});
						    value = valTmp;
						}
						// Process Array:
						if(m2d2.utils.isArray(value)) {
							this.doItems($node, value, template);
						} else {
							console.log("Warning: 'items' specified but value is not and array, in element: ");
							console.log($node);
							console.log("Passed values are: ");
							console.log(value);
						}
    				} else if(isFunc) {
						if(m2d2.updates) {
						    // By using addEventListener we can assign multiple listeners to a single node //TODO: document
							if (key === "onupdate") {
								$node.addEventListener("update", value, true); //TODO: document
							}
						}
						$node[key] = value;
					} else if(key !== "template" && (key !== "warn" && value !== false)) { //We handle templates inside items
						if(object.warn === undefined || object.warn !== false) { //TODO: document
							console.error("Not sure what you want to do with key: " + key + " under element: ");
							console.log($node);
							console.log("And object:");
							console.log(object);
							console.log("Most likely the element's property or child no longer exists or the value" +
										" passed to it is incorrect.");
							console.log("You can set 'warn : false' property to the element to dismiss this message.");
						}
						$node[key] = value;
					}
				}
			}
		});
		// Dispatch onload event (if its not native): //TODO: Document
		if($node.onload) {
		    const native = ["BODY","FRAME","IFRAME","IMG","LINK","SCRIPT","STYLE"].indexOf($node.tagName) >= 0;
		    const inputImage = $node.tagName === "INPUT" && $node.type === "image";
		    if(! (native || inputImage)) {
		        // We don't need to add the event as it exists natively and it was assigned during: $node.onload = ...;
                $node.dispatchEvent(new CustomEvent('load'));
		    }
		}
		return $node;
	}

    /**
     * Identify if value is an update link (inline onupdate)
	 * @param {*} value
     * @returns {boolean}
     */
    isUpdateLink(value) {
        let isLink = false
        if(m2d2.utils.isArray(value) && (value.length === 2 || value.length === 3)) {
            const twoArgs = value.length === 2;
            // First element in array must be Node || DomStringMap (dataset) || CSSStyleDeclaration (style)
            const acceptedType = m2d2.utils.isNode(value[0]) ||
                value[0] instanceof DOMStringMap ||
                value[0] instanceof CSSStyleDeclaration
            // Second must be 'string' and Third can be a 'function'
            const otherTypes = twoArgs ? m2d2.utils.isString(value[1]) :
                          m2d2.utils.isString(value[1]) && m2d2.utils.isFunction(value[2]);
            // If only two args are in array, add an empty function:
            isLink = acceptedType && otherTypes;
            if(isLink && twoArgs) { value.push(v => { return v; }) } //TODO: Document function
        }
        return isLink
    }

    /**
	 * Convert plain value into object if needed
	 * @param {HTMLElement, Node} $node
	 * @param {*} value
	 */
    plainToObject($node, value) {
		if(!m2d2.utils.isPlainObject(value) &&! m2d2.utils.isFunction(value) &&! m2d2.utils.isElement(value)) {
			// When setting values to the node (simplified version):
			if(m2d2.utils.isHtml(value)) {
				value = { html : value };
		    } else if(this.isUpdateLink(value)) {
                const obj  = value[0];
                const prop = value[1];
                const callback = value[2];
		        let tmpVal = this.plainToObject($node, callback(obj[prop]));
		        if(m2d2.utils.isPlainObject(tmpVal)) {
		            const newValue = {};
		            Object.keys(tmpVal).forEach(k => {
		                newValue[k] = value;
		            });
		            value = newValue;
		        }
			} else if(m2d2.utils.isArray(value)) {
			    value = { items : value };
			} else if(m2d2.utils.hasAttrOrProp($node, "value")) {
				// If the parent is <select> set also as text to item:
				if($node.tagName === "SELECT") {
				    value = {
				        value : value,
				        text  : value
				    };
				} else if($node.tagName === "BUTTON") {
				    value = { text : value };
				} else {
				    value = { value : value };
				}
			} else if(m2d2.utils.isString(value) && $node.tagName === "IMG") {
			    value = { src : value };
			} else if(m2d2.utils.isString(value) || m2d2.utils.isNumeric(value)) {
				value = { text : value };
			}
		}
		return value;
    }
	/**
	 * Render and Link a node
	 * @private
	 * @param {HTMLElement} $root
	 * @param {HTMLElement} $node
	 * @param {string} key
	 * @param {*} value
	 */
	renderAndLink($root, $node, key, value) {
		const $child = this.render($node, key, value);
		this.linkNode($root, key, $child);
	}
	/**
	 * Render some value in a node
	 * @private
	 * @param {HTMLElement} $node
	 * @param {string} key
	 * @param {*} value
	 * @returns {Proxy, HTMLElement}
	 */
	render($node, key, value) {
	    value = this.plainToObject($node, value);
		return this.doDom($node, value); // Recursive for each element
	}

	/**
	 * Links a property to a child node
	 * @private
	 * @param {HTMLElement} $node
	 * @param {String} key
	 * @param {HTMLElement} $child
	 */
	linkNode($node, key, $child) {
		if($node[key] === $child) {
			const $proxy = this.proxy($child);
			try {
				$node[key] = $proxy;
			} catch(ignore) {
				//NOTE: although it fails when using forms, form is a proxy so it still works.
			}
			$node["$" + key] = $proxy;
		} else if(m2d2.utils.hasAttrOrProp($node, key)) { // Only if its not an attribute or property, we "link" it.
			$node["$" + key] = $child; //Replace name with "$" + name
			console.log("Property : " + key + " existed in node: " + $node.tagName +
			". Using $" + key + " instead for node: " + $child.tagName + ".")
		} else {
			$node[key] = this.proxy($child);
		}
	}
	/**
	 * Creates a dom element inside $node
	 * @private
	 * @param {HTMLElement} $node
	 * @param {string} tagName
	 * @returns {HTMLElement}
	 */
	appendElement ($node, tagName) {
		const $newElem = m2d2.utils.newElement(tagName);
		$node.append($newElem);
		return $newElem;
	}

    /**
	 * Get an item to be added
	 * @param {HTMLElement|null} $node
	 * @param {number|string} index
	 * @param {*} obj
	 * @param {HTMLElement} $template
	 */
	getItem($node, index, obj, $template) {
	    if(!$template) {
		    $template = this.getTemplate($node);
		}
        const $newItem = $template.cloneNode(true);
	    // Copy templates to new item:
	    this.addTemplatesToItem($template, $newItem);
        $newItem.dataset.id = index;
        // Add "selected" property
        this.setUniqueAttrib($newItem, "selected"); //TODO: Document
        // Set values and links
		let $newNode = this.doDom($newItem, obj);
		// Place Events:
		return this.getItemWithEvents($node, $newNode);
	}

	/**
	 * Reassign templates
	 * @param {HTMLElement, Node} $template
	 * @param {HTMLElement, Node} $newNode
	 * @returns {HTMLElement|Proxy}
	 // TODO: this does not support deep location of templates
	 */
	addTemplatesToItem($template, $newNode) {
	    ["_template","__template"].forEach(key => {
            if($template[key] !== undefined) {
                $newNode[key] = $template[key];
            }
        });
	}

	/**
	 * Returns a Node with events
	 * @param {HTMLElement, Node} $node
	 * @param {HTMLElement, Node} $newNode
	 * @returns {HTMLElement|Proxy}
	 //FIXME: I think `this.doDom` could be removed from here and only "link" events
	 */
	getItemWithEvents($node, $newNode) {
		if($node.__template !== undefined) {
			const scan = (object, result) => {
				result = result || {};
				Object.keys(object).forEach(key=> {
					if (m2d2.utils.isPlainObject(object[key])) {
						result[key] = scan(object[key]);
					} else if(m2d2.utils.isFunction(object[key])) {
						result[key] = object[key];
					}
				});
				return result;
			}
			let tree = scan($node.__template);
			if(!m2d2.utils.isEmpty(tree)) {
				tree = tree[Object.keys(tree)[0]];
				$newNode = this.doDom($newNode, tree);
			}
		}
		return $newNode;
	}

	/**
	 * Process items
	 * @private
	 * @param {HTMLElement} $node
	 * @param {Array} values
	 * @param {Object} template
	 */
	doItems ($node, values, template) {
	    // Create the structure for the item:
		const $template = this.getTemplate($node, template);
		if($template === undefined) {
			console.error("Template not found. Probably an array is being used where it is not expected. Node:");
			console.log($node);
			console.log("Value (mistaken?):")
			console.log(values);
			return;
		}
		// Fill the template with data:
		let i = 0;
		values.forEach(val => {
		    val = this.plainToObject($node, val);
		    const $newItem = this.getItem($node, i++, val, $template);
		    if($newItem) {
			    $node.append($newItem);
			}
		});
		// Cleanup
		const $temp = $node.find("template");
		if($temp) { $node.removeChild($temp); }
		// Set "items" link:
		$node.items = $node.children;
		this.extendItems($node);
	}
	/** Returns an HTMLElement with the structure without events
	 * @private
	 * @param {HTMLElement} $node
	 * @param {Object, string} [template]
	 * @returns {HTMLElement}
	 */
	getTemplate ($node, template) {
		// If we already have the template, return it:
		if($node._template !== undefined && $node._template !== "") {
			return $node._template;
		} else {
			let $template;
			const $htmlTemplate = $node.querySelector("template"); // look into HTML under node
			if($htmlTemplate) {
				$template = m2d2.utils.htmlElement($htmlTemplate.innerHTML.trim());
			} else {
                switch ($node.tagName) {
                    case "SELECT":
                    case "DATALIST":
                        $template = m2d2.utils.newElement("option");
                        break;
                    case "UL":
                    case "OL":
                        $template = m2d2.utils.newElement("li");
                        break;
                    case "NAV":
                        $template = m2d2.utils.newElement("a");
                        break;
                    case "DL":
                        $template = m2d2.utils.newElement("dd");
                        break;
                    default:
                        if(template) {
                            const children = Object.keys(template).length;
                            if(children) {
                                if(children > 1) {
                                    if(template.tagName !== undefined) { //TODO: document (optional top child when using tagName)
                                        let wrap = {};
                                        wrap[template.tagName] = template;
                                        template = wrap;
                                    } else {
                                        console.log("Template has more than one top elements. Using the first one. In: ");
                                        console.log(template);
                                        console.log("Node: ");
                                        console.log($node);
                                    }
                                }
                                const key = Object.keys(template)[0];
                                const val = template[key];
                                if(m2d2.utils.isValidElement(key)) {
                                    $template = m2d2.utils.newElement(key);
                                } else if(val.tagName !== undefined) {
                                    $template = m2d2.utils.newElement(val.tagName);
									template[val.tagName] = val;
									delete(template[key]);
                                } else {
                                    console.error("Template defined an element which can not be identified: [" + key + "], using <span> in:");
                                    console.log(template);
                                    console.log("Node: ");
                                    console.log($node);
                                    $template = m2d2.utils.newElement("span");
                                }
                            } else {
                                console.error("Template has no definition, and it can not be guessed. Using <span>. Template: ");
                                console.log(template);
                                console.log("Node: ");
                                console.log($node);
                                $template = m2d2.utils.newElement("span");
                            }
                        } else {
                            // If not template is found, use html as of element
                            if($node.childElementCount > 0) {
                                $template = m2d2.utils.htmlElement($node.innerHTML.trim());
                            }
                        }
                        break;
                }
            }
			if (template) {
				if (m2d2.utils.isPlainObject(template)) {
				    const $wrap = m2d2.utils.newEmptyNode();
				    $wrap.append($template);
					const $fragment = this.doDom($wrap, template);
					$template = $fragment.children[0];
					m2d2.utils.defineProp($node, "__template", template); // This is the original template with events
				} else if (m2d2.utils.isHtml(template)) {
					$template = m2d2.utils.htmlElement(template);
				} else if (m2d2.utils.isSelectorID(template)) { //Only IDs are allowed //TODO document
					$template = m2d2.utils.htmlElement(document.querySelector(template).innerHTML);
				} else { //When its just a tag name
					$template = m2d2.utils.newElement(template);
				}
			}
			if($template.childrenElementCount > 1) {
			    console.log("Templates only supports a single child. Multiple children were detected, wrapping them with <span>. Template:");
			    console.log($template);
			    const $span = m2d2.utils.newElement("span");
			    $span.append($template);
			    $template = $span;
			}
			if ($template) {
				m2d2.utils.defineProp($node, "_template", $template); // This is the DOM
			}
			return $template;
		}
	}

	/**
	 * It will set a unique attribute among a group of nodes (grouped by parent)
	 * @private
	 * @param {HTMLElement, Node} $node
	 * @param {string} key
	 */
	setUniqueAttrib($node, key) {
        if(! $node.hasOwnProperty(key)) {
            Object.defineProperty($node, key, {
                get : function()    {
                    return this.hasAttribute(key);
                },
                set : function(val) {
                    const prevSel = this.parentNode ? this.parentNode.find("["+key+"]") : null;
                    if(prevSel) {
                        prevSel.removeAttribute(key);
                    }
					m2d2.utils.setAttr(this, key, val);
                }
            });
        }
	}

    /**
     * Handle [ Node, string ] values (inline onupdate)
     * @private
	 * @param {HTMLElement} $node
	 * @param {string} key
	 * @param {*} value
     */
    updateValue($node, key, value) {
		// TEST: 06
        if(this.isUpdateLink(value)) {
			const _this = this;
            const obj  = value[0];
            const prop = value[1];
            const callback = value[2];
			value = obj[prop];
			if(obj instanceof CSSStyleDeclaration && this._stored.styles.includes(obj)) {
				const parent = this._stored.styleNodes[this._stored.styles.indexOf(obj)];
				if(m2d2.updates) {
					parent.onupdate = function (ev) {
						if (ev.detail && ev.detail.property === "style" && ev.detail.newValue.startsWith(prop + ":")) {
							_this.setShortValue($node, key, callback(this.style[prop]));
						}
					}
				}
			} else if(obj instanceof DOMStringMap && this._stored.datasets.includes(obj)) {
				const parent = this._stored.datasetNodes[this._stored.datasets.indexOf(obj)];
				if(m2d2.updates) {
					parent.onupdate = (ev) => {
						if (ev.detail && ev.detail.property === "data-" + prop) {
							_this.setShortValue($node, key, callback(ev.detail.newValue));
						}
					}
				}
			} else {
				if(m2d2.updates) {
					obj.onupdate = (ev) => {
						if (ev.detail && ev.detail.property === prop) {
							if (!m2d2.utils.isObject($node[key])) {
								_this.setShortValue($node, key, callback(ev.detail.newValue));
							}
						}
					}
				}
			}
		}
		return value;
	}

	/**
	 * Place a value either in a property or in a node (short)
	 * @param $node {Node}
	 * @param key {string}
	 * @param value {*}
	 */
	setShortValue($node, key, value) {
		if(m2d2.utils.isNode($node[key])) {
			if(m2d2.short) {
				const o = this.plainToObject($node[key], value);
				const k = m2d2.utils.isPlainObject(o) && Object.keys(o).length >= 1 ? Object.keys(o)[0] : null;
				if (k) {
					$node[key][k] = value;
				}
			} else {
				console.log("Short is disabled. Trying to set a value ("+value+") in a node:")
				console.log($node[key]);
				console.log("Either turn on 'short' functionality, or be sure you specify the property, like: 'node.text'")
			}
		} else {
			$node[key] = value
		}
	}

	/**
	 * Place a value either in a property or in a node (short)
	 * @param $node {Node}
	 * @param key {string}
	 * @param sample {*} Sample value (to automatically guess property)
	 * @returns {*} current value
	 */
	getShortValue($node, key, sample) {
		let value = null;
		if(m2d2.utils.isNode($node[key])) {
			if(m2d2.short) {
				const o = this.plainToObject($node[key], sample || "");
				const k = m2d2.utils.isPlainObject(o) && Object.keys(o).length >= 1 ? Object.keys(o)[0] : null;
				if (k) {
					value = $node[key][k];
				}
			} else {
				console.log("Short is disabled. Trying to get a value from node:")
				console.log($node[key]);
				console.log("Either turn on 'short' functionality, or be sure you specify the property, like: 'node.text'")
			}
		} else {
			value = $node[key];
		}
		return value;
	}

	/**
	 * Basic Proxy to enable assign values to elements
	 * for example: div.a = "Click me" (instead of using: div.a.text)
	 * NOTE: for reading, "div.a" will return a Node and not the value.
	 * @private
	 * @param {Object} obj
	 * @param {boolean} [force] Force to update
	 * @returns {Proxy, Object}
	 */
	proxy (obj, force) {
	    if(!m2d2.short || (obj === null || (obj._proxy !== undefined && force === undefined))) {
	        return obj;
	    } else {
	        obj._proxy = obj;
            const handler = {
                get: (target, property) => {
                    const t = target[property];
                    switch (true) {
						case t === null || t === undefined: return null;
                    	// Functions should bind target as "this"
						case m2d2.utils.isFunction(t): return t.bind(target);
						// If there was a failed attempt to set proxy, return it on read:
						case t._proxy && target["$" + property] !== undefined: return target["$" + property];
						case t._proxy === undefined && m2d2.utils.isElement(t): return this.proxy(t);
						default: return t;
					}
                },
                set: (target, property, value) => {
                    let oldValue = "";
                    if(m2d2.utils.isElement(target[property])) {
						oldValue = this.getShortValue(target, property, value);
						this.setShortValue(target, property, value);
                    } else if(property === "onupdate") {
                    	if(m2d2.updates) {
							if (m2d2.utils.isFunction(value)) {
						        // By using addEventListener we can assign multiple listeners to a single node
								target.addEventListener("update", value, true);
								oldValue = target[property];
								target[property] = value;
							} else {
								console.error("Value passed to 'onupdate' is incorrect, in node:");
								console.log(target);
								console.log("Value: (not a function)");
								console.log(value);
							}
						} else {
                    		console.log("Updates are not available when `m2d2.updates == false`:")
							console.log(target);
						}
                    } else if(property === "items") { //Reset items
                        target.items.clear();
                        this.doItems(target, value);
                    } else {
                        oldValue = target[property];
                        value = this.updateValue(target, property, value);
                        target[property] = value;
                    }
					// Check for onupdate //TODO: document
					// This will observe changes on values
					if(m2d2.updates && target.onupdate !== undefined) {
					    if(value !== oldValue) {
                            target.dispatchEvent(new CustomEvent("update", {
                                detail: {
                                    type     : typeof value,
                                    property : property,
                                    newValue : value,
                                    oldValue : oldValue
                                }
                            }));
					    }
					}
                    return true;
                }
            };
            return new Proxy(obj, handler);
		}
	}

	/**
	 * Function passed to MutationObserver
	 * @private
	 * @param {MutationRecord} mutationsList
	 * @param {MutationObserver} observer
	 */
	onObserve(mutationsList, observer) {
		mutationsList.forEach(m => {
			const target = m.target;
			// We store the events to remove immediately repeated events.
			// Forms will link elements which can not be set as proxy so we
			// add a link named `"$" + key` but this have the side effect to
			// generate two triggers (one for the element and one for the Proxy).
			if(this._stored.events.indexOf(m) >= 0) { return } else {
				this._stored.events.push(m);
				setTimeout(() => {
					const i = this._stored.events.indexOf(m);
					if(i >= 0) { this._stored.events.splice(i, 1); }
				}, m2d2.storedEventsTimeout); //TODO: this will prevent repeated events to be triggered in less than 50ms : document
			}
			// Check for onupdate //TODO: document
			if(target.onupdate !== undefined) {
				if(m.type === "attributes") {
					const value = m2d2.utils.getAttrOrProp(target, m.attributeName);
					if(value !== m.oldValue) {
                        target.dispatchEvent(new CustomEvent("update", {
                            detail: {
                                type     : typeof value,
                                property : m.attributeName,
                                newValue : value,
                                oldValue : m.oldValue
                            }
                        }));
                    }
				} else if(m.type === "childList") { //TODO: improve for other types
				    const $child = m.addedNodes[0] || m.removedNodes[0];
					if($child.nodeName === "#text") {
						const value = m.addedNodes[0].textContent;
						const oldValue = m.removedNodes.length ? m.removedNodes[0].textContent : null;
						if(value !== oldValue) {
                            target.dispatchEvent(new CustomEvent("update", {
                                 detail: {
                                     type     : typeof value,
                                     property : "text",
                                     newValue : value,
                                     oldValue : oldValue
                                 }
                             }));
                         }
					} else if(target.items !== undefined) { //Items updated
					    //TODO: Document: in case of items, "new = added", "old = removed"
						const value = m.addedNodes;
						const oldValue = m.removedNodes;
						if(value !== oldValue) {
                            target.dispatchEvent(new CustomEvent("update", {
                                 detail: {
                                     type     : typeof value,
                                     property : "items",
                                     newValue : value,
                                     oldValue : oldValue
                                 }
                             }));
                         }
					}
				}
			}
		});
	}
	/**
	 * Add MutationObserver to object
	 * @private
	 * @param { HTMLElement } $node
	 */
	observe($node) {
		if(m2d2.updates) {
			const mutationObserver = new MutationObserver(this.onObserve.bind(this))
			const options = {
				attributeOldValue: true
			}
			options.subtree = true;
			options.childList = true;
			const toObserve = $node._proxy || $node;
			mutationObserver.observe(toObserve, options);
		}
	}

	/**
	 * Get the root node as proxy
	 * @private
	 * @param {string|HTMLElement} selector
	 * @param {Object} obj
	 */
	getProxyNode(selector, obj) {
		const $node = this.doDom(selector, obj);
		if($node) {
		    this.observe($node);
		    return this.proxy($node);
		}
	}

	/**
	 * Extends "items"
	 * @private
	 * @param {NodeList, HTMLCollection} $node
	 */
	extendItems($node) {
		// We try to add most of the array functions into NodeList and HTMLCollection:
		// NOTE: Not all will work as expected.
		// NOTE: function() {} is not the same here as () => {} as "this" is not as expected
		function reattach(items) {
			items.forEach(itm => {
				const parent = itm.parentNode;
				const detatchedItem = parent.removeChild(itm);	//We detach from original parent
				$node.append(detatchedItem); //Attach to $node (works with non-existing elements)
			});
		}
		const items = $node.items;
		// Non-Standard or non-existent in Array:
		const nonStd = ["clear", "get", "remove", "selected", "first", "last", "findAll"];
		// Array properties:
		Object.getOwnPropertyNames(Array.prototype).concat(nonStd).forEach(method => {
			if(items[method] === undefined) {
				let func = null;
				const _this = this;
				switch (method) {
				    //-------------------- Same as in Array --------------------------
					case "copyWithin": // copy element from index to index
					case "fill": // replace N elements in array
					case "splice": // add or remove elements
					    func = function() {
					        console.log("Not available yet: " + method);
					    }
					    break;
					case "reverse": // reverse the order
						func = function(...args) {
					        if(this.items.length) {
                                const items = Array.from(this.items); //Keep a copy
                                const retObj = items[method](...args);
                                reattach(items);
                                return retObj;
							}
						}
						break;
					//--------------------- Special Implementation --------------------
					case "clear": // parentNode.replaceChildren() can also be used
						func = function() {
							while(this.items[0]) this.items[0].remove()
						}
						break;
					case "get": // will return the item with data-id:
					    func = function(id) {
					        let found = null;
					        if(this.items.length) {
					            this.items.some(item => {
					                const sameId = m2d2.utils.isNumeric(id) ? (item.dataset.id * 1) === id * 1 : item.dataset.id === id;
					                if(item.dataset && sameId) {
					                    found = item;
					                    return true;
					                }
					            });
					        }
					        return found;
					    }
					    break;
					case "selected": // will return the selected item in list
					    func = function() {
					        return _this.proxy(this.find(":scope > " + "[selected]")); //only direct children
					    }
					    break;
					case "first": // returns the first item in list
					    func = function() {
					        return _this.proxy(this.items[0]);
					    }
					    break;
					case "last": // returns the last item in list
					    func = function() {
					        return _this.proxy(this.items[this.items.length - 1]);
					    }
					    break;
					case "pop" : //Remove and return last element:
					    func = function() {
					        if(this.items.length) {
                                const parent = this[0].parentNode;
                                return _this.proxy(parent.removeChild(this.items[this.items.length - 1]));
					        }
					    }
					    break;
					case "push": // Add one item at the end:
						func = function(obj) {
						    obj = _this.plainToObject(this, obj);
							if(m2d2.utils.isElement(obj)) {
								this.append(obj);
							} else if (m2d2.utils.isPlainObject(obj)) {
							    const index = this.items.length;
							    const $child = _this.getItem(this, index, obj);
							    this.appendChild($child);
							} else {
							    console.log("Trying to push an unknown value into a list:");
							    console.log(obj)
							}
						}
						break;
					case "remove": // will return the item with data-id:
					    func = function(id) {
					        if(this.items.length) {
					            const elem = this.items.get(id);
					            if(elem.length === 1) {
					                elem.remove();
					            }
					        }
					    }
					    break;
					case "shift": // remove and return first item:
					    func = function() {
					        if(this.items.length) {
                                const parent = this.items[0].parentNode;
                                return _this.proxy(parent.removeChild(this.items[0]));
					        }
					    }
					    break;
					case "sort": // You can pass a function to compare items:
						func = function(compareFunc) {
					        if(this.items.length) {
                                const items = Array.from(this.items); //Keep copy
                                items.sort(compareFunc || ((a, b) => {
                                    return a.text.localeCompare(b.text);
                                }));
                                reattach(items);
							}
						}
						break;
					case "unshift": // Add an item to the beginning
						func = function(obj) {
						    obj = _this.plainToObject(this, obj);
							if(m2d2.utils.isElement(obj)) {
								this.prepend(obj);
						    } else if (m2d2.utils.isPlainObject(obj)) {
							    const index = this.items.length;
							    const $child = _this.getItem(this, index, obj);
							    this.prepend($child);
							} else {
							    console.log("Trying to unshift an unknown value into a list:");
							    console.log(obj)
							}
						}
					    break;
					default: //----------------- Link to Array -------------------
					    let arrMethod = method;
						// noinspection FallThroughInSwitchStatementJS
						switch(true) {
					        case method === "findAll":
					            arrMethod = "filter"; // Use "filter"
                            case m2d2.utils.isFunction(Array.prototype[method]):
                                // Convert nodes to proxy so we can use short assignment
                                // at, concat, every, filter, find, findIndex, forEach, includes, indexOf, join,
                                // keys, lastIndexOf, map, reduce, reduceRight, slice, some, values
                                const arrFunc = function (...args) {
                                    const proxies = [];
                                    Array.from($node.items).forEach(n => {
                                        proxies.push(_this.proxy(n));
                                    });
                                    return Array.from(proxies)[arrMethod](...args);
                                }
                                switch(method) {
                                    // Change behaviour of find: //TODO: documentation
                                    case "find":
                                        func = function(...args) {
                                            if(m2d2.utils.isString(args[0])) {
                                                return this.find(args[0]);
                                            } else {
                                                return arrFunc(...args);
                                            }
                                        }
                                        break
                                    case "findAll":  //TODO: documentation
                                        func = function(...args) {
                                            if(args.length === 0) {
                                                return this.findAll();
                                            } else if(m2d2.utils.isString(args[0])) {
                                                return this.findAll(args[0]);
                                            } else {
                                                return arrFunc(...args);
                                            }
                                        }
                                        break
                                    case "concat": //TODO: documentation
                                        func = function(...args) {
                                            for(let i = 0; i < args.length; i++) {
                                                if(m2d2.utils.isArray(args[i])) {
                                                    for(let j = 0; j < args[i].length; j++) {
                                                        let obj = args[i][j];
							                            if(! m2d2.utils.isElement(obj)) {
                                                            obj = _this.plainToObject(this, args[i][j]);
                                                            if (m2d2.utils.isPlainObject(obj)) {
							                                    const index = this.items.length;
                                                                obj = _this.getItem(this, index, obj);
                                                            }
                                                        }
                                                        this.items.push(obj);
                                                    }
                                                }
                                            }
                                        }
                                        break
                                    default:
                                        func = arrFunc;
                                        break
                                }
						}
				}
				if(func) {
					m2d2.utils.defineProp(items, method, func.bind($node)); //bind: specify the "this" value
				}
			}
		});
	}
}
return m2d2;
}));

/**
  This player uses NDJSON files to play in sequence as a video
  Additionally, it may contain information about the frame
  Inspired in https://github.com/lepe/frame-player/ (by Vagner Santana)

 * https://github.com/lepe/ndjson-player
 * @author A.Lepe
 * @Since 2020-04-19
 */
class NdJsonPlayer {
    // Options
    loop;       //default: false
    autoplay;   //default: false

    // Status
    playing = false;   // Status
    loaded  = false;   // If a frame has been loaded or not
    started = false; // If the player already start playing at least 1 frame

    // Events
    onStart;    // Callback when we processed first image
    onLoad;     // Callback when data is completed loading
    onRender;   // Callback to return metadata when a frame is rendered
    onPlay;     // Callback when we start playing
    onStop;     // Callback when we stop playing
    onFinish;   // Callback when video reaches the last frame
    onError;    // Callback when there is an error with the source

    // Internal use mainly
    wrapper = null;     // DOM element which contains the <canvas> node
    canvas = null;     // <canvas> DOM object
    ctx = null;        // canvas.ctx object
    timer = null;      // TimerSrc used to manage FPS
    src = "";          // Video source URI (NDJSON)
    frame = 0;         // Current frame being played
    multiplier = 1;    // Multiplier to control speed

    // Private
    _frames = [];       // Video content including metadata (array)
    _renderItems = [];  // Objects to render
    _aspectRatio = 0;   // To be calculated later

    // General Configuration (Private)
    _general        = {
        numFrames       : 0,     // Number of total frames (in header)
        totTime         : 0,     // Number of total time (in header)
        frameBase       : "",     // Base for all frames 'fb'
        thumbBase       : "",     // Base for all thumbnails 'thb'
        startTimeStamp  : 0,      // Starting time stamp
        keepAspectRatio : true,
        framesPerSec    : 24,
        fontFamily      : "",
        fontSize        : 20,
        fontColor       : "yellow",
        totalTime       : "00:01:00",
        scale           : 1000,  // Number of pixels to use in canvas drawing (usually canvas width when it is not resized: background image/video width)
        zIndex          : 0,
    }

    /**
     * Examples:
     * new NdJsonPlayer("/videos/test.ndjson","canvas", { loop: true })
     * new NdJsonPlayer("/videos/test.ndjson", { loop: true })
     * new NdJsonPlayer("/videos/test.ndjson")
     *
     * @param src     .ndjson file (see format)
     * @param element : Node, HTML element (must be a canvas). If not set, it will use '<canvas>'
     * @param options : Object replacing default values
     * @param events  : Object containing events: (onstart, onload, onrender, onplay, onstop, onfinish, onerror)
     */
    constructor(src, element, options, events) {
        const _this = this;
        _this.src = src;
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        }
        const noEvent = (() => {});
        events = Object.assign({}, events);
        // Add events:
        _this.onStart    = events.onstart  || noEvent;
        _this.onLoad     = events.onload   || noEvent;
        _this.onRender   = events.onrender || noEvent;
        _this.onPlay     = events.onplay   || noEvent;
        _this.onStop     = events.onstop   || noEvent;
        _this.onFinish   = events.onfinish || noEvent;
        _this.onError    = events.onerror  || (e => { console.log(e); })
        // Fix and check arguments
        let player = null;
        if(element instanceof Node) {
            player = element;
        } else {
            if (typeof element == "object") {
                options = element;
                element = "canvas";
            } else if (typeof element != "string") {
                throw "Incorrect parameter passed to constructor of NdJsonPlayer";
            }
            // Look for canvas
            player = document.querySelector(element || "canvas");
        }
        if (player) {
            let canvasEl = null;
            if (player.tagName === "CANVAS") {
                canvasEl = player;
                // create wrapper container
                const wrapper = document.createElement('div');
                player.parentNode.insertBefore(wrapper, player);
                wrapper.prepend(player);
                player = wrapper;
            } else if(player.hasChildNodes()) {
                canvasEl = player.querySelector("canvas");
                if(!canvasEl) {
                    throw "No canvas found in element";
                }
            } else {
                canvasEl = document.createElement("CANVAS");
                player.prepend(canvasEl);
            }
            _this.canvas = 'OffscreenCanvas' in window ? canvasEl.transferControlToOffscreen() : canvasEl;
        } else {
            throw "Canvas element was not found in DOM: " + element;
        }
        _this.wrapper = player;
        _this.canvas.width  = _this.wrapper.parent().clientWidth;
        _this.canvas.height = _this.wrapper.parent().clientHeight;
        _this._aspectRatio = _this.canvas.height / _this.canvas.width;
        // Set classname for style
        player.classList.add("ndjp");

        // Set context
        _this.ctx = _this.canvas.getContext("2d");

        // Options:
        _this.fps        = options.fps || 24;
        _this.loop       = options.loop || false;
        _this.autoplay   = options.autoplay || false;
        _this.showfirst  = options.showfirst !== false;
        _this.path       = options.path || "";
        if(options.width  === "auto") { options.width  = 0; }
        if(options.height === "auto") { options.height = 0; }

        // Initialize timer:
        _this.timer = new TimerSrc(1000 / _this.fps);

        // Load video:
        if(false) { //FIXME _this.live) {
            new TimerSrc(1000 / _this.fps, () => {
                fetch(_this.src).then(res => res.json()).then(frame => {
                    _this.reload(frame);
                });
            }).play();
        } else if(_this.src && _this.autoplay) {
            _this.load();
        } else {
            console.log("Initializing without source...")
        }
    }
    /**
     * Reset frames information
     */
    _reset() {
        this._frames = [];
        this.loaded = false;
    }
    /**
     * Load a video file or change current video file.
     * @param callback when each frame is ready
     * @param newSrc optional (if not set will read "src" passed in constructor)
     */
    load(callback, newSrc) {
        const _this = this;
        if(newSrc !== undefined) {
            this.src = newSrc;
            this._reset();
        }
        async function processStream(url, callback) {
            const response = await fetch(url);
            const reader = response.body.getReader();
            const decoder = new TextDecoder(); // To decode the stream into text
            let buffer = '';
            let done = false;

            while (!done) {
                const { value, done: isDone } = await reader.read();
                done = isDone;

                // Decode the current chunk and append to the buffer
                buffer += decoder.decode(value, { stream: true });

                // Process each line
                let lineEndIndex;
                while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
                   const line = buffer.slice(0, lineEndIndex);
                   callback(line);
                   buffer = buffer.slice(lineEndIndex + 1); // Remove processed line from buffer
                }
            }
        }
        let header = true; // To force to process first frame right away
        processStream(this.src, frame => {
            if(header || _this.autoplay) {
                _this.processFrame(JSON.parse(frame), true);
                header = false;
            } else {
                _this.append(JSON.parse(frame));
            }
        });
    }
    /**
     * Replace current frames with new ones
     * @param frames : can be an array of objects (json), an object (single frame) or a string (ndjson)
     * @param callback : callback when each frame is ready
     */
    reload(frames, callback) {
        const _this = this;
        const fs = []
        _this._reset();

        switch(true) {
            case (typeof frames === 'string'):
                fs = frames.split(/[\r\n](?=.)/.map(JSON.parse));
                break
            case Array.isArray(frames):
                fs = frames
                break
            case (frames.constructor.name === "Object"):
                fs.push(frames)
                break
            default:
                console.log("Unable to reload frames. ")
                return;
            break
        }
        fs.forEach(item => {
            _this.processFrame(item);
            if(callback) {
                callback(item);
            }
        });
    }
    /**
     * Add frame at the end
     */
    append(frame) {
        const _this = this;
        _this._frames.push(frame);
    }
    /**
     * Add frame at the beginning
     */
    prepend(frame) {
        const _this = this;
        _this._frames.unshift(frame);
        _this.frame ++; //TODO: test
    }
    /**
     * Process a frame
     */
    //FIXME: when specifying width and height, the canvas is flickering due to resizing.
    processFrame(item, queue) {
        const _this = this;
        const canvas = _this.canvas;
        const ctx = _this.ctx;
        switch(item.i) {
            case "g": // General Config
                if(item.lp !== undefined) {
                    _this.loop = true;
                }
                if(item.w !== undefined) {
                    _this.canvas.width  = item.w;
                    if(item.sc == undefined) {
                        _this._general.scale = item.w;
                    }
                    _this._aspectRatio = _this.canvas.height / _this.canvas.width;
                }
                if(item.h !== undefined) {
                    _this.canvas.height = item.h;
                    _this._aspectRatio = _this.canvas.height / _this.canvas.width;
                }
                if(item.kar !== undefined) {
                    _this._general.keepAspectRatio = item.kar;
                }
                if(item.sc !== undefined) {
                    _this._general.scale = item.sc;
                }
                if(item.fps !== undefined) {
                    _this._general.framesPerSec = item.fps;
                }
                if(item.fb !== undefined) {
                    _this._general.frameBase = item.fb;
                }
                if(item.thb !== undefined) {
                    _this._general.thumbBase = item.thb;
                }
                if(item.tf !== undefined) {
                    _this._general.numFrames = item.tf;
                }
                if(item.tt !== undefined) {
                    _this._general.totTime = item.tt;
                }
                if(item.ts !== undefined) {
                    if(!_this._general.startTimeStamp) {
                        _this._general.startTimeStamp = item.ts;
                    }
                }
                if(item.fs !== undefined) {
                    _this._general.fontSize = item.fs;
                }
                if(item.fc !== undefined) {
                    _this._general.fontColor = item.fc;
                }
                if(item.ff !== undefined) {
                    _this._general.fontFamily = item.ff;
                }
                break
            case "c": // Circle
                if(item.f !== undefined) {
                } else {
                    console.log("Circle object didn't specify what?: " + item)
                }
                break
            case "q": // Square
                break
            case "t": // Text
                if(item.f !== undefined) {
                    const cw = canvas.width;
                    const scale = cw / (item.sc ||_this._general.scale);

                    ctx.font = ((item.fs || _this._general.fontSize) * scale) + "px " + (item.ff || _this._general.fontFamily);
                    ctx.fillStyle = item.fc || _this._general.fontColor;
                    ctx.fillText(item.f, item.x * scale || 0, item.y * scale || 0);
                    if(queue && _this._renderItems.indexOf(item.f) == -1) {
                        _this._renderItems.push(item);
                    }
                } else {
                    console.log("Text object didn't specify content: " + item)
                }
                break
            case "p": // Picture
                if(item.f !== undefined) {
                    const topLeft = !! item.tl;
                    const flipHoriz = !! item.fh;
                    const flipVert  = !! item.fv;
                    const cw = canvas.width;
                    const img = new Image();
                    img.src = item.f;
                    img.onload = () => {
                        function rotateImage(image, angle) {
                          const scale = cw / (item.sc ||_this._general.scale);
                          const imgWidth = (item.w * 1 || image.width) * scale;
                          const imgHeight = (item.h * 1 || image.height) * scale;

                          const halfWidth = Math.round(imgWidth / 2);
                          const halfHeight = Math.round(imgHeight / 2);

                          const offscreenCanvas = document.createElement('canvas');
                          const offscreenCtx = offscreenCanvas.getContext('2d');
                          // Use max from width or height to be sure it is a square
                          const maxSize = Math.max(imgWidth, imgHeight) * 1.45; // We need to be sure that when rotating, edges are not cut (45% more space)
                          const marginX = Math.round((maxSize - imgWidth) / 2);
                          const marginY = Math.round((maxSize - imgHeight) / 2);
                          offscreenCanvas.width = maxSize;
                          offscreenCanvas.height = maxSize;

                          const imageCenter = Math.round(maxSize / 2);
                          const angleInRadians = angle * Math.PI / 180;

                          // For debugging:
                          //offscreenCtx.fillStyle = "blue";
                          //offscreenCtx.fillRect(0, 0, maxSize, maxSize);

                          offscreenCtx.translate(imageCenter, imageCenter);
                          offscreenCtx.rotate(angleInRadians);
                          if(flipHoriz) {
                            offscreenCtx.scale(-1, 1);
                          }
                          if(flipVert) {
                            offscreenCtx.scale(1, -1);
                          }
                          offscreenCtx.drawImage(image, - halfWidth, - halfHeight, imgWidth, imgHeight);

                          const targetX = (item.x * scale) - (topLeft ? marginX : imageCenter);
                          const targetY = (item.y * scale) - (topLeft ? marginY : imageCenter);
                          ctx.drawImage(offscreenCanvas, targetX, targetY, maxSize, maxSize);
                        }
                        if(item.a) {
                            rotateImage(img, item.a * 1);
                        } else {
                            ctx.drawImage(img, item.x * 1, item.y * 1, item.w * 1, item.h * 1);
                        }
                        if(queue && _this._renderItems.indexOf(item.f) == -1) {
                            _this._renderItems.push(item);
                        }
                    }
                } else {
                    console.log("Picture object didn't specify source: " + item)
                }
                break
            case "f": // Frame TODO: review
                if(item.f !== undefined) {
                    _this._frames.push(item);
                    // AutoPlay:
                    if (!_this.loaded) {
                        _this.loaded = true;
                        if (_this.autoplay) {
                            _this.play();
                        } else if (_this.showfirst) {
                            _this.step();
                        }
                    }
                } else {
                    console.log("Picture object didn't specify source: " + item)
                }
                break
            case "v": // Video
                if(item.f !== undefined) {
                    const videoEl = document.createElement('video');
                    const videoSource = document.createElement('source');
                    if(item.w !== undefined) {  videoEl.width = item.w * 1;  }
                    if(item.h !== undefined) { videoEl.height = item.h * 1;  }
                    videoEl.muted = true; //TODO? //item.va
                    videoEl.appendChild(videoSource);
                    videoSource.src = item.f;
                    videoEl.addEventListener('play', function() {
                       const vid = this;
                       let millis = 0;
                       const millisPerFrame = 1000 / _this._general.framesPerSec;
                       (function loop() {
                         if (!vid.paused && !vid.ended) {
                            millis += millisPerFrame;
                            const hRatio = canvas.width  / vid.videoWidth    ;
                            const vRatio = canvas.height / vid.videoHeight  ;
                            const ratio  = Math.min ( hRatio, vRatio );
                            const centerShift_x = ( canvas.width - vid.videoWidth*ratio ) / 2;
                            const centerShift_y = ( canvas.height - vid.videoHeight*ratio ) / 2;
                            if(_this._general.keepAspectRatio) {
                                canvas.height = canvas.width * _this._aspectRatio;
                            }
                            ctx.clearRect(0,0,canvas.width, canvas.height);
                            ctx.drawImage(vid, 0,0, vid.videoWidth, vid.videoHeight,
                                   centerShift_x,centerShift_y,vid.videoWidth * ratio, vid.videoHeight * ratio);
                            // Debug time:
                              ctx.font = "15px Arial";
                              ctx.fillStyle = "white";
                              ctx.fillText(Math.round(millis), 50, 50);

                            // TODO: call callback here for render
                            if(_this._renderItems.length) { //FIXME: temporally test
                                _this._renderItems.forEach(itm => {
                                    if(itm.t) {
                                        const startTime = _this._timeToMilliSeconds(itm.t);
                                        const stopTime = itm.tt ? startTime + _this._timeToMilliSeconds(itm.tt) : _this._general.totTime || 9999999999999;
                                        if(millis >= startTime && millis <= stopTime) {
                                            _this.processFrame(itm, false);
                                        }
                                    } else {
                                        _this.processFrame(itm, false);
                                    }
                                });
                            }
                            setTimeout(loop, millisPerFrame); // drawing at 24fps
                         }
                       })();
                    }, 0);
                    videoEl.play();
                    if(_this.loop) {
                        videoEl.onended = () => videoEl.play();
                    }
                } else {
                    console.log("Video object didn't specify source: " + item)
                }
                break
            case "a": // Audio
                break
            case "d": // Custom data
                _this.onRender(item);
                break
        }
        //FIXME?:
        /*
        if(item.fps !== undefined) {
            _this.fps= item.fps;
            _this.timer = new TimerSrc(1000 / _this.fps);
        }*/
        if(!_this.started) {
            _this.onStart(_this);
            _this.started = true;
        }
    }
    /**
     * Render video
     * @param once single step
     */
    _render(once) {
        if (this.timer == null) {
            throw "TimerSrc was not initialized";
        }
        if(this._frames.length === 0) {
            throw "Video is empty or no frames were found";
        }

        if(this.frame >= this._frames.length - 1) {
            this.frame = this.loop ? 0 : this._frames.length - 1;
        }
        if(this.frame < 0) {
            this.frame = this.loop ? this._frames.length - 1: 0;
        }
        this._displayImg(once);
    }

    /**
     * Display next image
     * @param once single step
     */
    _displayImg(once) {
        const _this = this;
        let item = _this._frames[_this.frame];
        if(item) {
            const next = function() {
                _this.onRender(item);
                _this.timer.call(function () {
                    _this._increment();
                    if (!once) {
                        //Do not execute anything until its loaded
                        _this.timer.nocall();
                    }
                    _this._displayImg();
                });
            }
            if(item.f !== undefined) {
                const frame = _this._general.frameBase + item.f;
                _this._image(frame, next);
            } else {
                next();
            }
        }
    }

    /**
     * Increment frame
     */
    _increment() {
        this.frame += (this.multiplier * 1);
        if(this.frame < 0) {
            if(this.loop) {
                this.frame = this._frames.length - 1;
            } else {
                this.frame = 0;
                this.pause();
                this.onFinish(this); //Backwards playing
            }
        }
        if(this.frame > this.totalFrames() - 1) {
            if(this.loop) {
                this.frame = 0;
            } else {
                this.frame = this._frames.length - 1;
                this.pause();
                this.onFinish(this);
            }
        }
    }

    /**
     * Draws an image object
     * @param img
     * @param callback sends "true" on success
     * @return this
     */
    _draw = function(img, callback) {
        const _this = this;
        /// set size proportional to image
        if(img.width === 0 && img.height === 0) {
            img.onerror();
            if(callback !== undefined) {
                callback(false);
            }
        } else {
            _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            _this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, _this.canvas.width, _this.canvas.height);
            if(callback !== undefined) {
                callback(true);
            }
        }
        return this;
    }
    /**
     * Load an image into canvas.
     * @param image path or url of image
     * @param callback returns img object
     * @return this
     */
    _image = function(image, callback) {
        const _this = this;
        const img = new Image();
        img.crossOrigin = '';
        img.onload = function(){
            _this._draw(img,function(drawn){
                if(drawn) {
                    if(callback !== undefined) {
                        callback(img);
                    }
                }
            });
        };
        img.onerror = function() {
            const err = _this.onError();
            if(err) {
                img.src = err;
            }
        };
        img.src = image[0] === "/" || image.match(/^https?:/) || image.match(/^data:image/) ? image : _this.path + image;
        return this;
    }
    /**
     * Converts 00:00:00.000 time to seconds
     * Convert time to milliseconds (handles hours, minutes, seconds, and optional milliseconds)
     */
    _timeToMilliSeconds(time) {
        let millis = 0
        if(time.indexOf(".") !== -1) {
            millis = time.split(".")[1] * 1;
            time = time.split(".")[0];
        }
        return ((time.indexOf(":") !== -1 ? time.split(':').reduce((acc, val, idx) => acc + val * Math.pow(60, 2 - idx), 0) : 0) * 1000) + millis;
    }

    /////////////////////////////////// PUBLIC ///////////////////////////////////////////
    /**
     * Get frame base
     */
    frameBase() {
        return this._general.frameBase;
    }
    /**
     * Get thumb frame base
     */
    thumbBase() {
        return this._general.thumbBase;
    }
    /**
     * Expose information about the current frame
     * @returns {number}
     * @private
     */
    currentFrame() {
        return this.frame;
    }

    /**
     * Return number of frames
     * @returns {number}
     * @private
     */
    totalFrames() {
        return this._numFrames || this._frames.length;
    }

    /**
     * Return total time of video
     * @returns {number}
     * @private
     */
    totalTime() {
        return this._totTime || this.currentFrame() / this.fps;
    }

    /**
     * Return a frame in position
     * @param index : position
     */
    frameAt(index) {
        const _this = this;
        let frame = (index < this.totalFrames()) ? _this._frames[index] : null;
        if(frame) {
            frame.fb = _this._general.frameBase;
        }
        return frame;
    }

    /**
     * Return index number at percentage of video
     * @param percentage
     * @returns {number}
     */
    indexAt(percentage) {
        const _this = this;
        return ~~((percentage * _this.totalFrames()) / 100);
    }

    /**
     * Return player Node
     * @returns DOM node
     * @private
     */
    playerNode() {
        return this.wrapper;
    }

    /**
     * Play video in current direction
     * @param startFrame
     */
    play(startFrame) {
        if (startFrame < 0) {
            startFrame = 0;
        } else if (startFrame > this._frames.length) {
            startFrame = this._frames.length - 1;
        } else if (startFrame !== undefined) {
            this.frame = startFrame * 1;
        }
        this.playing = true;
        this.timer.play();
        this._render(false);
        this.onPlay(this);
    }

    /**
     * Play video in forward direction
     * (used mainly to change direction)
     * @param startFrame
     */
    playForward(startFrame) {
        this.play(startFrame);
    }

    /**
     * Pause the video
     */
    pause() {
        this.playing = false;
        this.timer.pause();
        this.onStop(this);
    }

    /**
     * Stop the video (and go back to the beginning)
     */
    stop() {
        this.playing = false;
        this.frame = 0;
        this.timer.pause();
        this._displayImg(true);
        this.onStop(this);
    }

    /**
     * Move the video one frame in the current direction
     */
    step() {
        this.onPlay(this);
        this.playing = false;
        this.timer.step();
        this._render(true);
        this.onStop(this);
    }

    /**
     * Jump to frame
     */
    jumpTo(startFrame) {
        if (startFrame < 0) {
            startFrame = 0;
        } else if (startFrame > this._frames.length) {
            startFrame = this._frames.length - 1;
        } else if (startFrame !== undefined) {
            this.frame = startFrame * 1;
        }
        this._render(true);
    }

    /**
     * Move one frame forwards (and change direction)
     */
    stepForwards() {
        this.step()
    }

    /**
     * Reset this object
     * @returns {NdJsonPlayer}
     */
    reset() {
        if (this.ctx.reset !== undefined) {
            this.ctx.reset();
            this.ctx.clear();
            this.stop();
            //Reset all: The following line is a "hack" to force it to reset:
            this.canvas.width = this.canvas.width;
        }
        return this;
    }
}

/**
 * This class creates the player UI
 * https://github.com/lepe/ndjson-player
 * @author A.Lepe
 * @since 04/2020
 */
class NDJPlayer {
    player;    //NdJsonPlayer object
    options;   //Options for the UI
    ui;        //The UI

    /**
     * Initialize NDJPlayer
     * @param src : string (URL of NDJSON file or stream) (optional)
     * @param element : DOM selector or HTMLElement where to place NDJPlayer (optional)
     * @param options : Object (optional)
     */
    constructor(src, element, options) {
        const _this = this;
        function isMedia(str) {
            return str.indexOf(".") > 0 || str.indexOf("/") !== -1;
        }
        function isSelector(str) {
            return str[0] === "." || str[0] === "#" || document.querySelector(str) !== null
        }
        switch(arguments.length) {
            case 2:
                if(arguments[1].constructor.name === "Object") {
                    options = arguments[1];
                    if(isMedia(arguments[0])) {
                        element = null;
                    } else if(arguments[0] instanceof HTMLElement || isSelector(arguments[0])) {
                        element = arguments[0];
                        src = null;
                    }
                }
                break
            case 1:
                switch(true) {
                    case arguments[0].constructor.name === "Object":
                        options = arguments[0];
                        src = null;
                        element = null;
                        break
                    case isMedia(arguments[0]):
                        src = arguments[0];
                        element = null;
                        options = {};
                        break
                    case arguments[0] instanceof HTMLElement || isSelector(arguments[0]):
                        element = arguments[0];
                        src = null;
                        options = {};
                        break
                    default:
                        console.log("Unknown parameter was passed to NDJPlayer constructor.")
                        src = null;
                        element = null;
                        options = {};
                        break
                }
                break
            case 0:
                options = {};
                break
            default: // More than 2
                break
        }
        _this.options = Object.assign({
            controls: false,
            /*
            controls : { //Example on how to show/hide elements
                base : "full", //Which one to use as base
                play: true, //show play/pause
                stop: true,
                step: true,
                progress: true,
                thumbs: true,
                fullscreen: true,
                speed: true,
                lapse: true,
                frames: true
            },
            */
            resize: true, //set it to false to disable adjusting the size before starting
            onaction : (action, ndjPlayer, uiPlayer) => {},
            onplay : (ndjPlayer) => {},
            onstop : (ndjPlayer) => {}
        }, options || {});

        // Create UI
        this._create(element);
        // Initialize player
        this.player = new NdJsonPlayer(src, element, _this.options, {
            onstart : function (player) {
                _this._adjustSize()
                if (_this.options.onstart !== undefined) {
                    _this.options.onstart(player);
                }
            },
            onload : function (player) {
                if(_this.options.onload !== undefined) {
                    _this.options.onload(player);
                }
            },
            onrender : function (frame) {
                _this._onUpdate(frame);
                if (_this.options.onrender !== undefined) {
                    _this.options.onrender(frame);
                }
            },
            onplay : function(player) {
                if(_this.ui.panel) {
                    _this.ui.play.show = false;
                    if(! _this.ui.step.css.contains("disabled")) {
                        _this.ui.step.show = false;
                    }
                    _this.ui.pause.show = true;
                }
                _this.options.onplay(player);
            },
            onstop : function(player) {
                if(_this.ui.panel) {
                    _this.ui.play.show = true;
                    if(! _this.ui.step.css.contains("disabled")) {
                        _this.ui.step.show = true;
                    }
                    _this.ui.pause.show = false;
                }
                _this.options.onstop(player);
            },
            onfinish: function (player) {
                //player.stop()
            },
            onerror : function (e) {
                console.log(e);
                //TODO: Display error in player
            }
        });
        // Trigger on window resize:
        window.addEventListener('resize', function(event) {
            _this._adjustSize();
        }, true);
    }

    /**
     * Update the UI
     * @private
     */
    _onUpdate(frame) {
        const _this = this;
        if(_this.ui) {
            if(_this.ui.frames) {
                _this.ui.frames.text = (_this.player.currentFrame() + 1) + "/" + _this.player.totalFrames()
            }
            if(_this.ui.lapse) {
                let text = "";
                const ts = _this.player._startTimeStamp && frame.ts !== undefined;
                const t = frame.t !== undefined;
                const tt = _this.player._totTime > 0;
                if(frame.d) {
                    text = frame.d + " ";
                }
                if(ts) {
                    text += _this._formatMillis(frame.ts - _this.player._startTimeStamp);
                } else if(t) {
                    text += frame.t.indexOf(":") > 0 ? frame.t : _this._fmtTime(frame.t);
                }
                if(tt) {
                    text += "/" + _this.player.totalTime()
                }
                _this.ui.lapse.text = text
            }
            if(_this.ui.progress && _this.player.totalFrames()) {
                _this.ui.progress.value = Math.round(((_this.player.currentFrame() + 1) / (_this.player.totalFrames())) * 100);
            }
        }
    }

    /**
     * It will adjust the video and canvas size
     * @private

     FIXME: attributes in <canva> should match image!

     */
    _adjustSize() {
        if (this.options.resize) {
            let player = this.player.wrapper;
            let parent = player.parent();
            let ratioW = (this.options.height || this.player.canvas.height) / (this.options.width || this.player.canvas.width);
            this.player.canvas.height = parent.clientHeight - (this.options.controls ? player.querySelector(".panel").clientHeight : 0);
            this.player.canvas.width = this.player.canvas.height / ratioW;
        }
    }

    /**
     * Creates the UI
     * @param element Selector
     * @private
     */
    _create(element) {
        const _this = this;
        if(m2d2) {
            const $ = m2d2.load();
            _this.ui = $(element, _this._getUI(element));
            if(_this.ui.panel) {
                ["thumb", "play", "step", "pause", "stop", "lapse", "progress", "frames", "fullscreen"].forEach(it => {
                    _this.ui[it] = _this.ui.panel[it];
                });
            }
        } else {
            console.log("M2D2 was not found. Either use the standard version (which includes M2D2) or add M2D2 in your dependencies.");
        }
    }

    /**
     * Choose the UI to display
     * @param element Selector
     * @returns {string|null}
     * @private
     */
    _getUI(element) {
        const _this = this;
        let ui = { html : (element.innerHTML || "") }; // If no controls are specified

        // noinspection FallThroughInSwitchStatementJS
        if(_this.options.controls) {
            ui = this._getBasicUI();
            // NOTE: visibility is controlled in CSS
            switch(_this.options.controls) {
                case "full":
                    ui.panel.step.css.remove("disabled");
                    break
                case "common":
                    break
                case "live":

                    break
                default:
                    break
            }
        }
        if (typeof this.options.controls === 'object') {
            //TODO: what to show and what not to show
        }
        let root = element instanceof Node ? element : document.querySelector(element);
        if (root) {
            let canvas = root.querySelector("canvas");
            if (!canvas) {
                ui = Object.assign({ canvas : "" }, ui);
            }
        } else {
            console.log("Root element: " + element + " was not found in document");
            ui = Object.assign({ canvas : "" }, ui);
        }
        return ui;
    }

    /**
     * Basic UI
     * @returns {string}
     * @private
     */
    _getBasicUI() {
        const _this = this;
        document.addEventListener('fullscreenchange', (event) => {
            const player = _this.player.wrapper;
            if (document.fullscreenElement) {
                player.classList.add("fullscreen")
            } else {
                player.classList.remove("fullscreen")
            }
        });
        return {
            caption : "",
            css : _this.options.controls,
            panel : {
                tagName: "div",
                className : "panel",
                thumb : { //Create "thumb" inside panel
                    tagName : "figure",
                    className : "thumb",
                    img : {
                        src : ""
                    },
                    caption : {
                        tagName : "figCaption",
                        className: "caption",
                    }
                },
                // Buttons
                rec : {
                    tagName : "a",
                    className : "rec",
                    title: "Live",
                    href: "#"
                },
                play : {
                    tagName : "a",
                    className : "play",
                    title: "Play",
                    href: "#",
                    onclick: function () {
                        _this.ui.onaction("play", _this.player, _this);
                        _this.player.play();
                        return false;
                    }
                },
                pause : {
                    tagName : "a",
                    className : "pause",
                    title: "Pause",
                    href: "#",
                    onclick: function () {
                        _this.ui.onaction("pause", _this.player, _this);
                        _this.player.pause();
                        return false;
                    }
                },
                step : {
                    tagName : "a",
                    css: ["step", "disabled"],
                    title: "Step",
                    href: "#",
                    onclick: function () {
                        _this.ui.onaction("step", _this.player, _this);
                        _this.player.step();
                        return false;
                    }
                },
                stop : {
                    tagName : "a",
                    className : "stop",
                    title: "Stop",
                    href: "#",
                    onclick: function () {
                        _this.ui.onaction("stop", _this.player, _this);
                        _this.player.stop();
                        return false;
                    }
                },
                // Time Lapse
                lapse : {
                    tagName : "label",
                    className : "lapse",
                    title: "Time elapsed / Time Total",
                    text: "0:00",
                },
                live : {
                    tagName : "label",
                    className : "live",
                    text: "Live Feed"
                },
                // Progress bar
                progress : {
                    value: 0,
                    max: 100,
                    onmousemove: function (e) {
                        let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                        let frame = _this.player.frameAt(_this.player.indexAt(position));
                        if (frame) {
                            _this.ui.thumb.show = true;
                            _this.ui.thumb.img.src = (_this.player.thumbBase() || _this.player.frameBase()) + (frame.th || frame.f);
                            _this.ui.thumb.img.onload = function() {
                                const width = _this.ui.thumb.img.naturalWidth || _this.ui.thumb.img.width;
                                _this.ui.thumb.style.width = width + "px";
                            }
                            if (frame.tc !== undefined) {
                                _this.ui.thumb.caption = frame.tc;
                            }
                            _this.ui.thumb.style.left = (this.offsetLeft + e.offsetX - (_this.ui.thumb.clientWidth / 2)) + "px"
                        } else {
                            _this.ui.thumb.show = false;
                        }
                    },
                    onmouseleave: function () {
                        _this.ui.thumb.show = false;
                    },
                    onclick: function (e) {
                        let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                        let index = _this.player.indexAt(position);
                        _this.player.jumpTo(index);
                        _this.ui.onaction("progress", _this.player, _this);
                    }
                },
                // Frame count
                frames : {
                    tagName : "label",
                    className : "frames",
                    title: "Current Frame / Total Frames",
                    text: "0",
                },
                // Fullscreen toggle
                fullscreen : {
                    tagName : "a",
                    className : "fullscreen",
                    title: "Full Screen",
                    href: "#",
                    onclick: function (ev) {
                        const player = _this.player.wrapper;
                        if(player.classList.contains("fullscreen")) {
                            _this.ui.onaction("exit-fullscreen", _this.player, _this);
                            document.exitFullscreen();
                        } else {
                            _this.ui.onaction("fullscreen", _this.player, _this);
                            player.requestFullscreen();
                        }
                        return false;
                    }
                },
                //sizes : ["SD", "HD", "4K"],
            },
            onaction : function(action, ndjPlayer, uiPlayer) {
                _this.options.onaction(action, ndjPlayer, uiPlayer);
            },
            onplay : function(ndjPlayer) {
                _this.options.onplay(ndjPlayer);
            },
            onstop : function(ndjPlayer) {
                _this.options.onstop(ndjPlayer, uiPlayer);
            }
        }
    }

    /**
     * Format a time, for example: 120.34 will be converted into: 02:00.34
     * @param time int
     * @returns {string}
     * @private
     */
    _fmtTime(time) {
        time = time.toFixed(2);
        let decimal = time.split(".")[1] || "00";
        return (~~(time / 60) + "").padStart(2, '0') + ":" + (~~((time / 60) % 1 * 60) + "").padStart(2, '0') + "." + decimal;
    }
    /**
     * Format milliseconds, for example: 90000 will be converted into: 00:01:30.000
     * @private
     */
    _formatMillis(millis) {
        function pad(num, digits) {
            return ("00" + num).slice((digits || 2) * -1);
        }
        const h = Math.floor(millis/1000/60/60);
        const m = Math.floor((millis/1000/60/60 - h)*60);
        const s = Math.floor(((millis/1000/60/60 - h)*60 - m)*60);
        const ms = parseInt((millis % 1000) / 100);
        return pad(h) + ":" + pad(m) + ":" + pad(s) + "." + pad(ms, 3);
    }
}
/**
 * @author: A. Lepe
 * Manage Timers
 * Usage:
 * const t = new TimerSrc(1000);
 * t.call(function() { <do> });
 * or:
 * const t = new TimerSrc(1000,function(){ <do> });
 * t.pause();
 * t.destroy();
 */
function TimerSrc(original_ms, callback) {
	let startTime, timer, obj = {}, action, ms;
	obj.interval = original_ms; //Public. Can be updated
	obj.checker = 50; // adjust this number to affect granularity
	obj.status = "init";
	let nowTime = new Date().getTime();
	startTime = nowTime - original_ms; //start right away
	obj.call = function(func) {
		callback = func;
		return obj;
	};
	obj.nocall = function() {
		callback = null;
		return obj;
	};
	//Execute the callback manually and reset the timer
	obj.exec = function() {
		if(callback) callback();
		startTime = new Date().getTime();
		return obj;
	};
	// Checks the status of the timer
	obj.check = function() {
		if(action) action();
		return obj;
	};
    obj.play = function() {
		action = obj.step;
		obj.status = "running";
		return obj;
    };
    obj.pause = function() {
		action = null;
		obj.status = "paused";
		return obj;
    };
	obj.destroy = function() {
		action = null;
        clearInterval(timer);
		timer = null;
		for(var o in obj) {
			obj[o] = null;
			delete obj[o];
		}
		obj.status = "destroyed";
	};
    obj.step = function() {
		nowTime = new Date().getTime();
        ms = Math.max(0, obj.interval - (nowTime - startTime));
        if(ms === 0) {
			ms = obj.interval;
			startTime = new Date().getTime();
			if(callback) callback();
        }
        return obj;
    };
	obj.slow = function() {
		obj.interval = 1000;
		return obj;
	};
	obj.fast = function() {
		obj.interval = original_ms;
		return obj;
	};
    timer = setInterval(obj.check, obj.checker);
    return obj;
}

/**
 * HTML implementation of ndjson-player
 * https://github.com/lepe/ndjson-player
 * @author A.Lepe
 * @since 04/2020
 *
 * Example specifying multiple sizes:
 * <video-nd src="/video/demo.ndjson" controls loop autoplay>
 *      <source src="/video/demo-QVGA.ndjson" width="320">
 *      <source src="/video/demo-VGA.ndjson" width="640">
 *      <source src="/video/demo-SVGA.ndjson" width="800">
 *      <source src="/video/demo-HD.ndjson" width="1280" height="720">
 *      <source src="/video/demo-FullHD.ndjson" width="1920" height="1080">
 *      <source src="/video/demo-4K.ndjson" width="3840" height="2160">
 * </video-nd>
 *
 * Example specifying tracks:
 *  (trying to be as close to: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track)
 * NOTE: VTT format is not supported as it is based in timed text, while
 * we need to be sure they are sync with images using frames instead of time.
 *
 * <video-nd src="/video/demo.ndjson" controls loop autoplay>
 *    <track src="/info/data.txt" kind="descriptions" label="Data">
 * </video-nd>
 *
 * Track types:
 * captions     : Displayed on the center
 * chapters     : It will be displayed in the top (also useful for navigation)
 * descriptions : Displayed on top left corner
 * metadata     : Displayed on top right corner
 * subtitles    : Displayed on the bottom
 *
 * The format of the TXT file is "frame-or-range# space-or-tab text", for example:
 * 20-30    Objects<br>by color:
 * 35   Blue: 2, Red: 1
 * 36   Blue: 3, Red: 1
 * 37   Blue: 2, Red: 2
 *
 * About chapters:
 * Additionally to being displayed on the top as a title, if used, it will display next and prev buttons.
 * For example:
 * `<track src="/chapters/file.txt" kind="chapters">`
 *
 * file.txt:
 * 0-10 Chapter 1:<br>The beginning
 * 352-360 Chapter 2:<br>The moment
 * 689-710 Last Chapter:<br>The end
 *
 * Whenever you click on 'prev' or 'next' it will use the beginning of each chapter to jump into scenes.
 * The range is used to display it. If you don't set a range (just a frame number), it will be displayed for 3s.
 */
class VideoND extends HTMLElement {
    constructor() {
        super();
        // create shadow dom root
        this._root = this; //this.attachShadow({mode: 'open'});
        //this._root.innerHTML = ``;
        const root = this;

        const defaultOptions = {
            // Attributes similar to <video> tag:
            autoplay : false,
            controls : false,　//true: most basic UI, 'common', 'full', or list, for example: 'play progress lapse frames'
            loop     : false,
            live     : false,
            width    : 'auto',
            height   : 'auto',
            poster   : '',
            preload  : 'auto', //Options are: 'metadata', 'none',
            src      : '',     //URL !important
            // Additional attributes:
            cc          : 'auto', //Enable CC button
            caption     : '', //Set some caption over the video
            fullscreen  : false, //Use 'auto' to only display button. true = start as fullscreen
            fps         : '', //specify video fps (if its not in the metadata)
            speed       : false, //Display speed menu
            autosize    : 'auto', //Automatically choose best size from sizes
            sizes       : {} || [], //Specify available sizes. Example: { HD : 1200 } or [800, 1200, 1800]
            thumbs      : 'auto', //Show thumbnails when placing mouse over progress
        };
        const options = {};
        for(let d in defaultOptions) {
            options[d] = this.getAttribute(d) || this.hasAttribute(d) || defaultOptions[d];
        }
        options.onstart = function (player) {
            if(root.onstart) {
                root.onstart(player);
            }
        }
        options.onload = function (player) {
            if(root.onload) {
                root.onload(player);
            }
        }
        options.onrender = function(frame) {
            if(root.onrender) {
                root.onrender(frame, ndjPlayer.wrapper, ndjPlayer, ndjPlayer.player.canvas, ndjPlayer.player.ctx);
            }
        }

        this.style.display = "block";
        this.className = "ndjp";
        const ndjPlayer = new NDJPlayer(options.src, this, options);
    }

    setCaption(caption) {
        this._root.querySelector("caption").innerText = caption;
    }

    static get observedAttributes() {
        return [ 'width', 'height', 'caption' ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'caption') {
            this.setCaption(newValue);
        }
    }
}
document.addEventListener("DOMContentLoaded", function() {
    window.customElements.define('video-nd', VideoND);
});
