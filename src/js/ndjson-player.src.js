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
    autoplay;   //default: false
    path;       //default: "" : Specify common path for images in case URL is used.
                //              For example: path = "http://localhost:8080/images/"
                //              then, use "img12334.jpg" as frame in NDJSON (to reduce size of file)
    // Events
    onFinish;   // Callback when video reaches the last frame
    onError;    // Callback when there is an error with the source

    // Private
    #canvas = null;     // <canvas> DOM object
    #ctx = null;        // canvas.ctx object
    #timer = null;      // Timer used to manage FPS
    #src = "";          // Video source URI (NDJSON)
    #frames = [];       // Video content (array)
    #frame = 0;         // Current frame being played
    #loaded  = false;   // Loading video status
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
     */
    constructor(src, element, options) {
        const _this = this;
        _this.#src = src;
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        }
        // Fix and check arguments
        if (typeof element == "object") {
            options = element;
            element = "canvas";
        } else if (typeof element != "string") {
            throw "Incorrect parameter passed to constructor of NdJsonPlayer";
        }
        // Look for canvas
        _this.#canvas = document.querySelector(element || "canvas");
        if (_this.#canvas !== undefined) {
            if (_this.#canvas.tagName !== "CANVAS") {
                throw "Canvas element not found: " + element;
            } else {
                _this.#ctx = _this.#canvas.getContext("2d");
            }
        } else {
            throw "Canvas element was not found in DOM: " + element;
        }

        // Options:
        _this.fps        = options.fps || 24;
        _this.loop       = options.loop || false;
        _this.autoplay   = options.autoplay || false;
        _this.path       = options.path || "";
        _this.onFinish   = options.onFinish || function () {}
        _this.onError    = options.onError || function () {}

        // Initialize timer:
        _this.#timer = new Timer(1000 / _this.fps);

        // Load video:
        _this.load(function (obj) {
            _this.#frames.push(obj);
            // AutoPlay:
            if(_this.autoplay) {
                _this.play();
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
            }));
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
        const frame = _this.#frames[_this.#frame].frame;
        //TODO: get metadata and call function
        _this._image(frame, function(img) {
            _this.#timer.call(function() {
                if(!once) {
                    _this._increment();
                    //Do not execute anything until its loaded
                    _this.#timer.nocall();
                }
                _this._displayImg();
            });
        });
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
            const new_width = img.width;
            const new_height = img.height;
            _this.#ctx.save();
//            _this.#ctx.clear();
            _this.#ctx.drawImage(img, _this.#canvas.width/2 - new_width/2, _this.#canvas.height/2 - new_height/2, new_width, new_height);
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
    }

    /**
     * Stop the video (and go back to the beginning)
     */
    stop() {
        this.#playing = false;
        this.#frame = 0;
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
