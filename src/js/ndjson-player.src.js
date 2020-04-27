/*
  This player uses NDJSON files to play in sequence as a video
  Additionally, it may contain information about the frame
  Inspired in https://github.com/lepe/frame-player/ (by Vagner Santana)

  @Since 2020-04-19
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
    #player = null;     // DOM element which contains the <canvas> node
    #canvas = null;     // <canvas> DOM object
    #ctx = null;        // canvas.ctx object
    #timer = null;      // Timer used to manage FPS
    #src = "";          // Video source URI (NDJSON)
    #numFrames = 0;     // Number of total frames (in header)
    #frames = [];       // Video content including metadata (array)
    #frame = 0;         // Current frame being played
    #frameBase = ""     // Base for all frames 'fb'
    #loaded  = false;   // If a frame has been loaded or not
    #playing = false;   // Status
    #backwards = false; // If playing backwards
    #multiplier = 1;    // Multiplier to control speed

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
        _this.#src = src;
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        }
        // Add events:
        _this.onRender   = onrender || function () {}
        _this.onFinish   = onfinish || function () {}
        _this.onError    = onerror  || function (e) { console.log(e); }
        // Fix and check arguments
        if (typeof element == "object") {
            options = element;
            element = "canvas";
        } else if (typeof element != "string") {
            throw "Incorrect parameter passed to constructor of NdJsonPlayer";
        }
        // Look for canvas
        let player = document.querySelector(element || "canvas");
        if (player) {
            if (player.tagName === "CANVAS") {
                _this.#canvas = player;
                // create wrapper container
                const wrapper = document.createElement('div');
                player.parentNode.insertBefore(wrapper, player);
                wrapper.prepend(player);
                player = wrapper;
            } else {
                _this.#canvas = document.createElement("CANVAS");
                player.prepend(_this.#canvas);
            }
        } else {
            throw "Canvas element was not found in DOM: " + element;
        }
        _this.#player = player;
        // Set classname for style
        player.classList.add("ndjp");

        // Set context
        _this.#ctx = _this.#canvas.getContext("2d");

        // Options:
        _this.fps        = options.fps || 24;
        _this.loop       = options.loop || false;
        _this.autoplay   = options.autoplay || false;
        _this.showfirst  = options.showfirst !== false;
        _this.path       = options.path || "";

        // Initialize timer:
        _this.#timer = new Timer(1000 / _this.fps);

        // Load video:
        _this.load(function (item) {
            if(item.fb !== undefined) {
                _this.#frameBase = item.fb;
            }
            if(item.tf !== undefined) {
                _this.#numFrames = item.tf;
            }
            if(item.fps !== undefined) {
                _this.fps= item.fps;
                _this.#timer = new Timer(1000 / _this.fps);
            }
            if(item.f !== undefined) {
                _this.#frames.push(item);
                // AutoPlay:
                if (!_this.#loaded) {
                    _this.#loaded = true;
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
            this.#src = newSrc;
            this.#frames = [];
        }
        const decoder = new TextDecoder();
        let buffer = '';
        return fetch(_this.#src)
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
        if (this.#timer == null) {
            throw "Timer was not initialized";
        }
        if(this.#frames.length === 0) {
            throw "Video is empty or no frames were found";
        }

        if(this.#frame >= this.#frames.length) {
            this.#frame = this.loop ? 0 : this.#frames.length;
        }
        if(this.#frame < 0) {
            this.#frame = this.loop ? this.#frames.length - 1: 0;
        }
        this._displayImg(once);
    }

    /**
     * Display next image
     * @param once single step
     */
    _displayImg(once) {
        const _this = this;
        const item = _this.#frames[_this.#frame];
        _this.onRender(item);
        const next = function() {
            _this.#timer.call(function () {
                if (!once) {
                    _this._increment();
                    //Do not execute anything until its loaded
                    _this.#timer.nocall();
                }
                _this._displayImg();
            });
        }
        if(item.f !== undefined) {
            const frame = _this.#frameBase + item.f;
            _this._image(frame, next);
        } else {
            next();
        }
    }

    /**
     * Increment frame
     */
    _increment() {
        this.#frame += (this.#multiplier * (this.#backwards ? -1 : 1));
        if(this.#frame < 0) {
            if(this.loop) {
                this.#frame = this.#frames.length - 1;
            } else {
                this.#frame = 0;
                this.pause();
            }
        }
        if(this.#frame > this.#frames.length - 1) {
            if(this.loop) {
                this.#frame = 0;
            } else {
                this.#frame = this.#frames.length - 1;
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
            _this.#ctx.save();
            _this.#ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, _this.#canvas.width, _this.#canvas.height);
            _this.#ctx.restore();
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
        return this.#frameBase;
    }
    /**
     * Expose information about the current frame
     * @returns {number}
     * @private
     */
    currentFrame() {
        return this.#frame;
    }

    /**
     * Return number of frames
     * @returns {number}
     * @private
     */
    totalFrames() {
        return this.#numFrames || this.#frames.length;
    }

    /**
     * Return a frame in position
     * @param position
     */
    frameAt(position) {
        const _this = this;
        position =  ~~((position * _this.totalFrames()) / 100);
        let frame = (position < this.totalFrames()) ? _this.#frames[position] : null;
        if(frame) {
            frame.fb = _this.#frameBase;
        }
        return frame;
    }

    /**
     * Return player Node
     * @returns DOM node
     * @private
     */
    playerNode() {
        return this.#player;
    }

    /**
     * Play video in current direction
     * @param startFrame
     */
    play(startFrame) {
        if (startFrame < 0) {
            startFrame = 0;
        } else if (startFrame > this.#frames.length) {
            startFrame = this.#frames.length - 1;
        } else if (startFrame !== undefined) {
            this.#frame = startFrame * 1;
        }
        this.#playing = true;
        this.#timer.play();
        this._render(false);
    }

    /**
     * Play video in forward direction
     * (used mainly to change direction)
     * @param startFrame
     */
    playForward(startFrame) {
        this.#backwards = false;
        this.play(startFrame);
    }

    /**
     * Play video in backwards direction
     * @param startFrame
     */
    playBackwards(startFrame) {
        this.#backwards = true;
        this.play(startFrame);
    }

    /**
     * Pause the video
     */
    pause() {
        this.#playing = false;
        this.#timer.pause();
    }

    /**
     * Stop the video (and go back to the beginning)
     */
    stop() {
        this.#playing = false;
        this.#frame = 0;
        this.#timer.pause();
        this._displayImg(true);
    }

    /**
     * Move the video one frame in the current direction
     */
    step() {
        this._render(true);
    }

    /**
     * Move one frame forwards (and change direction)
     */
    stepForwards() {
        this.#backwards = false;
        this.step()
    }

    /**
     * Move one frame backwards (and change direction)
     */
    stepBackwards() {
        this.#backwards = true;
        this.step()
    }

    /**
     * Reset this object
     * @returns {NdJsonPlayer}
     */
    reset() {
        if (this.#ctx.reset !== undefined) {
            this.#ctx.reset();
            this.#ctx.clear();
            this.stop();
            //Reset all: The following line is a "hack" to force it to reset:
            this.#canvas.width = this.#canvas.width;
        }
        return this;
    }
}
