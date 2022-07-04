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
                            _this.ui.thumb.img.src = _this.player.frameBase() + (frame.th || frame.f);
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