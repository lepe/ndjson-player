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
    live;       //default: false // Source is a live feed
    path;       //default: "" : Specify common path for images in case URL is used.
                //              For example: path = "http://localhost:8080/images/"
                //              then, use "img12334.jpg" as frame in NDJSON (to reduce size of file)

    // Status
    playing = false;   // Status
    loaded  = false;   // If a frame has been loaded or not
    backwards = false; // If playing backwards
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
    _numFrames = 0;     // Number of total frames (in header)
    _totTime   = 0;     // Number of total time (in header)
    _frames = [];       // Video content including metadata (array)
    _frameBase = ""     // Base for all frames 'fb'
    _thumbBase = ""     // Base for all thumbnails 'thb'
    _startTimeStamp = 0;// Starting time stamp

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
        _this.wrapper = player;
        _this.canvas.width  = _this.wrapper.parent().clientWidth;
        _this.canvas.height = _this.wrapper.parent().clientHeight;
        // Set classname for style
        player.classList.add("ndjp");

        // Set context
        _this.ctx = _this.canvas.getContext("2d");

        // Options:
        _this.fps        = options.fps || 24;
        _this.loop       = options.loop || false;
        _this.live       = options.live || false;
        _this.autoplay   = options.autoplay || _this.live || false;
        _this.showfirst  = options.showfirst !== false;
        _this.path       = options.path || "";
        if(options.width  === "auto") { options.width  = 0; }
        if(options.height === "auto") { options.height = 0; }

        // Initialize timer:
        _this.timer = new TimerSrc(1000 / _this.fps);

        // Load video:
        if(_this.live) {
            new TimerSrc(1000 / _this.fps, () => {
                fetch(_this.src).then(res => res.json()).then(frame => {
                    _this.reload(frame);
                });
            }).play();
        } else if(_this.src) {
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
        this._totTime = 0;        // Number of total time (in header)
        this._numFrames = 0;      // Number of total frames (in header)
        this._startTimeStamp = 0; // Starting time stamp
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
        const decoder = new TextDecoder();
        let buffer = '';
        let count = 0;
        return fetch(_this.src)
            .then(resp => resp.body.getReader())
            .then(reader => reader.read()
                .then(function process ({ value, done }) {
                    if (done) {
                        const last = JSON.parse(buffer);
                        _this.processFrame(last);
                        if(callback) {
                            callback(last);
                        }
                        // We are done loading all frames
                        _this.onLoad(_this);
                        return;
                    }
                    const lines = (
                        buffer + decoder.decode(value, { stream: true })
                    ).split(/[\r\n](?=.)/);
                    buffer = lines.pop(); // Buffer is used to keep the "unfinished" lines together
                    lines.map(JSON.parse).forEach(item => {
                        _this.processFrame(item);
                        if(callback) {
                            callback(item);
                        }
                    });
                return reader.read().then(process);
            })).catch(reason => this.onError(reason));
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
    processFrame(item) {
        const _this = this;
        if(item.w !== undefined) {
            _this.canvas.width  = item.w;
        }
        if(item.h !== undefined) {
            _this.canvas.height = item.h;
        }
        if(item.fb !== undefined) {
            _this._frameBase = item.fb;
        }
        if(item.thb !== undefined) {
            _this._thumbBase = item.thb;
        }
        if(item.tf !== undefined) {
            _this._numFrames = item.tf;
        }
        if(item.tt !== undefined) {
            _this._totTime = item.tt;
        }
        if(item.ts !== undefined) {
            if(!_this._startTimeStamp) {
                _this._startTimeStamp = item.ts;
            }
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
        const item = _this._frames[_this.frame];
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
     * @param index : position
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
