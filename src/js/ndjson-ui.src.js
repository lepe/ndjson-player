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

    constructor(src, element, options, onaction) {
        const _this = this;
        this.options = Object.assign({
            controls: false,
            /*
            controls : { //Example on how to show/hide elements TODO
                base : "full", //Which one to use as base
                play: true, //show play/pause
                stop: false,
                step: false,
                progress: true,
                thumbs: true,
                fullscreen: false,
                speed: false,
                lapse: true,
                frames: true
            },*/
            resize: true //set it to false to disable adjusting the size before starting
        }, options || {});

        this.onAction = onaction || function () {
        }
        // Create UI
        this._create(element);
        // Initialize player
        this.ndjp = new NdJsonPlayer(src, element, options
            , function (player) {
                _this._adjustSize()
                if (_this.options.onstart !== undefined) {
                    _this.options.onstart(player);
                }
            },
            function (player) {
                if(_this.options.onload !== undefined) {
                    _this.options.onload(player);
                }
            }, function (frame) {
                _this._onUpdate(frame);
                if (_this.options.onrender !== undefined) {
                    _this.options.onrender(frame);
                }
            }, function (player) {
                //player.stop()
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
        if(_this.ui !== undefined) {
            if(_this.ui.controls !== undefined) {
                if(_this.ui.controls.frames !== undefined) {
                    _this.ui.controls.frames.text = (_this.ndjp.currentFrame() + 1) + "/" + _this.ndjp.totalFrames()
                }
                if(_this.ui.controls.lapse !== undefined) {
                    let text = "";
                    const ts = _this.ndjp._startTimeStamp && frame.ts !== undefined;
                    const t = frame.t !== undefined;
                    const tt = _this.ndjp._totTime > 0;
                    if(frame.d) {
                        text = frame.d + " ";
                    }
                    if(ts) {
                        text += _this._formatMillis(frame.ts - _this.ndjp._startTimeStamp);
                    } else if(t) {
                        text += frame.t.indexOf(":") > 0 ? frame.t : _this._fmtTime(frame.t);
                    }
                    if(tt) {
                        text += "/" + _this.ndjp.totalTime()
                    }
                    _this.ui.controls.lapse.text = text
                }
                if(_this.ui.controls.progress !== undefined) {
                    _this.ui.controls.progress.value = ((_this.ndjp.currentFrame() + 1) / (_this.ndjp.totalFrames())) * 100;
                }
            }
        }
    }

    /**
     * It will adjust the video and canvas size
     * @private
     */
    _adjustSize() {
        if (this.options.resize) {
            let player = this.ndjp.player
            let parent = this.ndjp.player.parentElement
            if (player.clientHeight > parent.clientHeight) {
                let ratioW = this.ndjp.canvas.height / this.ndjp.canvas.width;
                let ratioH = 1 / ratioW;
                this.ndjp.canvas.height = parent.clientHeight - (this.options.controls ? player.querySelector(".controls").clientHeight : 0);
                this.ndjp.canvas.width = parent.clientWidth * (ratioW < 1 ? ratioW : ratioH);
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
        _this.ui = m2d2(element, _this._getUI(element));
    }

    /**
     * Choose the UI to display
     * @param element Selector
     * @returns {string|null}
     * @private
     */
    _getUI(element) {
        const _this = this;
        let ui = { html : (element.innerHTML || "") };
        const play = {
            tagName : "a",
            className : "play",
            show: true,
            title: "Play",
            text: "▶️",
            href: "#",
            onclick: function () {
                _this.onAction("play", _this.ndjp, _this);
                _this.ndjp.play();
                _this.ui.controls.play.show = false;
                _this.ui.controls.pause.show = true;
                return false;
            }
        }
        const pause = {
            tagName : "a",
            className : "pause",
            show: false,
            title: "Pause",
            text: "⏸️",
            href: "#",
            onclick: function () {
                _this.onAction("pause", _this.ndjp, _this);
                _this.ndjp.pause();
                _this.ui.controls.play.show = true;
                _this.ui.controls.pause.show = false;
                return false;
            }
        }
        const stop = {
            tagName : "a",
            className : "stop",
            title: "Stop",
            text: "⏹️",
            href: "#",
            onclick: function () {
                _this.onAction("stop", _this.ndjp, _this);
                _this.ndjp.stop();
                return false;
            }
        }
        const lapse = {
            tagName : "label",
            className : "lapse",
            show: true,
            title: "Time elapsed / Time Total",
            text: "0:00"
        }
        const frames = {
            tagName : "label",
            className : "frames",
            show: true,
            title: "Current Frame / Total Frames",
            text: "0"
        }
        const progress = {
            show: true,
            value: 0,
            max: 100,
            onmousemove: function (e) {
                let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                let frame = _this.ndjp.frameAt(_this.ndjp.indexAt(position));
                if (frame) {
                    _this.ui.controls.thumb.show = true;
                    _this.ui.controls.thumb.img.src = _this.ndjp.frameBase() + (frame.th || frame.f);
                    if (frame.tc !== undefined) {
                        _this.ui.controls.thumb.caption = frame.tc;
                    }
                    let thumb = _this.ui.controls.thumb._node;
                    thumb.style.left = (this.offsetLeft + e.offsetX - (thumb.clientWidth / 2)) + "px"
                } else {
                    _this.ui.controls.thumb.show = false;
                }
            },
            onmouseleave: function () {
                _this.ui.controls.thumb.show = false;
            },
            onclick: function (e) {
                let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                let index = _this.ndjp.indexAt(position);
                _this.ndjp.step(index);
                _this.onAction("progress", _this.ndjp, _this);
            }
        }
        //sizes : ["SD", "HD", "4K"],

        // noinspection FallThroughInSwitchStatementJS
        if(this.options.controls) {
            const full = this.options.controls === "full";
            const common = this.options.controls === "common";
            ui = this._getBasicUI();
            ui.controls.play = play;
            ui.controls.pause = pause;
            if(full) {
                ui.controls.stop = stop;
            }
            ui.controls.lapse = lapse;
            ui.controls.progress = progress;
            if(common || full) {
                ui.controls.frames = frames;
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
        return {
            caption : "",
            controls : {
                tagName: "div",
                className : "controls",
                thumb : {
                    tagName : "figure",
                    className : "thumb",
                    show : false,
                    img : {
                        src : ""
                    },
                    caption : {
                        tagName : "figCaption",
                        className: "caption",
                        show : false
                    }
                }
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