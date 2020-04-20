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

```json
{ "frame" : "image 1 here" }
{ "frame" : "image 2 here" }
{ "frame" : "image 3 here" }
{ "frame" : "image 4 here" }
```
As image, it is recommended to use base64 format for images, but URL can also be used (although may slow the video)

For metadata, you can add whatever you want, for example:

```json
{ "frame" : "data:image/jpeg;base64,....", "timestamp" : "934237861236", "location" : "Outside" }
{ "frame" : "data:image/jpeg;base64,....", "timestamp" : "934237868724", "location" : "Outside" }
```