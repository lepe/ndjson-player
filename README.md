### Warning
```diff
- Current player is BETA version, which means not all features have been implemented.
- Because it uses Javascript ES6+ it will only work with modern browsers.
 ```

# ndjson-player

NDJsonPlayer (or video-nd) uses [NDJSON](http://ndjson.org/) as source and metadata.
It can play a sequence of images as a video and keep metadata synchronized at frame level.

## Why?

When working with a sequence of images and metadata (information related to each frame),
it was hard to get both perfectly synchronized as encoding the images into a video 
produces unknown number of frames. 

The closest solution I was able to found was: [FramePlayer](https://github.com/lepe/frame-player/). 
However, it uses JSON files which need to be fully downloaded and parsed before starting
playing, which is very slow (you can see it by yourself).

For this reason, NDJSON data is more suitable to use a video container than JSON.

## Features:

* Small size : Its only 20Kb (including css).
* Fast loading : It can start playing as frames are downloaded (It doesn't need to download the whole file). 
* Fast rendering : Each JSON frame is rendered as it is being parsed. 
* Simplicity : Its simple as any HTML tag.
* Familiarity : It is very similar to the `<video>` element, so it is easy to understand.
* Flexibility : It can be easily extended and improved.
* Stylable : It is easy to create new styles and adapt it to your needs.
* Thumbnails : Display thumbnails on progress mouseover
* Adaptability: It displays well on mobile devices or any size as it adapts to the container size (try it!)
* Full-power : It has many options, so you don't need to modify it to use it as you want.

## Demo:

* [Live example 1 : 640px](https://lepe.github.io/ndjson-player/examples/index.html)
* [Live example 2 : 240px](https://lepe.github.io/ndjson-player/examples/index-240.html)
* [Live example 3 : 1024px](https://lepe.github.io/ndjson-player/examples/index-1024.html)
* [Live example 4 : Live](https://lepe.github.io/ndjson-player/examples/index-live.html)
* [Live example 5 : XHR](https://lepe.github.io/ndjson-player/examples/index-xhr.html)
* [Live example 6 : XHR Live](https://lepe.github.io/ndjson-player/examples/index-xhr-live.html)
* [Live example 7 : WebSocket Live](https://lepe.github.io/ndjson-player/examples/index-ws.html)

## Usage

Files are located inside the [dist directory](https://github.com/lepe/ndjson-player/tree/master/dist).

or you can install with: `npm i ndjson-player` or `yarn add ndjson-player`

### Required CSS and JS
```html
<link rel="stylesheet" href="ndjson-player-default-skin.min.css" type="text/css">
<script src="ndjson-player.min.js" type="text/javascript"></script>
```

#### Skins
Currently, there are 3 different skins: 

* default : It uses simple UTF-8 characters for UI buttons
* emoji : It uses UTF-8 characters which are rendered as "Emoji" icons
* material : It uses `Google Icons` (material design) font to render icons (best look)

You can find these `css` files under: `dist/css/` directory or in [github](https://github.com/lepe/ndjson-player/tree/master/dist/css)

# Using NDJSON-Player according to your needs

There are mainly 3 ways to use this library:

1. [The Easiest way](#the-easiest-way-html-using-video-nd-tag)
2. [Simple way](#simple-way-javascript-using-ndjplayer-class)
3. [Advanced way](#advanced-way-javascript-using-ndjsonplayer)

## The Easiest way (HTML: Using video-nd tag)
```html
<!-- Creates a player without controls which starts automatically and stops at the end -->
<video-nd src="/video/demo.ndjson" autoplay></video-nd>

<!-- Creates a player with the basic controls which starts automatically and restarts when finish -->
<video-nd src="/video/demo.ndjson" controls loop autoplay></video-nd>

<!-- Creates a player with the most common UI: basic + [thumbs, full-screen, sizes, lapse] -->
<video-nd src="/video/demo.ndjson" controls="common"></video-nd>

<!-- Creates a player with all UI options -->
<video-nd src="/video/demo.ndjson" controls="full"></video-nd>

<!-- Creates a player to display live feeds: -->
<video-nd src="https://example.com/live/feed.ndjson" live controls="live"></video-nd>
```

[see 'The Easiest Way' example](https://lepe.github.io/ndjson-player/examples/index.html)

### Events
You can add the events to your `<video-nd>` element to process frames:

#### onRender event

```js
elem.onrender = function(frame, player, ui, canvas, ctx) { ... }
```

In which:
* frame  : is the JSON object containing the metadata and the image information
* player : NdJsonPlayer instance. You can perform actions in it (see below).
* ui     : UI class which wraps the canvas
* canvas : `<canvas>` element
* ctx    : canvas 2D context

Example applications:

- Add captions into the canvas  (see Example)
- Add animations or shapes intro the video  in relation to the frames.
- Add conditions to stop, pause or change the video speed.
- Change other elements in the page to synchronize them with the video.

> NOTE: You can apply some actions to the `player`, more on that in: [advanced way](#advanced-way-javascript-using-ndjsonplayer)

Example:
```js
document.querySelector("video-nd").onrender = function(frame, player, canvas, ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "yellow";
    ctx.fontWeight = "bold";
    ctx.fillText(new Date(Date.now()).toLocaleTimeString(), 10, 30);
}
```

#### onAction event

```js
elem.onaction = function(action, player, ui) { ... }
```

In which:
* action : is a string describing it, like: "play", "pause", "stop", "progress"
* player : NdJsonPlayer instance. You can perform actions in it (see below).
* ui     : UI class which wraps the canvas

Useful to execute code on some user action.

#### onLoad event

```js
elem.onload = function(player) { ... }
```

Executed when the player is done downloading the source video.

In which:
* player : NdJsonPlayer instance. You can perform actions in it (see below).

#### onStart event

```js
elem.onstart = function(player) { ... }
```

Executed when the first image is displayed. Useful to adjust the size of the video.

In which:
* player : NdJsonPlayer instance. You can perform actions in it (see below).

#### onPlay / onStop events

```js
elem.onplay = function(player) { ... }
elem.onstop = function(player) { ... }
```

Executed when a video is played or stopped

In which:
* player : NdJsonPlayer instance. You can perform actions in it (see below).

#### onFinish event

```js
elem.onfinish = function(player) { ... }
```

Executed when we reach the end of the video (if playing backwards, it will be triggered on the beginning of the video).

In which:
* player : NdJsonPlayer instance. You can perform actions in it (see below).

### Advanced HTML example:

```html
<video-nd class="youtube" src="/video/demo-HD.ndjson" controls loop autoplay fps="30" autosize>
       <source src="/video/demo-QVGA.ndjson" width="320">
       <source src="/video/demo-4K.ndjson" width="3840" height="2160">
       <track src="/subtitles/en.txt" kind="subtitles" srclang="en" label="English">
       <track src="/info/data.txt" kind="descriptions" label="Data">
</video-nd>
```

> NOTE: `<video-nd>` tag rendering may not work with few browsers, in that case, use the following:

## Simple way (javascript: using NDJPlayer class)

We include the class `NDJPlayer` which extends `NdJsonPlayer` to make it
simple to use and to control the UI (`NdJsonPlayer` has no UI).

[see 'Simple Way' example](https://lepe.github.io/ndjson-player/examples/index-js.html)

```js
/*
 * @param URL : Source of video.
 * @param Node : Node to use to create the player
 */
const video = new NDJPlayer("/video/demo-640.ndjson", "#video");
```
```html
<div id="video"></div>
```

The `NDJPlayer` provides these properties:

```js
const video = new NDJPlayer(.....);

video.player   // This is the NdJsonPlayer object
video.ui       // This is the UI class which wraps the canvas 
video.options  // Access to NDJPlayer options
```

Specifying options:

```js
const video = new NDJPlayer("/video/demo-640.ndjson", "#video", { 
    fps : 5,
    loop: true,
    autoplay: true,
    resize : true,  // Automatically resize video
    controls : { // Decide which buttons to show or hide:
         base : "full", //Which one to use as base
         play: true, //show play/pause
         stop: true,
         step: false,
         progress: true,
         thumbs: true,
         fullscreen: false,
         speed: false,
         lapse: true,
         frames: true
    }
});
```

#### The UI class
If you need to access the HTML elements inside the player (controls, etc), you will need
to use the `UI class`. It is a [M2D2 object](https://gitlab.com/intellisrc/m2d2) which in
essence is a DOM object. You don't need to know how to use `M2D2` to use it, you can use
vanilla Javascript if you want, but it is much more simple if you use `M2D2`. For example,
if you want to hide the `stop` button when you press `play`:

```js
const video = new NDJPlayer(.....);

video.onAction((action, player, ui) => { 
    if(action == "play") {
       ui.stop.show = false;
       ui.play.title = "Playing...";
       ui.play.css.toggle("active"); // Toggle class name "active"
    }
});
```

You can also set other event callbacks like (see [events](#events)):
```js
video.onRender((frame, player, ui, canvas, ctx) => { ... })
video.onLoad(player => { ... })
video.onStart(player => { ... })
video.onPlay(player => { ... })
video.onStop(player => { ... })
video.onFinish(player => { ... })
```

### Advanced way (javascript: using NdJsonPlayer)

Minimal way to start it if <canvas> exists:
```js
const player = new NdJsonPlayer("video/video01.ndjson");
```

Specifying container:
```js
const player = new NdJsonPlayer("video/video01.ndjson", "#video");
```

With options:
```js
const player = new NdJsonPlayer("video/video01.ndjson", "#video", {
    fps: 30,
    loop: true,
    autoplay: true
});
```

With 'onRender' callback:
```js
const player = new NdJsonPlayer("video/video01.ndjson", "#video", {
    fps: 30,
    loop: true,
    autoplay: true
}, function(frame) {
   // Do something each frame. 
   // You can add metadata into the JSON frame (see examples).
});
```

Actions:
```js
player.append(frame); // Add a new frame to the player at the end
player.prepend(frame); // Add a new frame to the player at the beginning
player.play(); //Play video manually
player.play(100); //Skip to frame #100
player.playForward(); //Play forward if it was playing backwards
player.playForward(100); //Play forward from frame #100
player.playBackwards(); //Play backwards
player.playBackwards(100); //Play backwards from frame #100
player.step(); //Play a single frame
player.stepForwards(); //Play a single frame forward 
player.stepBackwards(); //Play a single frame backwards
player.pause(); //Pause video
player.stop(); //Stop video and go to original position
```

Properties:
```js
player.ctx          // Access to canvas 2D context
player.canvas       // Access to `<canvas>` element
player.src          // Video source URI (NDJSON)
player.frame        // Current frame being played
player.multiplier   // Multiplier to control speed
```

Methods:
```js
player.load(callback, newSrc)  // Load a video file or change current video file.
player.frameBase()             // Get frame base
player.currentFrame()          // Current frame being played
player.totalFrames()           // Return number of frames
player.totalTime()             // Return total time of video
player.frameAt(index)          // Return a frame in position
player.indexAt(percentage)     // Return index number at percentage of video
player.playerNode()            // Return player Node (wrapper of `<canvas>`)
player.reset()                 // Stops player and clears ctx
```

## NDJSON Format

The `ndjson` file follows a specific format in order to play the video. It usually starts with a single line (JSON)
as the header (general information about the video), followed by multiple lines (JSON), each of which represents
a frame in the video. These frames contain the images, which can be encoded with base64, or they can point into some 
location (URL) where the images are stored.

> NOTE: You can find [some scripts](#scripts) under `/scripts/` in this repository, which can help you to generate `ndjson` 
> files based on a video file or a directory with images.

### Reserved keys:

Keys that will normally go in the header of a ndjson video file:
```json
{
  "fb"  : "Frame base (see notes below)",
  "thb" : "Thumbnail base (see notes below)",
  "fps" : "Video FPS",
  "d"   : "Date, for example: 2020-01-01 (any format is fine)",
  "tf"  : "Total frames (number of frames in the video)",
  "tt"  : "Total time of the video, for example: '00:09:54'",
  "w"   : "Original width of the video (used to adjust canvas size)",
  "h"   : "Original height of the video (used to adjust canvas size)"
}
```
Keys that will normally go in each frame:
```json
{
  "f"   : "Frame content (either a URL or base64 of an image)",
  "t"   : "time, for example: 00:00:10.234",
  "ts"  : "timestamp in Unix Time. When used, lapsed time will be calculated based in starting time.",
  "cc"  : "Close caption that will be placed under the video",
  "x"   : "Repeat: How many times this frame will be repeated (see notes below)",
  "th"  : "Thumbnail (this will also use the value of 'fb' if present)",
  "tc"  : "Thumbnail caption",
  "end" : "Final frame"
}
```

The only required key is `f`. Headers are optional as well any other information.

#### About Date/Time and timestamp (tt, t, ts, d):
The player will not use these values for anything except
displaying them as information. For example, if you set
`tt` to "10:05" and `t` to "01:23", the player will display
"01:23 / 10:05". 

`tt` can be specified as "10:13" or "134.22" (seconds with milliseconds),
which will be formatted as: `00:00.000`.

When `ts` is specified, it will replace `t` (as it is more exact) and 
will calculate the lapsed time between the time stamp of the first image
 (or can be specified in header). It will format the time as: `00:00:00.000`.

If `d` is specified, it will also be displayed before the time. 
You can also use `d` together with the frames if the date 
changes.

#### About Frame and Thumbnail base (fb, thb):
The most common example could be: `data:image/jpeg;base64,`. 
However, it can also be the base of a URL. The reason is that
this value will be prepended to each frame, so it can be anything
that it is repeated across all frames. For example, most images
contain the same data at the beginning which, when specified,
the `ndjson` file size can be reduced considerably.

#### About Repeat (x):
If present, the previous frame will be repeated x times. You can use
this option at the beginning or at the end to keep some image for a longer
time instead of copy+pasting the same frame many times.

#### About Final Frame (end):
When `tf` is not specified and the number of frames are unknown, you can
specify `end` to specify the end of the video or stream. If not set,
the player will wait for new frames.

### Examples:

Images as path:
```json
{ "fps" : 2, "fb" : "http://example.com/img/video/", "tt" : "01:10" }
{ "f" : "frame01.jpg", "th" : "thumb01.jpg" }
{ "f" : "frame02.jpg", "th" : "thumb02.jpg" }
{ "f" : "frame03.jpg", "th" : "thumb03.jpg" }
{ "f" : "frame04.jpg", "th" : "thumb04.jpg" }
```
Images as base64:
```json
{ "fb" :"data:image/jpeg;base64,/9j//gARTGF2YzU4LjEzNC4xMDAA/9sAQwAI", "thb":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA", "tf": 469, "fps": 24, "w":"960", "h":"540" }
{ "f" :"LCw0LDQ8PDw8PDxHQkdKSkpHR0dHSkpKT09...", "th":"haCgGiAASakcBRbW3LTnmUHpW5...", 
{ "f" :"JiYtJi00NDQ0NDQ9OT1AQEA9PT09QEBARas...", "th":"9U+ZS6reZVEvQDcJ7LeUvst5ED...",
{ "f" :"GhoeGh4jIyMjIyMqJyorKysqKioqKysrLy8...", "th":"8pVh/cum/semRq5oxeNCp6rnSp...",
```

As specified earlier, `f` is the only required key, so the following is the minimal example:
```json
{ "f" : "/imgs/frame01.jpg" }
{ "f" : "/imgs/frame02.jpg" }
{ "f" : "/imgs/frame03.jpg" }
```

### Base64 vs Paths

This is a summary of the differences:

|                        | Base64 | Path     |
|------------------------|--------|----------|
| NDJSON file size       | Large  | Small    |
| Download time          | Slower | Faster   |
| Number of connections  | Single | Multiple |
| Video performance      | Faster | Slower   |
| NDJSON generation time | Slower | Faster   |

### Metadata

You can add your own custom keys as needed into the `ndjson` file as long they don't conflict with
the reserved keys above. Your custom keys will be passed into the 'onRender' callback function each frame.

> NOTE : Remember that all the information related to a single frame must be specified in the same line
> (multiple line JSON, or formatted JSON, is not supported)

```json
{ "fps" : 10, "fb" : "data:image/jpeg;base64," }
{ "f" : "....", "people" : "3", "location" : "Outside", "boxes" : [ { "x" : 100, "y" : 200, "w" : 50, "h" : 100 }, ... ] }
{ "f" : "....", "people" : "4", "location" : "Outside", "boxes" : [ { "x" : 350, "y" : 610, "w" : 55, "h" : 130 }, ... ] }
```

## Scripts

Bash scripts can be located in the `scripts/` directory. You can use those to produce NDJSON files from
existing videos (used as examples).

Go to the `scripts/` directory and execute:

```bash
video2ndjson.sh ../video/dance/dance.mp4
```

The script will create `dance.ndjson` with all the frames and thumbnails encoded in base64 (everything you need to play the video).

The above script accept several options (see `video2ndjson.sh --help`):

```bash
Usage: ./video2ndjson.sh VIDEO.file [FILE] [OPTIONS]

Options:
  -o FILE             : Name of the file to create. Default: {VIDEO}.ndjson
  -nt                 : Do not create thumbnails
  -l PATH             : Link files instead of converting them into base64 and store images in PATH
  -zip                : Zip directory with images and thumbnails
  -tgz                : Create tar.gz with images and thumbnails
  -gz                 : Gzip ndjson file when done
  -s THUMBS_SIZE      : By default thumbnails will be of width 10% (-s 10). It can also be set in pixels (-s 100x, -s 100x50, -s x50)
  -e EXTENSION        : Image format to export to (default: jpg) Must be supported by ffmpeg
  -p PREFIX           : Frame (image) prefix (default: empty)
  -w WIDTH            : Video (frames) max width (height can be automatically calculated)
  -h HEIGHT           : Video (frames) max height (width can be automatically calculated)
  -f FPS              : FPS of video
  -fx 'EXTRA'         : Extra arguments to pass to 'ffmpeg'
  -ix 'EXTRA'         : Extra arguments to pass to 'mogrify' (for resizing images)

Examples:
  ./video2ndjson.sh video.mp4
  ./video2ndjson.sh video.mp4 new.ndjson
  ./video2ndjson.sh video.mp4 -nt -gzip -s 10% -w 800 -e png
```

This script is using the other scripts in that directory to generate the ndjson file. If you want to go slowly and understand what it is doing (or have more flexibility), you can use these scripts separatelly (execute each script with `--help` as argument for more information).

For example:

```bash
convert.sh ../video/dance/dance.mp4 /tmp/dance/ -e png -w 960 
```

That script will generate a sequence of images inside `/tmp/dance/` directory with a maximum width of 960 (height is automatically adjusted).

Then, execute:

```bash
resize.sh /tmp/dance/ /tmp/dance/thumbs/ -w 100`
```

This will create the thumbnail images in `/tmp/dance/thumbs/` with a  width of 100.

Finally, generate the NDJSON executing:

```bash
ndjson.sh /tmp/dance/ -t /tmp/dance/thumbs/ -f 5 -b64
```

Will create the `ndjson` file with FPS 5 and will encode all files as base64 (which means, you no longer need the source image frames as they
will be embedded inside that file).


## Limitations

* Some features are still under construction: see [issues](https://github.com/lepe/ndjson-player/issues). 

## Contributing

Fork this project and submit your "pull requests". If you have any issue, contact me.

## Credits

This player was inspired by https://github.com/lepe/frame-player/ (by Vagner Santana)
