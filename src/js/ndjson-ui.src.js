/**
 * This class creates the player UI
 */
class NDJPlayer extends NdJsonPlayer {
    #skin;  //Skin to use
    #ui;  //Options for the UI

    constructor(src, element, options, onrender) {
        super(src, element, options);
        const _this = this;
        this.#skin = options.skin || "default";
        this.#ui   = Object.assign({
            play : ! _this.autoplay,
            stop : true,
            pause : true, //_this.autoplay,
            step : true,
            progress : true,
            thumbs : true,
            fullscreen : false,
            speed : false,
            timer : false,
            onRender : onrender || function () {}
        }, options.ui || {});

        // Create UI
        this._create();
    }

    /**
     * Creates the UI
     * @private
     */
    _create() {
        const _this = this;
        const player = m2d2(_this.player, {
            '+css' : _this.#skin,
            nav : {
                items : [
                    {
                        a : {
                            css : "play fa fa-play",
                            show : _this.#ui.play,
                            title : "Play",
                            text : "▶️",
                            href : "#",
                            onclick : function () {
                                _this.play();
                                return false;
                            }
                        }
                    },
                    {
                        a : {
                            css : "pause fa fa-pause",
                            show : _this.#ui.pause,
                            title : "Pause",
                            text : "⏸️",
                            href : "#",
                            onclick : function () {
                                _this.pause();
                                return false;
                            }
                        }
                    },
                    {
                        a : {
                            css : "stop fa fa-stop",
                            show : _this.#ui.stop,
                            title : "Stop",
                            text : "⏹️",
                            href : "#",
                            onclick : function () {
                                _this.stop();
                                return false;
                            }
                        }
                    }
                ]
            }
        });

    }
}