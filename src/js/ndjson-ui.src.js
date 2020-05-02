/**
 * This class creates the player UI
 * https://github.com/lepe/ndjson-player
 * @author A.Lepe
 * @since 04/2020
 */
class NDJPlayer {
    #ndjp;      //NdJsonPlayer object
    #options;   //Options for the UI
    #ui;        //The UI

    constructor(src, element, options, onrender) {
        const _this = this;
        this.#options = Object.assign({
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
        this.#ndjp = new NdJsonPlayer(src, element, options, function (frame) {
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
        _this.#ui.frames.text = _this.#ndjp.currentFrame() + "/" + _this.#ndjp.totalFrames()
        _this.#ui.lapse.text = _this._fmtTime(_this.#ndjp.currentFrame() / _this.#ndjp.fps);
        _this.#ui.progress.value = (_this.#ndjp.currentFrame() / (_this.#ndjp.totalFrames())) * 100;
    }

    /**
     * Creates the UI
     * @param element Selector
     * @private
     */
    _create(element) {
        const _this = this;
        _this.#ui = m2d2(element, {
            html : _this._getUI(element),
            play: {
                show: _this.#options.play,
                title: "Play",
                text: "▶️",
                href: "#",
                onclick: function () {
                    _this.#ndjp.play();
                    _this.#ui.play.show = false;
                    _this.#ui.pause.show = true;
                    return false;
                }
            },
            pause: {
                show: _this.#options.pause,
                title: "Pause",
                text: "⏸️",
                href: "#",
                onclick: function () {
                    _this.#ndjp.pause();
                    _this.#ui.play.show = true;
                    _this.#ui.pause.show = false;
                    return false;
                }
            },
            stop: {
                show: _this.#options.stop,
                title: "Stop",
                text: "⏹️",
                href: "#",
                onclick: function () {
                    _this.#ndjp.stop();
                    return false;
                }
            },
            lapse: {
                show: _this.#options.lapse,
                title: "Time elapsed / Time Total",
                text: "0:00"
            },
            frames: {
                show: _this.#options.frames,
                title: "Current Frame / Total Frames",
                text: "0"
            },
            progress: {
                show: _this.#options.progress,
                value: 0,
                max: 100,
                onmousemove: function (e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let frame = _this.#ndjp.frameAt(_this.#ndjp.indexAt(position));
                    if(frame) {
                        _this.#ui.thumb.show = true;
                        _this.#ui.thumb.src = _this.#ndjp.frameBase() + (frame.th || frame.f);
                        let img = _this.#ui.thumb._node;
                        img.style.left = (this.offsetLeft + e.offsetX - (img.width / 2)) + "px"
                    } else {
                        _this.#ui.thumb.show = false;
                    }
                },
                onmouseleave: function() {
                    _this.#ui.thumb.show = false;
                },
                onclick: function(e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let index = _this.#ndjp.indexAt(position);
                    _this.#ndjp.step(index);
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
        switch(this.#options.controls) {
            case "":
            case "basic":
            case true:
                html = this._getBasicUI(); break;
            case "common":
                html = this._getCommonUI(); break;
            case "full":
                html = this._getFullUI(); break;
        }
        if(typeof this.#options.controls === 'object') {

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