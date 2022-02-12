#!/bin/bash
# This script converts a video into a sequence of jpg images
if [[ $1 == "" ]]; then
    echo "Usage: $0 VIDEO.file"
    exit;
fi
video=$1
extension="jpg"
if [ -n "$2" ]; then
  extension="$2"
fi
echo "Converting $video ..."
dir=${video%.*}
mkdir -p $dir
#ffmpeg -i "$video" -an -q:v 1 -qmin 1 -qmax 1 $dir/frame_%06d.jpg
#ffmpeg -i "$video" -an -q:v 1 $dir/frame_%06d.jpg
ffmpeg -i "$video" -an -f image2 "$dir"/frame_%06d."$extension"
#    ./ndjson.sh $dir
