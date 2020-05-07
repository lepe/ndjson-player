"use strict";class Utils{static htmlNode(t){const e=Utils.newNode("template");return e.innerHTML=t.trim(),e.content.firstChild}static newNode(t){return document.createElement(t)}static node(t,e){return void 0===e&&(e=document),t instanceof Node?t:e.querySelector(t)}static isNumeric(t){return!isNaN(parseFloat(t))&&isFinite(t)}static isSelectorID(t){return 0===(t+"").trim().indexOf("#")}static isPlainObject(t){return Utils.isObject(t)&&!Utils.isArray(t)}static isObject(t){return"object"==typeof t}static isArray(t){return Array.isArray(t)}static isFunction(t){return"function"==typeof t}static isHtml(t){return-1!==(t+"").trim().indexOf("<")}static isEmpty(t){return void 0===t||Utils.isObject(t)&&0===Object.keys(t).length||""===t}}
"use strict";class M2D2{root;constructor(e){this.root=e.root||"body",this.template=e.template||{},this.data=e.data||[],this._init()}static _ext={};static extend(e){Object.assign(M2D2._ext,e)}update(e,t,i){const o=this;if(o._rendered){const n=function(e){let n;if(void 0!==e._node)if(Utils.isArray(e))if(void 0===i)void 0!==e[t]._node&&e[t]._node.remove();else{let t;const i=[];for(t in e._node.childNodes)n=e._node.childNodes[t],void 0!==n.tagName&&"TEMPLATE"!==n.tagName&&i.push(n);for(t in i)n=i[t],n.remove();o._doRender(e._node,e)}else{const n={};n[t]=i.value,o._doRender(e._node,Object.assign(e,n))}};void 0===t&&Utils.isFunction(o._func)?o._doFunc(o._func,e,(function(e){n(e)})):n(e)}}get(){return this._defineProp(this._data,"m2d2",this),this._setProxy(),this._data}clear(){const e=this;e._rendered&&(e.$root.innerHTML=e._cache)}$root=null;_rendered=!1;_updater=!0;_cache=null;_data=null;_func=null;_htmlGenTags=["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","datalist","dd","del","details","dfn","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","map","mark","menu","meter","nav","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","samp","section","select","small","span","strong","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","tr","tt","ul","var"];_init(){const e=this;if(Utils.isFunction(e._data)){e._func=e._data;let t=e._doFunc(e._func,e.param);t&&(Utils.isArray(t)&&(t={items:t}),e._data=t,e._onReady())}else Utils.isObject(e._data)||(e._data={text:e._data}),e._onReady()}_render(){const e=this;if(void 0===e._data)return console.log("data is missing in m2d2 object with root: "+e.root),!1;e._doRender(e.$root,e._data),e._rendered=!0}_onReady(){const e=this;e.$root=Utils.node(e.root),e.$root?(e._cache=e.$root.innerHTML,e._render()):console.log("Warning: Node was not found: "+e.root)}_doFunc(e,t,i){const o=this;let n=e((function(e,t,n){let s;if(void 0!==n&&Utils.isNumeric(n)?s=n:void 0!==t&&Utils.isNumeric(t)&&(s=t),Utils.isArray(e)){const i={};void 0===t||Utils.isNumeric(t)?void 0!==o.template&&(i.template=o.template):i.template=t,i.items=e,e=i}if(Utils.isPlainObject(e)){o._updater=!1;let t=1;for(let i in e)t++===Object.keys(e).length&&(o._updater=!0),o._data[i]=e[i]}void 0===s&&o.interval>0&&(s=o.interval),s>0&&(o.interval=setInterval((function(){o._func((function(e){o._doRender(o.$root,e)}))}),s)),void 0!==i&&i(e)}),t)||{};return Utils.isArray(n)&&(n={items:n}),Utils.isObject(n)||console.log("Undefined type of 'data'. For automatic detection do not set any 'return' in the data's function. Or explicitly return '[]' for arrays or '{}' for objects."),n}_setProxy(){const e=this;void 0===e._data._proxy&&(Utils.isPlainObject(e._data)||Utils.isArray(e._data))&&(e._data=e._proxy(e._data,(function(t,i,o){"m2d2"!==i&&"_"!==i[0]&&e._updater&&e.update(t,i,o)})))}_doRender(e,t){t&&void 0!==t.oninit&&Utils.isFunction(t.oninit)&&(t.oninit(),delete t.oninit),Utils.isArray(t)&&(t={items:t}),this._setProxy(),this._setValues(e,t),t&&void 0!==t.onrender&&Utils.isFunction(t.onrender)&&(t.onrender(),delete t.onrender)}_doArray(e,t,i){const o=this;o._setNode(e,i);let n=o._getTemplate(e,t);for(let s=0;s<(i.length||Object.keys(i).length);s++){let l=i[s]||Object.values(i)[s];if(void 0!==l._node&&(l._node=void 0),!n)if(Utils.isPlainObject(l)){if(1!==Object.keys(l).length)return console.log("Warning: Multiple keys in data without template is not supported yet. Object:"),void console.log(t);if(Utils.isSelectorID(l)){const e=document.querySelector(l);if(!e)return console.log("Warning: ID selector for template not found: "+l+" . Object:"),void console.log(t);n=e.outerHTML}else n=Utils.newNode(Object.keys(l)[0]).outerHTML}else if("SELECT"===e.tagName||"DATALIST"===e.tagName)n="<option>","string"==typeof l&&(l={text:l,value:l});else if("UL"===e.tagName||"OL"===e.tagName)n="<li>";else{if("NAV"!==e.tagName)return console.log("Warning: No template found for object:"),console.log(e),void console.log(t);n="<a>"}const a=Utils.htmlNode(n);a.setAttribute("data-id",s),e.append(a),o._setValues(a,l)}}_getTemplate(e,t){const i=this;if(void 0!==t._template&&""!==t._template)return t._template;{let o;if(void 0!==t.template?Utils.isPlainObject(t.template)?(o=Utils.newNode("div"),i._setValues(o,t.template)):o=Utils.isSelectorID(t.template)?document.querySelector(t.template):Utils.isHtml(t.template)?Utils.htmlNode("<template>"+t.template+"</template>"):Utils.htmlNode("<template>"+Utils.newNode(t.template).outerHTML+"</template>"):o=Utils.node("template",e),o){const e=o.innerHTML.trim();return i._defineProp(t,"_template",e),e}return e.innerHTML.trim()}}_setValues(e,t){const i=this;if(Utils.isArray(t)&&(t={items:t}),Utils.isPlainObject(t)){i._setNode(e,t),t.hasOwnProperty("html")&&null!==t.html&&i._setValue(e,"html",t.html),t.hasOwnProperty("template")?t.hasOwnProperty("items")||(t.items=[]):t.hasOwnProperty("items")&&console.log("Warning: 'items' specified but no template found.");for(let o in t){const n=t[o];if("html"===o||"template"===o||o.startsWith("_"));else if("items"===o)i._doArray(e,t,n);else if("items"!==o||Utils.isArray(n)||(console.log("Warning: 'items' specified but value is not and array in element: "),console.log(e),console.log("Passed values are: "),console.log(n)),void 0!==M2D2._ext[o]&&Utils.isFunction(M2D2._ext[o])){const t=M2D2._ext[o](n,e);t&&i._setValues(e,t)}else if("#"===o[0])i._doRender(Utils.node(o),n);else if(Utils.isArray(n)&&2===n.length&&void 0!==n[0]._node){let t=n[0]._update||null;void 0===e._orig_update&&(e._orig_update=t,n[0]._update=function(){i._data[o]=n[0][n[1]],null!==e._orig_update&&e._orig_update()}),i._setValue(e,o,n[0][n[1]])}else if("text"===o&&null!==n)i._setValue(e,o,n);else if("dataset"===o&&Utils.isPlainObject(n))for(let t in n)e.setAttribute("data-"+t,n[t]);else if("style"===o)if(Utils.isPlainObject(n))for(const t in n)e.style[t]=n[t];else e.style=n;else if(o.startsWith("on")&&Utils.isFunction(n))e[o]=n;else if(n instanceof Date)i._setValue(e,o,n);else if(!i._hasAttr(e,o)||Utils.isObject(n)||"id"===o&&Utils.isNumeric(n)){let t=Utils.node(o,e);if(!t&&(t=Utils.node("#"+o,e),t||(t=Utils.node("."+o,e)),!t&&-1!==i._htmlGenTags.indexOf(o))){const t=Utils.newNode(o);e.append(t),i._doRender(t,n);continue}t?i._doRender(t,n):console.log("No child or attribute found for: "+o)}else if("boolean"==typeof e[o]?e[o]=n:e.setAttribute(o,n),"value"===o){let t=e.onchange||null;void 0===e._orig_change&&(e._orig_change=t,e.onchange=function(){this.setAttribute(o,this.value),null!==e._orig_change&&e._orig_change()})}}}else i._setValue(e,null,t)}_setValue(e,t,i){const o=this;let n=!1;if(null==t?void 0===i||null==i?(console.log("Value was undefined in element :"),console.log(e)):Utils.isPlainObject(i)&&void 0!==i.text?i=i.text:!Utils.isNumeric(i)&&Utils.isHtml(i)&&(n=!0):"html"===t&&(n=!0),n)e.innerHTML=i;else if("value"===t||null==t&&o._hasAttr(e,"value")&&"LI"!==e.tagName)o._hasAttr(e,"checked")?!0===i||"true"===i||1===i?e.setAttribute("checked",!0):!1===i||"false"===i||0===i?e.setAttribute("checked",!1):e.value=i:i instanceof Date?e.valueAsDate=i:e.value=i;else if(e.childElementCount>0){for(let t in e.childNodes){const o=e.childNodes[t];if(3===o.nodeType)return void o.replaceWith(i)}e.innerHTML=e.innerHTML+i}else e.innerText=i}_hasAttr(e,t){let i=!1;if(e&&!Utils.isNumeric(t))switch(t){case"checked":i=void 0!==e.type&&("radio"===e.type||"checkbox"===e.type);break;default:i=void 0!==e[t]||e.hasAttribute(t)}return i}_defineProp(e,t,i){Utils.isObject(e)&&void 0===e[t]&&(Object.defineProperty(e,t,{enumerable:!1,writable:!0}),e[t]=i)}_setNode(e,t){this._defineProp(t,"_node",e),this._defineProp(e,"_m2d2",t)}_proxy(e,t){this._defineProp(e,"_proxy",!0);const i={get:function(t,o,n){if("m2d2"===o||"_"===o[0])return t[o];{const s=Reflect.get(t,o,n),l=Object.getOwnPropertyDescriptor(t,o);if(l&&!l.writable&&!l.configurable)return s;try{return Utils.isArray(e)&&!Utils.isNumeric(o)?t[o]:new Proxy(t[o],i)}catch(e){return s}}},defineProperty:function(e,i,o){return t(e,i,o),Reflect.defineProperty(e,i,o)},deleteProperty:function(e,i){return t(e,i),Reflect.deleteProperty(e,i)},set:function(e,i,o){return e[i]=o,t(e,i,{value:o}),void 0!==e._update&&e._update(),!0}};return new Proxy(e,i)}set data(e){this._data=e,this.update(this._data)}get data(){return this._data}}const m2d2=function(e,t,i){const o={},n=typeof e;switch(n){case"string":if(void 0===t)return o.data=e,null;o.root=e,Utils.isArray(t)&&(t={items:t}),o.data=t,o.template=i;break;case"object":e instanceof Node&&(o.root=e,e=t);case"function":Utils.isArray(e)&&(t={items:e}),o.data=e,o.template=i;break;default:return console.log("First argument passed to m2d2, with value: ("+e+") is of unknown type: "+n),null}return new M2D2(o).get()};
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

    // Events
    onRender;   // Callback to return metadata when a frame is rendered
    onFinish;   // Callback when video reaches the last frame
    onError;    // Callback when there is an error with the source

    // Private
    _player = null;     // DOM element which contains the <canvas> node
    _canvas = null;     // <canvas> DOM object
    _ctx = null;        // canvas.ctx object
    _timer = null;      // TimerSrc used to manage FPS
    _src = "";          // Video source URI (NDJSON)
    _numFrames = 0;     // Number of total frames (in header)
    _frames = [];       // Video content including metadata (array)
    _frame = 0;         // Current frame being played
    _frameBase = ""     // Base for all frames 'fb'
    _loaded  = false;   // If a frame has been loaded or not
    _playing = false;   // Status
    _backwards = false; // If playing backwards
    _multiplier = 1;    // Multiplier to control speed

    /**
     * Examples:
     * new NdJsonPlayer("/videos/test.ndjson","canvas", { loop: true })
     * new NdJsonPlayer("/videos/test.ndjson", { loop: true })
     * new NdJsonPlayer("/videos/test.ndjson")
     *
     * @param src     .ndjson file (see format)
     * @param element HTML element (must be a canvas). If not set, it will use '<canvas>'
     * @param options Object replacing default values
     * @param onrender Callback when a frame is updated
     * @param onfinish Callback when the video is finished
     * @param onerror Callback when there is an error to raise
     */
    constructor(src, element, options, onrender, onfinish, onerror) {
        const _this = this;
        _this._src = src;
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        }
        // Add events:
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
                _this._canvas = player;
                // create wrapper container
                const wrapper = document.createElement('div');
                player.parentNode.insertBefore(wrapper, player);
                wrapper.prepend(player);
                player = wrapper;
            } else if(player.hasChildNodes()) {
                _this._canvas = player.querySelector("canvas");
                if(!_this._canvas) {
                    throw "No canvas found in element";
                }
            } else {
                _this._canvas = document.createElement("CANVAS");
                player.prepend(_this._canvas);
            }
        } else {
            throw "Canvas element was not found in DOM: " + element;
        }
        _this._player = player;
        _this._canvas.height = _this._canvas.clientHeight;
        _this._canvas.width  = _this._canvas.clientWidth;
        // Set classname for style
        player.classList.add("ndjp");

        // Set context
        _this._ctx = _this._canvas.getContext("2d");

        // Options:
        _this.fps        = options.fps || 24;
        _this.loop       = options.loop || false;
        _this.autoplay   = options.autoplay || false;
        _this.showfirst  = options.showfirst !== false;
        _this.path       = options.path || "";

        // Initialize timer:
        _this._timer = new TimerSrc(1000 / _this.fps);

        // Load video:
        _this.load(function (item) {
            if(item.fb !== undefined) {
                _this._frameBase = item.fb;
            }
            if(item.tf !== undefined) {
                _this._numFrames = item.tf;
            }
            if(item.fps !== undefined) {
                _this.fps= item.fps;
                _this._timer = new TimerSrc(1000 / _this.fps);
            }
            if(item.f !== undefined) {
                _this._frames.push(item);
                // AutoPlay:
                if (!_this._loaded) {
                    _this._loaded = true;
                    if (_this.autoplay) {
                        _this.play();
                    } else if (_this.showfirst) {
                        _this.step();
                    }
                }
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
            this._src = newSrc;
            this._frames = [];
        }
        const decoder = new TextDecoder();
        let buffer = '';
        return fetch(_this._src)
            .then(resp => resp.body.getReader())
            .then(reader => reader.read()
                .then(function process ({ value, done }) {
                    if (done) {
                        callback(JSON.parse(buffer));
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
        if (this._timer == null) {
            throw "TimerSrc was not initialized";
        }
        if(this._frames.length === 0) {
            throw "Video is empty or no frames were found";
        }

        if(this._frame >= this._frames.length) {
            this._frame = this.loop ? 0 : this._frames.length;
        }
        if(this._frame < 0) {
            this._frame = this.loop ? this._frames.length - 1: 0;
        }
        this._displayImg(once);
    }

    /**
     * Display next image
     * @param once single step
     */
    _displayImg(once) {
        const _this = this;
        const item = _this._frames[_this._frame];
        _this.onRender(item);
        const next = function() {
            _this._timer.call(function () {
                if (!once) {
                    _this._increment();
                    //Do not execute anything until its loaded
                    _this._timer.nocall();
                }
                _this._displayImg();
            });
        }
        if(item.f !== undefined) {
            const frame = _this._frameBase + item.f;
            _this._image(frame, next);
        } else {
            next();
        }
    }

    /**
     * Increment frame
     */
    _increment() {
        this._frame += (this._multiplier * (this._backwards ? -1 : 1));
        if(this._frame < 0) {
            if(this.loop) {
                this._frame = this._frames.length - 1;
            } else {
                this._frame = 0;
                this.pause();
            }
        }
        if(this._frame > this._frames.length - 1) {
            if(this.loop) {
                this._frame = 0;
            } else {
                this._frame = this._frames.length - 1;
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
            _this._ctx.save();
            _this._ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, _this._canvas.width, _this._canvas.height);
            _this._ctx.restore();
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
        return this._frame;
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
        return this._player;
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
            this._frame = startFrame * 1;
        }
        this._playing = true;
        this._timer.play();
        this._render(false);
    }

    /**
     * Play video in forward direction
     * (used mainly to change direction)
     * @param startFrame
     */
    playForward(startFrame) {
        this._backwards = false;
        this.play(startFrame);
    }

    /**
     * Play video in backwards direction
     * @param startFrame
     */
    playBackwards(startFrame) {
        this._backwards = true;
        this.play(startFrame);
    }

    /**
     * Pause the video
     */
    pause() {
        this._playing = false;
        this._timer.pause();
    }

    /**
     * Stop the video (and go back to the beginning)
     */
    stop() {
        this._playing = false;
        this._frame = 0;
        this._timer.pause();
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
            this._frame = startFrame * 1;
        }
        this._playing = false;
        this._timer.step();
        this._render(true);
    }

    /**
     * Move one frame forwards (and change direction)
     */
    stepForwards() {
        this._backwards = false;
        this.step()
    }

    /**
     * Move one frame backwards (and change direction)
     */
    stepBackwards() {
        this._backwards = true;
        this.step()
    }

    /**
     * Reset this object
     * @returns {NdJsonPlayer}
     */
    reset() {
        if (this._ctx.reset !== undefined) {
            this._ctx.reset();
            this._ctx.clear();
            this.stop();
            //Reset all: The following line is a "hack" to force it to reset:
            this._canvas.width = this._canvas.width;
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
    _ndjp;      //NdJsonPlayer object
    _options;   //Options for the UI
    _ui;        //The UI

    constructor(src, element, options, onrender) {
        const _this = this;
        this._options = Object.assign({
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
            frames: true
        }, options || {});

        // Create UI
        this._create(element);
        // Initialize player
        this._ndjp = new NdJsonPlayer(src, element, options, function (frame) {
            _this._onUpdate(frame);
            if (onrender !== undefined) {
                onrender(frame);
            }
        }, function () {
            _this.stop()
        }, function (e) {
            //Display error in player
        });
    }

    /**
     * Update the UI
     * @private
     */
    _onUpdate(frame) {
        const _this = this;
        _this._ui.frames.text = _this._ndjp.currentFrame() + "/" + _this._ndjp.totalFrames()
        _this._ui.lapse.text = _this._fmtTime(_this._ndjp.currentFrame() / _this._ndjp.fps);
        _this._ui.progress.value = (_this._ndjp.currentFrame() / (_this._ndjp.totalFrames())) * 100;
    }

    /**
     * Creates the UI
     * @param element Selector
     * @private
     */
    _create(element) {
        const _this = this;
        _this._ui = m2d2(element, {
            html : _this._getUI(element),
            play: {
                show: _this._options.play,
                title: "Play",
                text: "▶️",
                href: "#",
                onclick: function () {
                    _this._ndjp.play();
                    _this._ui.play.show = false;
                    _this._ui.pause.show = true;
                    return false;
                }
            },
            pause: {
                show: _this._options.pause,
                title: "Pause",
                text: "⏸️",
                href: "#",
                onclick: function () {
                    _this._ndjp.pause();
                    _this._ui.play.show = true;
                    _this._ui.pause.show = false;
                    return false;
                }
            },
            stop: {
                show: _this._options.stop,
                title: "Stop",
                text: "⏹️",
                href: "#",
                onclick: function () {
                    _this._ndjp.stop();
                    return false;
                }
            },
            lapse: {
                show: _this._options.lapse,
                title: "Time elapsed / Time Total",
                text: "0:00"
            },
            frames: {
                show: _this._options.frames,
                title: "Current Frame / Total Frames",
                text: "0"
            },
            progress: {
                show: _this._options.progress,
                value: 0,
                max: 100,
                onmousemove: function (e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let frame = _this._ndjp.frameAt(_this._ndjp.indexAt(position));
                    if(frame) {
                        _this._ui.thumb.show = true;
                        _this._ui.thumb.src = _this._ndjp.frameBase() + (frame.th || frame.f);
                        let img = _this._ui.thumb._node;
                        img.style.left = (this.offsetLeft + e.offsetX - (img.width / 2)) + "px"
                    } else {
                        _this._ui.thumb.show = false;
                    }
                },
                onmouseleave: function() {
                    _this._ui.thumb.show = false;
                },
                onclick: function(e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let index = _this._ndjp.indexAt(position);
                    _this._ndjp.step(index);
                }
            },
            //sizes : ["SD", "HD", "4K"],
            thumb : {
                show : false,
                src : ""
            }
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
        switch(this._options.controls) {
            case "":
            case "basic":
            case true:
                html = this._getBasicUI(); break;
            case "common":
                html = this._getCommonUI(); break;
            case "full":
                html = this._getFullUI(); break;
        }
        if(typeof this._options.controls === 'object') {

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
<img class="thumb" />
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
<img class="thumb" />
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
<img class="thumb" />
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
        new NDJPlayer(options.src, this, options);
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
