"use strict";class Utils{static htmlNode(t){const e=Utils.newNode("template");return e.innerHTML=t.trim(),e.content.firstChild}static newNode(t){return document.createElement(t)}static node(t,e){return void 0===e&&(e=document),t instanceof Node?t:e.querySelector(t)}static isNumeric(t){return!isNaN(parseFloat(t))&&isFinite(t)}static isSelectorID(t){return 0===(t+"").trim().indexOf("#")}static isPlainObject(t){return Utils.isObject(t)&&!Utils.isArray(t)}static isObject(t){return"object"==typeof t}static isArray(t){return Array.isArray(t)}static isFunction(t){return"function"==typeof t}static isHtml(t){return-1!==(t+"").trim().indexOf("<")}static isEmpty(t){return void 0===t||Utils.isObject(t)&&0===Object.keys(t).length||""===t}}
"use strict";class M2D2{root;constructor(e){this.root=e.root||"body",this.template=e.template||{},this.data=e.data||[],this._init()}static _ext={};static extend(e){Object.assign(M2D2._ext,e)}update(e,t,i){const o=this;if(o._rendered){const n=function(e){let n;if(void 0!==e._node)if(Utils.isArray(e))if(void 0===i)void 0!==e[t]._node&&e[t]._node.remove();else{let t;const i=[];for(t in e._node.childNodes)n=e._node.childNodes[t],n&&void 0!==n.tagName&&"TEMPLATE"!==n.tagName&&i.push(n);for(t in i)n=i[t],n.remove();o._doRender(e._node,e)}else{const n={};n[t]=i.value,"items"!==t||void 0===e.template||Utils.isEmpty(e.template)||(n.template=e.template),o._doRender(e._node,n)}else o._doRender(o.$root,e)};void 0===t&&Utils.isFunction(o._func)?o._doFunc(o._func,e,(function(e){n(e)})):n(e)}}get(){return this._defineProp(this._data,"m2d2",this),this._setProxy(),this._data}clear(){const e=this;e._rendered&&(e.$root.innerHTML=e._cache)}$root=null;_rendered=!1;_updater=!0;_cache=null;_data=null;_func=null;_htmlGenTags=["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","datalist","dd","del","details","dfn","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","map","mark","menu","meter","nav","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","samp","section","select","small","span","strong","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","tr","tt","ul","var"];_init(){const e=this;if(Utils.isFunction(e._data)){e._func=e._data;let t=e._doFunc(e._func,e.param);t&&(Utils.isArray(t)&&(t={items:t}),e._data=t,e._rendered||e._onReady())}else Utils.isObject(e._data)||(e._data={text:e._data}),e._onReady()}_render(){const e=this;if(void 0===e._data)return console.log("data is missing in m2d2 object with root: "+e.root),!1;e._doRender(e.$root,e._data),e._rendered=!0}_onReady(){const e=this;e.$root=Utils.node(e.root),e.$root?(e._cache=e.$root.innerHTML,e._render()):console.log("Warning: Node was not found: "+e.root)}_doFunc(e,t,i){const o=this;let n=e((function(e,t,n){let s,l=void 0!==o._data._proxy;if(void 0!==n&&Utils.isNumeric(n)?s=n:void 0!==t&&Utils.isNumeric(t)&&(s=t),Utils.isArray(e)){const i={};void 0===t||Utils.isNumeric(t)?void 0!==o.template&&(i.template=o.template):i.template=t,i.items=e,e=i}if(Utils.isPlainObject(e)){o._updater=!1,l||(o._data={});for(let t in e)o._data[t]=e[t];o._updater=!0}if(void 0===s&&o.interval>0&&(s=o.interval),s>0){const e=function(){o._func((function(e){o._doRender(o.$root,e)}))};o.interval=setInterval(e,s)}o._onReady(),void 0!==i&&i(e)}),t)||{};return Utils.isFunction(o._data)||(n=o._data),Utils.isArray(n)&&(n={items:n}),Utils.isObject(n)||console.log("Undefined type of 'data'. For automatic detection do not set any 'return' in the data's function. Or explicitly return '[]' for arrays or '{}' for objects."),n}_setProxy(){const e=this;void 0===e._data._proxy&&(Utils.isPlainObject(e._data)||Utils.isArray(e._data))&&(e._data=e._proxy(e._data,(function(t,i,o){"m2d2"!==i&&"_"!==i[0]&&e._updater&&e.update(t,i,o)})))}_doRender(e,t,i){void 0===i&&(i=!1),t&&void 0!==t.oninit&&Utils.isFunction(t.oninit)&&(t.oninit(),delete t.oninit),Utils.isArray(t)&&(t={items:t}),this._setProxy(),this._setValues(e,t,i),t&&void 0!==t.onrender&&Utils.isFunction(t.onrender)&&(t.onrender(),delete t.onrender)}_doArray(e,t,i,o){const n=this;void 0===o&&(o=!1),n._setNode(e,i);let s=n._getTemplate(e,t);for(let l=0;l<(i.length||Object.keys(i).length);l++){let a=i[l]||Object.values(i)[l];if(void 0!==a._node&&(a._node=void 0),!s)if("SELECT"===e.tagName||"DATALIST"===e.tagName)s="<option>","string"==typeof a&&(a={text:a,value:a});else if("UL"===e.tagName||"OL"===e.tagName)s="<li>";else if("NAV"===e.tagName)s="<a>";else{if(!Utils.isPlainObject(a))return console.log("Warning: No template found for object:"),console.log(e),void console.log(t);if(1!==Object.keys(a).length)return console.log("Warning: Multiple keys in data without template is not supported yet. Object:"),void console.log(t);if(Utils.isSelectorID(a)){const e=document.querySelector(a);if(!e)return console.log("Warning: ID selector for template not found: "+a+" . Object:"),void console.log(t);s=e.outerHTML}else s=Utils.newNode(Object.keys(a)[0]).outerHTML}const r=Utils.htmlNode(s);r.setAttribute("data-id",l),e.append(r),n._setValues(r,a,o)}}_getTemplate(e,t){const i=this;if(void 0!==t._template&&""!==t._template)return t._template;{let o;if(void 0!==t.template?Utils.isPlainObject(t.template)?(o=Utils.newNode("div"),i._setValues(o,t.template,!0)):o=Utils.isSelectorID(t.template)?document.querySelector(t.template):Utils.isHtml(t.template)?Utils.htmlNode("<template>"+t.template+"</template>"):Utils.htmlNode("<template>"+Utils.newNode(t.template).outerHTML+"</template>"):o=Utils.node("template",e),o){const e=o.innerHTML.trim();return i._defineProp(t,"_template",e),e}return e.innerHTML.trim()}}_setValues(e,t,i){const o=this;if(void 0===i&&(i=!1),Utils.isArray(t)&&(t={items:t}),Utils.isPlainObject(t)){o._setNode(e,t),t.hasOwnProperty("html")&&null!==t.html&&o._setValue(e,"html",t.html),t.hasOwnProperty("template")?(e.append(Utils.htmlNode("<template>"+o._getTemplate(e,t)+"</template>")),t.hasOwnProperty("items")||(t.items=[])):t.hasOwnProperty("items")&&console.log("Warning: 'items' specified but no template found.");for(let n in t){const s=t[n];if("html"===n||"template"===n||n.startsWith("_"));else if("items"===n)o._doArray(e,t,s,i);else if("items"!==n||Utils.isArray(s)||(console.log("Warning: 'items' specified but value is not and array in element: "),console.log(e),console.log("Passed values are: "),console.log(s)),void 0!==M2D2._ext[n]&&Utils.isFunction(M2D2._ext[n])){const t=M2D2._ext[n](s,e);t&&o._setValues(e,t,i)}else if("#"===n[0])o._doRender(Utils.node(n),s,i);else if(Utils.isArray(s)&&2===s.length&&void 0!==s[0]._node){let t=s[0]._update||null;void 0===e._orig_update&&(e._orig_update=t,s[0]._update=function(){o._data[n]=s[0][s[1]],null!==e._orig_update&&e._orig_update()}),o._setValue(e,n,s[0][s[1]])}else if("text"===n&&null!==s)o._setValue(e,n,s);else if("dataset"===n&&Utils.isPlainObject(s))for(let t in s)e.setAttribute("data-"+t,s[t]);else if("style"===n)if(Utils.isPlainObject(s))for(const t in s)e.style[t]=s[t];else e.style=s;else if(n.startsWith("on")&&Utils.isFunction(s))i?(void 0===m2d2.f&&(m2d2.f=[]),m2d2.f.push(s),e.setAttribute(n,"m2d2.f["+(m2d2.f.length-1)+"](event)")):e[n]=s;else if(s instanceof Date)o._setValue(e,n,s);else if(!o._hasAttrOrProp(e,n)||Utils.isObject(s)||"id"===n&&Utils.isNumeric(s)){let t=Utils.node(n,e);if(!t&&(t=Utils.node("#"+n,e),t||(t=Utils.node("."+n,e)),!t)){const t=function(t,i,n){const s=Utils.newNode(t);e.append(s),o._doRender(s,i,n)};if(-1!==o._htmlGenTags.indexOf(n)){t(n,s,i);continue}if(s&&Utils.isObject(s)&&void 0!==s.tagName){let e=s.tagName;delete s.tagName,t(e,s,i);continue}}t?o._doRender(t,s,i):console.log("No child or attribute found for: "+n+" in element: "+e.localName)}else{try{e[n]=s}catch(t){console.log("Unable to set property ["+n+"] in element: "+e.localName+". Read-only?")}if("boolean"!=typeof e[n]&&o._hasAttr(e,n)&&e.setAttribute(n,s),"value"===n){let t=e.onchange||null;void 0===e._orig_change&&(e._orig_change=t,e.onchange=function(){this.setAttribute(n,this.value),null!==this._orig_change&&this._orig_change()})}void 0===e._mutable&&(new MutationObserver((function(e){const t=e[0].target;void 0!==t._m2d2?e.forEach((function(e){const n=e.attributeName;let s=t._m2d2[n];const l="boolean"==typeof s?t[n]:t.getAttribute(n);if(void 0!==s&&s!=l){t._m2d2[n]=l;let e={};e[n]=l,o._setValues(t,e,i),void 0!==t._m2d2._update&&t._m2d2._update()}})):console.log("BUG: Unable to find m2d2 reference in node.")})).observe(e,{attributes:!0}),e._mutable=!0)}}}else o._setValue(e,null,t)}_setValue(e,t,i){const o=this;let n=!1;if(null==t?void 0===i||null==i?(console.log("Value was undefined in element :"),console.log(e)):Utils.isPlainObject(i)&&void 0!==i.text?i=i.text:!Utils.isNumeric(i)&&Utils.isHtml(i)&&(n=!0):"html"===t&&(n=!0),n)e.innerHTML=i;else if("value"===t||null==t&&o._hasProp(e,"value")&&"LI"!==e.tagName)o._hasProp(e,"checked")?!0===i||"true"===i||1===i?e.setAttribute("checked",!0):!1===i||"false"===i||0===i?e.setAttribute("checked",!1):e.value=i:i instanceof Date?e.valueAsDate=i:e.value=i;else if(e.childElementCount>0){for(let t in e.childNodes){const o=e.childNodes[t];if(3===o.nodeType)return void o.replaceWith(i)}e.innerHTML=e.innerHTML+i}else e.innerText=i}_hasAttrOrProp(e,t){return this._hasAttr(e,t)||this._hasProp(e,t)}_hasAttr(e,t){let i=!1;if(e&&!Utils.isNumeric(t))switch(t){case"checked":i=void 0!==e.type&&("radio"===e.type||"checkbox"===e.type);break;default:i=e.hasAttribute(t)}return i}_hasProp(e,t){let i=!1;return e&&!Utils.isNumeric(t)&&(i=void 0!==e[t]&&!e.hasAttribute(t)),i}_defineProp(e,t,i){Utils.isObject(e)&&void 0===e[t]&&(Object.defineProperty(e,t,{enumerable:!1,writable:!0}),e[t]=i)}_setNode(e,t){this._defineProp(t,"_node",e),this._defineProp(e,"_m2d2",t)}_proxy(e,t){this._defineProp(e,"_proxy",!0);const i={get:function(t,o,n){if("m2d2"===o||"_"===o[0])return t[o];{const s=Reflect.get(t,o,n),l=Object.getOwnPropertyDescriptor(t,o);if(l&&!l.writable&&!l.configurable)return s;try{return Utils.isArray(e)&&!Utils.isNumeric(o)?t[o]:new Proxy(t[o],i)}catch(e){return s}}},defineProperty:function(e,i,o){return t(e,i,o),Reflect.defineProperty(e,i,o)},deleteProperty:function(e,i){return t(e,i),Reflect.deleteProperty(e,i)},set:function(e,i,o){return e[i]=o,t(e,i,{value:o}),void 0!==e._update&&e._update(),!0}};return new Proxy(e,i)}set data(e){this._data=e,this.update(this._data)}get data(){return this._data}}const m2d2=function(e,t,i){const o={},n=typeof e;switch(n){case"string":if(void 0===t)return o.data=e,null;o.root=e,Utils.isArray(t)&&(t={items:t}),o.data=t,o.template=i;break;case"object":e instanceof Node&&(o.root=e,e=t);case"function":Utils.isArray(e)&&(t={items:e}),o.data=e,o.template=i;break;default:return console.log("First argument passed to m2d2, with value: ("+e+") is of unknown type: "+n),null}return new M2D2(o).get()};
M2D2.extend({show:function(e,t){const n=function(){return getComputedStyle(t,null).display};if(e){if("none"===n())if(t.dataset._m2d2_display)t.style.display=t.dataset._m2d2_display;else if(t.style.removeProperty("display"),"none"===n()){const e=function(){const e=document.getElementsByTagName("body")[0],n=document.createElement("template"),l=document.createElement(t.tagName);n.appendChild(l),e.appendChild(n);const s=getComputedStyle(l,null).display;return n.remove(),s}();t.style.display=t.dataset.display||("none"!==e?e:"block")}}else{const e="none"!==t.style.display?t.style.display:n();"none"!==e&&(t.dataset._m2d2_display=e),t.style.display="none"}}});
M2D2.extend({color:function(s,t){t.style.color=s},bgcolor:function(s,t){t.style.backgroundColor=s},css:function(s,t){t.className=s},"-css":function(s,t){let l=Utils.isArray(s)?s:s.split(" ");for(let s in l)t.classList.remove(l[s])},"+css":function(s,t){let l=Utils.isArray(s)?s:s.split(" ");for(let s in l)t.classList.add(l[s])}});
/**
 * @author: A. Lepe
 * Manage Timers
 * Usage:
 * var t = new TimerSrc(1000);
 * t.call(function() { <do> });
 * or:
 * var t = new TimerSrc(1000,function(){ <do> });
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
  This player uses NDJSON files to play in sequence as a video
  Additionally, it may contain information about the frame
  Inspired in https://github.com/lepe/frame-player/ (by Vagner Santana)

 * https://github.com/lepe/ndjson-player
 * @author A.Lepe
 * @Since 2020-04-19
 */
class NdJsonPlayer {
    // Options
    fps;        //default: 24FPS
    loop;       //default: false
    showfirst;  //default: true : show first image
    autoplay;   //default: false
    path;       //default: "" : Specify common path for images in case URL is used.
                //              For example: path = "http://localhost:8080/images/"
                //              then, use "img12334.jpg" as frame in NDJSON (to reduce size of file)

    // Status
    playing = false;   // Status
    loaded  = false;   // If a frame has been loaded or not
    backwards = false; // If playing backwards

    // Events
    onLoad;     // Callback when data is completed loading
    onRender;   // Callback to return metadata when a frame is rendered
    onFinish;   // Callback when video reaches the last frame
    onError;    // Callback when there is an error with the source

    // Internal use mainly
    player = null;     // DOM element which contains the <canvas> node
    canvas = null;     // <canvas> DOM object
    ctx = null;        // canvas.ctx object
    timer = null;      // TimerSrc used to manage FPS
    src = "";          // Video source URI (NDJSON)
    frame = 0;         // Current frame being played
    multiplier = 1;    // Multiplier to control speed

    // Private
    _numFrames = 0;     // Number of total frames (in header)
    _totTime   = 0;     // Number of total time (in header)
    _frames = [];       // Video content including metadata (array)
    _frameBase = ""     // Base for all frames 'fb'

    /**
     * Examples:
     * new NdJsonPlayer("/videos/test.ndjson","canvas", { loop: true })
     * new NdJsonPlayer("/videos/test.ndjson", { loop: true })
     * new NdJsonPlayer("/videos/test.ndjson")
     *
     * @param src     .ndjson file (see format)
     * @param element HTML element (must be a canvas). If not set, it will use '<canvas>'
     * @param options Object replacing default values
     * @param onload callback when data has been completely loaded
     * @param onrender Callback when a frame is updated
     * @param onfinish Callback when the video is finished
     * @param onerror Callback when there is an error to raise
     */
    constructor(src, element, options, onload, onrender, onfinish, onerror) {
        const _this = this;
        _this.src = src;
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        }
        // Add events:
        _this.onLoad     = onload   || function () {}
        _this.onRender   = onrender || function () {}
        _this.onFinish   = onfinish || function () {}
        _this.onError    = onerror  || function (e) { console.log(e); }
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
            if (player.tagName === "CANVAS") {
                _this.canvas = player;
                // create wrapper container
                const wrapper = document.createElement('div');
                player.parentNode.insertBefore(wrapper, player);
                wrapper.prepend(player);
                player = wrapper;
            } else if(player.hasChildNodes()) {
                _this.canvas = player.querySelector("canvas");
                if(!_this.canvas) {
                    throw "No canvas found in element";
                }
            } else {
                _this.canvas = document.createElement("CANVAS");
                player.prepend(_this.canvas);
            }
        } else {
            throw "Canvas element was not found in DOM: " + element;
        }
        _this.player = player;
        _this.canvas.height = _this.canvas.clientHeight;
        _this.canvas.width  = _this.canvas.clientWidth;
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

        // Initialize timer:
        _this.timer = new TimerSrc(1000 / _this.fps);

        // Load video:
        _this.load(function (item) {
            if(item.w !== undefined) {
                _this.canvas.width  = item.w;
            }
            if(item.h !== undefined) {
                _this.canvas.height = item.h;
            }
            if(item.fb !== undefined) {
                _this._frameBase = item.fb;
            }
            if(item.tf !== undefined) {
                _this._numFrames = item.tf;
            }
            if(item.tt !== undefined) {
                _this._totTime = item.tt;
            }
            if(item.fps !== undefined) {
                _this.fps= item.fps;
                _this.timer = new TimerSrc(1000 / _this.fps);
            }
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
                _this.onRender(item);
            }
        });
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
            this._frames = [];
        }
        const decoder = new TextDecoder();
        let buffer = '';
        return fetch(_this.src)
            .then(resp => resp.body.getReader())
            .then(reader => reader.read()
                .then(function process ({ value, done }) {
                    if (done) {
                        callback(JSON.parse(buffer));
                        _this.onLoad(_this);
                        return;
                    }
                    const lines = (
                        buffer + decoder.decode(value, { stream: true })
                    ).split(/[\r\n](?=.)/);
                    buffer = lines.pop();
                    lines.map(JSON.parse).forEach(callback);
                return reader.read().then(process);
            })).catch(reason => this.onError(reason));
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

        if(this.frame >= this._frames.length) {
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
        const item = _this._frames[_this.frame];
        const next = function() {
            _this.onRender(item);
            _this.timer.call(function () {
                if (!once) {
                    _this._increment();
                    //Do not execute anything until its loaded
                    _this.timer.nocall();
                }
                _this._displayImg();
            });
        }
        if(item.f !== undefined) {
            const frame = _this._frameBase + item.f;
            _this._image(frame, next);
        } else {
            _this.onRender(item);
            next();
        }
    }

    /**
     * Increment frame
     */
    _increment() {
        this.frame += (this.multiplier * (this.backwards ? -1 : 1));
        if(this.frame < 0) {
            if(this.loop) {
                this.frame = this._frames.length - 1;
            } else {
                this.frame = 0;
                this.pause();
            }
        }
        if(this.frame > this._frames.length - 1) {
            if(this.loop) {
                this.frame = 0;
            } else {
                this.frame = this._frames.length - 1;
                this.pause();
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
            _this.ctx.save();
            _this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, _this.canvas.width, _this.canvas.height);
            _this.ctx.restore();
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
     * Get frame base
     */
    frameBase() {
        return this._frameBase;
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
     * @param position
     */
    frameAt(index) {
        const _this = this;
        let frame = (index < this.totalFrames()) ? _this._frames[index] : null;
        if(frame) {
            frame.fb = _this._frameBase;
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
        return this.player;
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
    }

    /**
     * Play video in forward direction
     * (used mainly to change direction)
     * @param startFrame
     */
    playForward(startFrame) {
        this.backwards = false;
        this.play(startFrame);
    }

    /**
     * Play video in backwards direction
     * @param startFrame
     */
    playBackwards(startFrame) {
        this.backwards = true;
        this.play(startFrame);
    }

    /**
     * Pause the video
     */
    pause() {
        this.playing = false;
        this.timer.pause();
    }

    /**
     * Stop the video (and go back to the beginning)
     */
    stop() {
        this.playing = false;
        this.frame = 0;
        this.timer.pause();
        this._displayImg(true);
    }

    /**
     * Move the video one frame in the current direction
     */
    step(startFrame) {
        if (startFrame < 0) {
            startFrame = 0;
        } else if (startFrame > this._frames.length) {
            startFrame = this._frames.length - 1;
        } else if (startFrame !== undefined) {
            this.frame = startFrame * 1;
        }
        this.playing = false;
        this.timer.step();
        this._render(true);
    }

    /**
     * Move one frame forwards (and change direction)
     */
    stepForwards() {
        this.backwards = false;
        this.step()
    }

    /**
     * Move one frame backwards (and change direction)
     */
    stepBackwards() {
        this.backwards = true;
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
    ndjp;      //NdJsonPlayer object
    options;   //Options for the UI
    ui;        //The UI

    // Events
    onAction;   // Callback when user performs an action (eg. play, stop...)

    constructor(src, element, options, onload, onrender, onaction) {
        const _this = this;
        this.options = Object.assign({
            controls : false,
            play: true,
            //pause: true, : pause will be true if play is true
            stop: false,
            step: false,
            progress: true,
            thumbs: true,
            fullscreen: false,
            speed: false,
            lapse: true,
            frames: true,
            resize: true //set it to false to disable autoSize function
        }, options || {});

        this.onAction = onaction || function () {}
        // Create UI
        this._create(element);
        // Initialize player
        this.ndjp = new NdJsonPlayer(src, element, options, onload
         , function (frame) {
            _this._onUpdate(frame);
            if (onrender !== undefined) {
                onrender(frame);
            }
        }, function () {
            _this.stop()
        }, function (e) {
            debugger;
            //Display error in player
        });
    }

    /**
     * Update the UI
     * @private
     */
    _onUpdate(frame) {
        const _this = this;
        _this.ui.frames.text = (_this.ndjp.currentFrame() + 1) + "/" + _this.ndjp.totalFrames()
        _this.ui.lapse.text = frame.t !== undefined ? frame.t + (_this.ndjp._totTime > 0 ? "/" + _this.ndjp.totalTime() : ""): _this._fmtTime(_this.ndjp.totalTime());
        _this.ui.progress.value = ((_this.ndjp.currentFrame() + 1) / (_this.ndjp.totalFrames())) * 100;
        _this._adjustSize();
    }

    /**
     * It will adjust the video and canvas size
     * @private
     */
    _adjustSize() {
        if(this.options.resize) {
            let player = this.ndjp.player
            let parent = this.ndjp.player.parentElement
            if(player.clientHeight > parent.clientHeight) {
                //TODO: sometimes it is not showing correctly
                let ratioW = this.ndjp.canvas.height / this.ndjp.canvas.width;
                let ratioH = this.ndjp.canvas.width / this.ndjp.canvas.height;
                this.ndjp.canvas.height = parent.clientHeight - player.querySelector(".controls").clientHeight;
                this.ndjp.canvas.width  = parent.clientWidth * (ratioW < 1 ? ratioW : ratioH);
            }
        }
    }

    /**
     * Creates the UI
     * @param element Selector
     * @private
     */
    _create(element) {
        const _this = this;
        _this.ui = m2d2(element, {
            html : _this._getUI(element),
            play: {
                show: _this.options.play,
                title: "Play",
                text: "▶️",
                href: "#",
                onclick: function () {
                    _this.onAction("play", _this.ndjp, _this);
                    _this.ndjp.play();
                    _this.ui.play.show = false;
                    _this.ui.pause.show = true;
                    return false;
                }
            },
            pause: {
                show: _this.options.pause,
                title: "Pause",
                text: "⏸️",
                href: "#",
                onclick: function () {
                    _this.onAction("pause", _this.ndjp, _this);
                    _this.ndjp.pause();
                    _this.ui.play.show = true;
                    _this.ui.pause.show = false;
                    return false;
                }
            },
            stop: {
                show: _this.options.stop,
                title: "Stop",
                text: "⏹️",
                href: "#",
                onclick: function () {
                    _this.onAction("stop", _this.ndjp, _this);
                    _this.ndjp.stop();
                    return false;
                }
            },
            lapse: {
                show: _this.options.lapse,
                title: "Time elapsed / Time Total",
                text: "0:00"
            },
            frames: {
                show: _this.options.frames,
                title: "Current Frame / Total Frames",
                text: "0"
            },
            progress: {
                show: _this.options.progress,
                value: 0,
                max: 100,
                onmousemove: function (e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let frame = _this.ndjp.frameAt(_this.ndjp.indexAt(position));
                    if(frame) {
                        _this.ui.thumb.show = true;
                        _this.ui.thumb.img.src = _this.ndjp.frameBase() + (frame.th || frame.f);
                        if(frame.tc !== undefined) {
                            _this.ui.thumb.caption = frame.tc;
                        }
                        let thumb = _this.ui.thumb._node;
                        thumb.style.left = (this.offsetLeft + e.offsetX - (thumb.clientWidth / 2)) + "px"
                    } else {
                        _this.ui.thumb.show = false;
                    }
                },
                onmouseleave: function() {
                    _this.ui.thumb.show = false;
                },
                onclick: function(e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let index = _this.ndjp.indexAt(position);
                    _this.ndjp.step(index);
                    _this.onAction("progress", _this.ndjp, _this);
                }
            },
            //sizes : ["SD", "HD", "4K"],
            thumb : {
                show : false,
                img : {
                    src: ""
                },
                caption : ""
            },
        });
    }

    /**
     * Format a time
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
     * Choose the UI to display
     * @param element Selector
     * @returns {string|null}
     * @private
     */
    _getUI(element) {
        let html = "";
        switch(this.options.controls) {
            case "":
            case "basic":
            case true:
                html = this._getBasicUI(); break;
            case "common":
                html = this._getCommonUI(); break;
            case "full":
                html = this._getFullUI(); break;
        }
        if(typeof this.options.controls === 'object') {

        }
        let root = element instanceof Node ? element : document.querySelector(element);
        if(root) {
            let canvas = root.querySelector("canvas");
            if (!canvas) {
                html = "<canvas></canvas>" + html;
            }
        } else {
            console.log("Root element: " + element + " was not found in document");
            html = "<canvas></canvas>" + html;
        }
        return (element.innerHTML || "") + html;
    }

    /**
     * Basic UI
     * @returns {string}
     * @private
     */
    _getBasicUI() {
        return `<caption></caption>
<div class="controls">
<a class="play"></a>
<a class="pause"></a>
<label class="lapse"></label>
<figure class="thumb"><img /><figcaption class="caption"></figcaption></figure>
<progress></progress>
</div>`;
    }

    /**
     * Common UI
     * @returns {string}
     * @private
     */
    _getCommonUI() {
        return `<caption></caption>
<div class="controls">
<a class="play"></a>
<a class="pause"></a>
<label class="lapse"></label>
<progress></progress>
<label class="frames"></label>
<figure class="thumb"><img /><figcaption class="caption"></figcaption></figure>
</div>`;
    }

    /**
     * Common UI
     * @returns {string}
     * @private
     */
    _getFullUI() {
        return `<caption></caption>
<div class="controls">
<a class="play"></a>
<a class="pause"></a>
<a class="stop"></a>
<label class="lapse"></label>
<progress></progress>
<label class="frames"></label>
<figure class="thumb"><img /><figcaption class="caption"></figcaption></figure>
</div>`;
    }
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

        const defaultOptions = {
            // Attributes similar to <video> tag:
            autoplay : false,
            controls : false,　//true: most basic UI, 'common', 'full', or list, for example: 'play progress lapse frames'
            loop     : false,
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

        this.style.display = "block";
        this.className = "ndjp";
        // create shadow dom root
        this._root = this; //this.attachShadow({mode: 'open'});
        //this._root.innerHTML = ``;
        const root = this;
        const ndjPlayer = new NDJPlayer(options.src, this, options, function (player) {
            if(root.onload !== undefined) {
                root.onload(player);
            }
        },function(frame) {
            if(root.onrender !== undefined) {
                root.onrender(frame, ndjPlayer.ndjp, ndjPlayer, ndjPlayer.ndjp.canvas, ndjPlayer.ndjp.ctx);
            }
        }, function (action, player, ui) {
            if(root.onaction !== undefined) {
                root.onaction(action, player, ui);
            }
        })
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
