#!/bin/bash
# This script convert a directory with jpg images into ndjson file to use in the player
# encoding each frame to base64
if [[ $1 == "" ]]; then
    echo "Usage: $0 DIRECTORY [DIRECTORY_THUMBS]"
    exit;
fi

dir=${1%/}
thDir=${2%/}
totalFrames=$(ls -l "$dir"/*.jpg | wc -l);
fps=24
echo "{\"fb\":\"data:image/jpeg;base64,\", \"tf\": $totalFrames, \"fps\": $fps }" > $dir.ndjson
for frame in $dir/*.jpg
do
    fileBase=$(basename $frame);
    b64=$(base64 -w 0 $frame);
    if [[ $thDir != "" ]]; then
      thb64=$(base64 -w 0 $thDir/$fileBase);
      echo "{\"f\":\"$b64\", \"th\":\"$thb64\" }" >> $dir.ndjson
    else
      echo "{\"f\":\"$b64\"}" >> $dir.ndjson
    fi
done
