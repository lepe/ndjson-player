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
        const next = function() {
            _this.onRender(item);
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
            _this.onRender(item);
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
