// ------- Functions -------
"use strict";
/**
 * Some utils to work with DOM
 * @Author: A.Lepe <dev@alepe.com>
 */
class Utils {
    static htmlNode(html) {
        const template = Utils.newNode("template");
        template.innerHTML = html.trim();
        return template.content.firstChild;
    };
    static newNode(tagName) {
        return document.createElement(tagName);
    };
    static node(selector, root) {
        if (root === undefined) {
            root = document;
        }
        return selector instanceof Node ? selector : root.querySelector(selector);
    };
    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    static isSelectorID(s) {
        return (s + "").trim().indexOf("#") === 0;
    };
    static isPlainObject(o) {
        return Utils.isObject(o) && !Utils.isArray(o);
    };
    static isObject(oa) {
        return typeof oa === 'object';
    };
    static isArray(a) {
        return Array.isArray(a);
    };
    static isFunction(f) {
        return typeof f === 'function';
    };
    static isHtml(s) {
        return (s + "").trim().indexOf("<") !== -1;
    };
    static isEmpty(obj) {
        return obj === undefined || (Utils.isObject(obj) && Object.keys(obj).length === 0) || obj === "";
    };
}
