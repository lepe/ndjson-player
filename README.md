# ndjson-player
Video player which uses NDJSON as source and metadata

Inspired in https://github.com/lepe/frame-player/ (by Vagner Santana)

NDJSON data is more suitable to use a video container than JSON as it it doesn't need to parse the whole JSON file to start playing.

[Live example](https://lepe.github.io/ndjson-player/)

## Usage

```html
<link rel="stylesheet" href="ndjson-player.min.css" type="text/css">
<script src="ndjson-player.min.js" type="text/javascript"></script>
```

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
  "tt"  : "Total time of the video, for example: '00:09:54'"
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

#### Metadata

For metadata, you can add extra keys as needed, which will be passed
into the 'onRender' callback function each frame.

```json
{ "fps" : 10, "fb" : "data:image/jpeg;base64," }
{ "f" : "....", "people" : "3", "location" : "Outside" }
{ "f" : "....", "people" : "4", "location" : "Outside" }
```
