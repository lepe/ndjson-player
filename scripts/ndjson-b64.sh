#!/bin/bash
# This script convert a directory with jpg images into ndjson file to use in the player
# encoding each frame to base64
if [[ $1 == "" ]]; then
    echo "Usage: $0 DIRECTORY [EXTENSION] [DIRECTORY_THUMBS]"
    exit;
fi

dir=${1%/}
thDir=${3%/}
extension="jpg"
if [ -n "$2" ]; then
  extension="$2"
fi
totalFrames=$(ls -l "$dir"/*."$extension" | wc -l);
fps=25

if [[ $extension == "jpg" ]]; then
  echo "{\"fb\":\"data:image/jpeg;base64,\", \"tf\": $totalFrames, \"fps\": $fps }" > $dir.ndjson
else
  echo "{\"fb\":\"data:image/png;base64,\", \"tf\": $totalFrames, \"fps\": $fps }" > $dir.ndjson
fi

for frame in "$dir"/*."$extension"
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
