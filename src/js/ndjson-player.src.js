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
