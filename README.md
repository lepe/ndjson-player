### Warning
```diff
- Current player is BETA version, which means not all features have been implemented.
- Because it uses Javascript ES6+ it won't work with old browsers (Currently untested in Edge).
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
* Familiarity : It is very similar to the `<video>` element, so its easy to understand.
* Flexibility : It can be easily extended and improved.
* Stylable : Its easy to create new styles and adapt it to your needs.
* Thumbnails : Display thumbnails on progress mouseover
* Adaptability: It displays well on mobile devices or any size as it adapts to the container size (try it!)
* Full-power : It has (and it will have) many options, so you don't need to modify it to use it as you want.

## Demo:

* [Live example 1 : 640px](https://lepe.github.io/ndjson-player/)
* [Live example 2 : 240px](https://lepe.github.io/ndjson-player/index-240.html)
* [Live example 3 : 1024px](https://lepe.github.io/ndjson-player/index-1024.html)

## Usage

Files are located inside the [dist directory](https://github.com/lepe/ndjson-player/tree/master/dist).

### Required CSS and JS
```html
<link rel="stylesheet" href="ndjson-player.min.css" type="text/css">
<script src="ndjson-player.min.js" type="text/javascript"></script>
```

### Easy way (Using video-nd tag)
```html
<!-- Creates a player with the basic controls which starts automatically and restarts when finish -->
<video-nd src="/video/demo.ndjson" controls loop autoplay></video-nd>

<!-- Creates a player with the most common UI: basic + [thumbs, fullscreen, sizes, lapse] -->
<video-nd src="/video/demo.ndjson" controls="common"></video-nd>

<!-- Creates a player with all UI options: common + [speed, frames, cc, step, stop, back, step_back, fast, fast_back] -->
<video-nd src="/video/demo.ndjson" controls="full"></video-nd>
```

### Events
You can add the events to your `<video-nd>` element to process frames.

#### onrender(frame, player, ui, canvas, ctx) event:
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

Example:
```js
document.querySelector("video-nd").onrender = function(frame, player, canvas, ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "yellow";
    ctx.fontWeight = "bold";
    ctx.fillText(new Date(Date.now()).toLocaleTimeString(), 10, 30);
}
```

#### onaction(action, player, ui) event
In which:
* action : is a string describing it, like: "play", "pause", "stop", "progress"

Useful to execute code on some user action.

#### onload(player) event

Executed when the player is done downloading the source video. 

#### onstart(player) event

Executed when the first image is displayed. Useful to adjust the size of the video.

#### onfinish(player) event

Executed when we reach the end of the video (if playing backwards, it will be triggered on the beginning of the video).

### Advanced HTML example:
```html
<video-nd class="youtube" src="/video/demo-HD.ndjson" controls loop autoplay fps="30" autosize>
       <source src="/video/demo-QVGA.ndjson" width="320">
       <source src="/video/demo-4K.ndjson" width="3840" height="2160">
       <track src="/subtitles/en.txt" kind="subtitles" srclang="en" label="English">
       <track src="/info/data.txt" kind="descriptions" label="Data">
</video-nd>
```

**Note** : `<video-nd>` tag rendering may not work with few browsers, in that case, use the following:

### Simple JS way (using NDJPlayer class)

[Live example](https://lepe.github.io/ndjson-player/index-js.html)
```js
/*
 * @param URL : Source of video.
 * @param Node : Node to use to create the player
 */
new NDJPlayer("/video/demo-640.ndjson", "#video", {
    fps: 30,
    loop: true,
    autoplay: true
});
```
```html
<div id="video"></div>
```

### Advance JS way (using NdJsonPlayer)
```js
// Minimal way to start it if <canvas> exists:
const player = new NdJsonPlayer("video/video01.ndjson");
// Specifying container:
const player = new NdJsonPlayer("video/video01.ndjson", "#video");
// With options:
const player = new NdJsonPlayer("video/video01.ndjson", "#video", {
    fps: 30,
    loop: true,
    autoplay: true
});
// With 'onRender' callback:
const player = new NdJsonPlayer("video/video01.ndjson", "#video", {
    fps: 30,
    loop: true,
    autoplay: true
}, function(frame) {
   // Do something each frame. 
   // You can add metadata into the JSON frame (see examples).
});
// Actions:
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

## NDJSON Format

### Reserved keys:

Keys that will normally go in the header of a ndjson video file:
```json
{
  "fb"  : "Frame base (see notes below)",
  "fps" : "Video FPS",
  "d"   : "Date, for example: 2020-01-01 (any format is fine)",
  "tf"  : "Total frames (number of frames in the video)",
  "tt"  : "Total time of the video, for example: '00:09:54'",
  "w"   : "Original width of the video (used to adjust canvas size)",
  "h"   : "Original height of the video (used to adjust canvas size)",
}
```
Keys that will normally go in each frame:
```json
{
  "f"   : "Frame content (either a URL or base64 of an image)",
  "t"   : "time, for example: 00:00:10.234",
  "ts"  : "timestamp in Unix Time",
  "cc"  : "Close caption that will be placed under the video",
  "x"   : "Repeat: How many times this frame will be repeated (see notes below)",
  "th"  : "Thumbnail (this will also use the value of 'fb' if present)"
  "tc"  : "Thumbnail caption"
}
```
#### About 'Date/Time and timestamp':
The player will not use these values for anything except
displaying them as information. For example, if you set
`tt` to "10:05" and `t` to "01:23", the player will display
"01:23 / 10:05". If they are not set, and `tf` is set, it
will display "frame / total frames" instead. 

If only `tt` of `tf` are specified, the time/frame values will 
be calculated based on the FPS value.

If `d` is specified, it will also be displayed before the time. 
You can also use `d` together with the frames if the date 
changes.

#### About 'Frame base':
The most common example could be: 'data:image/jpeg;base64'. 
However, it can also be the base of a URL. The reason is that
this value will be prepended to each frame, so it can be anything
that it is repeated across all frames.

#### About 'Repeat':
If present, the previous frame will be repeated x times. You can use
this option at the beginning or at the end to keep some image for a longer
time instead of copy+pasting the same frame many times.

### Examples:

```json
{ "fps" : 2, "fb" : "http://example.com/img/video/", "tt" : "01:10" }
{ "f" : "frame01.jpg", "th" : "thumb01.jpg" }
{ "f" : "frame02.jpg", "th" : "thumb02.jpg" }
{ "f" : "frame03.jpg", "th" : "thumb03.jpg" }
{ "f" : "frame04.jpg", "th" : "thumb04.jpg" }
```
It is recommended to use base64 format for images, but URL can also 
be used (although may slow the video)

### Metadata

For metadata, you can add extra keys as needed, which will be passed
into the 'onRender' callback function each frame.

```json
{ "fps" : 10, "fb" : "data:image/jpeg;base64," }
{ "f" : "....", "people" : "3", "location" : "Outside" }
{ "f" : "....", "people" : "4", "location" : "Outside" }
```

## Scripts

Bash scripts can be located in the `video/` directory. You can use those to produce NDJSON files from
existing videos (used as examples).

Go to the `video/` directory and execute:

`convert.sh dance/dance.mp4`

That script will generate a sequence of images inside `dance/dance/` directory with the original size of the video.
Then, execute:

`resize.sh dance/dance/ 800`

In which 800 is the expected size of the new images. It will create the `dance-800/` directory.

Do the same for generating the thumbnails (optional):

`resize.sh dance/dance/ 64`

Finally, generate the NDJSON executing:

`ndjson.sh dance/dance-800/ dance/dance-64/` 

or without thumbnails: 

`ndjson.sh dance/dance-800/` 

It will create the file `dance-800.ndjson` which you can use in the player.

## Limitations

* Some features are still under construction (like tracks and autosize). 
* If the connection is slow, there is currently no "Loading..." message.
* Javascript minifier (inside gulpfile.js) cannot handle private fields in ES6+

## Credits

This player was inspired by https://github.com/lepe/frame-player/ (by Vagner Santana)
