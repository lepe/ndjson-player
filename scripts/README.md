# Scripts
These are some useful scripts to convert videos
or a sequence of images into a ndjson file.

### video2ndjson.sh

This script will extract all frames from a video
(using ffmpeg) and convert them into images.
Then it will create the njson file with either the base64 encoded images or
linked files.

### convert.sh

This script converts a video into frames

### resize.sh

This script resize images from one directory into another (using imagemagick)

### ndjson-img

This script creates a ndjson file from a sequence of files using their
path.

### ndjson-b64

This script creates a ndjson file encoding all files in a directory into
base64.