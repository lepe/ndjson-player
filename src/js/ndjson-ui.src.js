/**
 * This class creates the player UI
 */
class NDJPlayer extends NdJsonPlayer {
    #skin;      //Skin to use
    #options;   //Options for the UI
    #ui;        //The UI

    constructor(src, element, options, onrender) {
        super(src, element, options, function (frame) {
            _this._onUpdate(frame);
            if (onrender !== undefined) {
                onrender(frame);
            }
        }, function () {
            _this.stop()
        }, function (e) {
            //Display error in player
        });
        const _this = this;
        this.#skin = options.skin || "default";
        this.#options = Object.assign({
            play: !_this.autoplay,
            stop: true,
            pause: _this.autoplay,
            step: true,
            progress: true,
            thumbs: true,
            fullscreen: false,
            speed: false,
            lapse: true,
            frames: true
        }, options.ui || {});

        // Create UI
        this._create();
    }

    /**
     * Update the UI
     * @private
     */
    _onUpdate(frame) {
        const _this = this;
        _this.#ui.frames.text = _this.currentFrame() + "/" + _this.totalFrames()
        _this.#ui.lapse.text = Utils.fmtTime(this.currentFrame() / _this.fps);
        _this.#ui.progress.value = (_this.currentFrame() / (_this.totalFrames())) * 100;
    }

    /**
     * Creates the UI
     * @private
     */
    _create() {
        const _this = this;
        _this.#ui = m2d2(_this.playerNode(), {
            '+css': _this.#skin,
            /*template : '<a class="play"></a>\n' +
                '<a class="pause"></a>\n' +
                '<a class="stop"></a>\n' +
                '<label class="lapse"></label>\n' +
                '<label class="frames"></label>\n' +
                '<progress></progress>',*/
            play: {
                '+css': ["fa", "fa-play"],
                show: _this.#options.play,
                title: "Play",
                text: "▶️",
                href: "#",
                onclick: function () {
                    _this.play();
                    _this.#ui.play.show = false;
                    _this.#ui.pause.show = true;
                    return false;
                }
            },
            pause: {
                '+css': ["fa", "fa-pause"],
                show: _this.#options.pause,
                title: "Pause",
                text: "⏸️",
                href: "#",
                onclick: function () {
                    _this.pause();
                    _this.#ui.play.show = true;
                    _this.#ui.pause.show = false;
                    return false;
                }
            },
            stop: {
                '+css': ["fa", "fa-stop"],
                show: _this.#options.stop,
                title: "Stop",
                text: "⏹️",
                href: "#",
                onclick: function () {
                    _this.stop();
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
                    let frame = _this.frameAt(_this.indexAt(position));
                    if(frame) {
                        _this.#ui.img.show = true;
                        _this.#ui.img.src = _this.frameBase() + frame.th;
                        let img = _this.#ui.img._node;
                        img.style.left = (this.offsetLeft + e.offsetX - (img.width / 2)) + "px"
                    } else {
                        _this.#ui.img.show = false;
                    }
                },
                onmouseleave: function() {
                    _this.#ui.img.show = false;
                },
                onclick: function(e) {
                    let position = ~~(((e.offsetX) / this.offsetWidth) * 100);
                    let index = _this.indexAt(position);
                    _this.step(index);
                }
            },
            img : {
                show : false,
                src : ""
            }
        });
    }
}