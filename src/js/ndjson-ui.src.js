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
        if(_this.ui.frames !== undefined) {
            _this.ui.frames.text = (_this.ndjp.currentFrame() + 1) + "/" + _this.ndjp.totalFrames()
        }
        if(_this.ui.lapse !== undefined) {
            _this.ui.lapse.text = frame.t !== undefined ? frame.t + (_this.ndjp._totTime > 0 ? "/" + _this.ndjp.totalTime() : "") : _this._fmtTime(_this.ndjp.totalTime());
        }
        if(_this.ui.progress !== undefined) {
            _this.ui.progress.value = ((_this.ndjp.currentFrame() + 1) / (_this.ndjp.totalFrames())) * 100;
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
        _this.ui = m2d2(element, Object.assign(_this._getUI(element), {
            thumb: {
                show: false,
                img: {
                    src: ""
                },
                caption: ""
            }
        }));
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
        const _this = this;
        let ui = { html : (element.innerHTML || "") };
        const play = {
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
            }
        }
        const pause = {
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
            }
        }
        const stop = {
            stop: {
                title: "Stop",
                text: "⏹️",
                href: "#",
                onclick: function () {
                    _this.onAction("stop", _this.ndjp, _this);
                    _this.ndjp.stop();
                    return false;
                }
            }
        }
        const lapse = {
            lapse: {
                show: _this.options.lapse,
                title: "Time elapsed / Time Total",
                text: "0:00"
            }
        }
        const frames = {
            frames: {
                show: _this.options.frames,
                title: "Current Frame / Total Frames",
                text: "0"
            }
        }
        const progress = {
            progress: {
                show: _this.options.progress,
                value: 0,
                max: 100,
                onmousemove: function (e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let frame = _this.ndjp.frameAt(_this.ndjp.indexAt(position));
                    if (frame) {
                        _this.ui.thumb.show = true;
                        _this.ui.thumb.img.src = _this.ndjp.frameBase() + (frame.th || frame.f);
                        if (frame.tc !== undefined) {
                            _this.ui.thumb.caption = frame.tc;
                        }
                        let thumb = _this.ui.thumb._node;
                        thumb.style.left = (this.offsetLeft + e.offsetX - (thumb.clientWidth / 2)) + "px"
                    } else {
                        _this.ui.thumb.show = false;
                    }
                },
                onmouseleave: function () {
                    _this.ui.thumb.show = false;
                },
                onclick: function (e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let index = _this.ndjp.indexAt(position);
                    _this.ndjp.step(index);
                    _this.onAction("progress", _this.ndjp, _this);
                }
            }
        }
        //sizes : ["SD", "HD", "4K"],

        switch (this.options.controls) {
            case "basic":
            case true:
                ui.html = this._getBasicUI();
                ui = Object.assign(ui, play, pause, lapse, progress);
                break;
            case "common":
                ui.html = this._getCommonUI();
                ui = Object.assign(ui, play, pause, lapse, progress, frames);
                break;
            case "full":
                ui.html = this._getFullUI();
                ui = Object.assign(ui, play, pause, lapse, progress, frames, stop);
                break;
        }
        if (typeof this.options.controls === 'object') {
            //TODO: what to show and what not to show
        }
        let root = element instanceof Node ? element : document.querySelector(element);
        if (root) {
            let canvas = root.querySelector("canvas");
            if (!canvas) {
                ui.html = "<canvas></canvas>" + ui.html;
            }
        } else {
            console.log("Root element: " + element + " was not found in document");
            ui.html = "<canvas></canvas>" + ui.html;
        }
        return ui;
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