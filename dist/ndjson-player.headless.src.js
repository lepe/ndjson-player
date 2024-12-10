/**
 * Author : A.Lepe (dev@alepe.com)
 * License: MIT
 * Version: 0.1.8
 * Updated: 2024-12-10
 * Content: ndjson-player.headless.src.js (Bundle 'No M2D2 included' Source)
 */

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
