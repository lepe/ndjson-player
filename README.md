### Warning
```diff
- Current player is BETA version, which means not all features have been implemented.
- Because it uses Javascript ES6+ it will only work with modern browsers.
 ```

# About BETA branch

The new changes in this library will be focus on placing and playing anything using NDJSON 
as metadata. 

These changes mean that you can play many objects at the same time, for example multiple
MP4 videos, live feeds, text or images (including simple animations) all in a single screen.

**NOTE**: This documentation will change and most of it may not apply to the BETA branch.

# ndjson-player

NDJsonPlayer (or video-nd) uses [NDJSON](http://ndjson.org/) as source and metadata.

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

## NDJSON Format

The `ndjson` file follows a specific format. It usually starts with a single line (JSON)
as the header (general information about the video), followed by multiple lines (JSON), each of which represents
a frame or an object in the video. 

> NOTE: You can find [some scripts](#scripts) under `/scripts/` in this repository, which can help you to generate `ndjson` 
> files based on a video file or a directory with images.

### Types (items)

Specifies the type of resource or object to process. 
```text
g : General configuration (it only be applied to objects which uses it)
v : Video
a : Audio
t : Text
f : Frame (usually JPEG)
p : Picture (SVG, PNG, JPEG, etc)
c : circle
q : square
d : Custom data (it will be passed to onRender)
```
Each of these objects may have their own specific properties. 

#### (g) General

Define global properties or default values for any other object which uses such properties.

Global Properties: (only applies to 'g')

```json
{
 "fps" : "[int] frames per second (default: 24)",
 "kar" : "[bool] keep aspect ratio (default: true)",
 "sc"  : "[int] scale = number of pixels in canvas width (default 1000 or initial canvas width property 'w')",
 "w"   : "[int] initial width for canvas",
 "h"   : "[int] initial height for canvas"
}
```
NOTE: scale is used to calculate positions inside canvas. It is a logical value regardless of actual canvas size.

Besides the above, you can define default values for object properties:

For example: `font-style: "16px Arial"; z-index: 0` and `loop = true`:
```json
{"i": "g", "fs": 16, "ff": "Arial", "z": 0, "lp": true}
```
If an object uses the `Font-Family`(ff) property, like a `Text` object, it will use that one unless is specified in it, like:
```json
{"i" : "t", "ff": "Tahoma"}
```

#### (v) Video Track

Video object to play on canvas. By default, it will try to cover all canvas. Width and Height specified here is from the
source, and it is used to simplify the initialization. It can be anything supported by the browser. It can also come
from a live stream.

Properties:
```json
{
 "s"   : "[string] URL or base64 of the source (required)",
 "t"   : "[time] Time at which video will start (if not set, it will be 00:00:00)",
 "tt"  : "[int] Total time (after this time, the video will stop). If not set, it will be calculated",
 "va"  : "[true|false] Video Audio (off by default)",
 "ls"  : "[true|false] If source is from a live stream (false by default)",
 "w"   : "[int] width of video",
 "h"   : "[int] height of video",
 "z"   : "[int] Z index for the object (default 0: background for videos)",
 "ps"  : "[float] playback speed (default: 1)"
}
```
example (Play immediately for 30 seconds):
```json
{"i": "v", "s": "/video.mp4", "tt": "00:00:30"}
```

#### (a) Audio Track

Audio to play on the background.

Properties:
```json
{
 "s"   : "[string] URL or base64 of the source (required)",
 "t"   : "[time] Time at which audio will start playing (if not set, it will be 00:00:00)",
 "tt"  : "[int] Total time (after this time, the audio will stop). If not set it will be calculated"
}
```
example (Play english audio for 1 minute after 15s):
```json
{"i": "a", "s": "/english.mp3", "t": "00:00:15", "tt": "00:01:00"}
```

#### (t) Text

Text to place on screen. Can be a caption or a title.

Properties:
```json
{
 "a"   : "[int] angle (degrees) rotation",
 "fc"  : "[string] font color",
 "ff"  : "[string] font family",
 "fo"  : "[int] front (outline) stroke width",
 "foc" : "[string] stroke color",
 "fs"  : "[int] font size",
 "s"   : "[string] Text to render",
 "sc"  : "[int] scale (width of non-resized canvas)",
 "t"   : "[time] Time at which it will be visible (if not set, it will be 00:00:00)",
 "tt"  : "[int] Total time (after this time, the text will not be shown)",
 "x"   : "[int] X coordinate to place text",
 "xx"  : "[int] X coordinate to move to",
 "y"   : "[int] Y coordinate to place text",
 "yy"  : "[int] Y coordinate to move to",
 "z"   : "[int] Z index for the object (default : top front for text)"
}
```
example (Place text and display it for 5 seconds):
```json
{"i": "t", "s": "Please wait...", "t": "00:03:10", "tt": "00:00:05"}
```

#### (f) Frame

A video frame. It can come from a live view or a video decoded by a script. The main difference with "Picture"
is that all frames will be queued as they are read and are not designed to be rotated or moved.

Properties:
```json
{
 "s"   : "URL or base64",
 "t"   : "[time] Time at which it will be visible (if not set, it will be 00:00:00)",
 "tt"  : "[int] Total time (after this time, the text will not be shown)",
 "w"   : "[int] width of image",
 "h"   : "[int] height of image",
 "sc"  : "[int] scale (width of non-resized canvas)",   
 "z"   : "[int] Z index for the object (default 0: as background)"
}
```

#### (p) Picture

Usually an overlay placed somewhere inside the canvas. Can be animated and rotated.

Properties:
```json
{
 "a"   : "[int] angle (degrees) initial rotation",
 "aa"  : "[int] angle to rotate (positive=clockwise)",
 "fh"  : "[bool] If true, it will flip the image horizontally.",
 "fv"  : "[bool] If true, it will flip the image vertically.",
 "h"   : "[int] height of image",
 "s"   : "URL or base64",
 "sc"  : "[int] scale (width of non-resized canvas)",
 "ss"  : "[int] scale to size (positive=larger)",
 "t"   : "[time] Time at which it will be visible (if not set, it will be 00:00:00)",
 "tl"  : "[bool] If true, will use top-left coordinate for drawing image instead of center.",
 "tt"  : "[int] Total time (after this time, the text will not be shown)",
 "w"   : "[int] width of image",
 "x"   : "[int] X coordinate to place text",
 "xx"  : "[int] X coordinate to move to",
 "y"   : "[int] Y coordinate to place text",
 "yy"  : "[int] Y coordinate to move to",
 "z"   : "[int] Z index for the object (default 1: above background)"
}
```
example (Place image rotated 90 degrees and rotate it 25 degrees counterclockwise in 18 seconds)
```json
{"i": "t", "s": "/img/arrow.svg", "t": "00:10:00", "tt": "00:00:18", "w": 64, "h": 64, "a": 90, "aa": -25, "x": 150, "y": 180}
```

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

#### About Frame and Thumbnail base (sb, thb):
The most common example could be: `data:image/jpeg;base64,`. 
However, it can also be the base of a URL. The reason is that
this value will be prepended to each frame, so it can be anything
that it is repeated across all frames. For example, most images
contain the same data at the beginning which, when specified,
the `ndjson` file size can be reduced considerably.

#### About Repeat (n):
If present, the previous frame will be repeated n times. You can use
this option at the beginning or at the end to keep some image for a longer
time instead of copy+pasting the same frame many times.

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

## About Video Size

You can set the original video size in any of the 3 ways explained above (in the `<video-nd>` HTML tag, in `NDJPlayer` or in `NDJsonPlayer`) and 
in the `ndjson` header (`w` and `h`). If you don't specify any, the library will try to adjust the video size automatically. However, 
in such cases, it is possible that the image will be stretched to fit the parent element.

## Limitations

* Some features are still under construction: see [issues](https://github.com/lepe/ndjson-player/issues). 

## Contributing

Fork this project and submit your "pull requests". If you have any issue, contact me.
