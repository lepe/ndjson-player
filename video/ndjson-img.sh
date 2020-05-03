#!/bin/bash
# This script convert a directory with jpg images into ndjson file to use in the player
# It won't use Base64, it will keep the structure of directory as specified (you can change it later in the header)

if [[ $1 == "" ]]; then
    echo "Usage: $0 DIRECTORY [DIRECTORY_THUMBS]"
    exit;
fi

dir=${1%/}
thDir=${2%/}
totalFrames=$(ls -l "$dir"/*.jpg | wc -l);
fps=24
echo "{\"fb\":\"$dir/\", \"tf\": $totalFrames, \"fps\": $fps }" > $dir.ndjson
for frame in $dir/*.jpg
do
    fileBase=$(basename $frame);
    if [[ $thDir != "" ]]; then
      thb="$thDir/$fileBase";
      echo "{\"f\":\"$fileBase\", \"th\":\"$thb\" }" >> $dir.ndjson
    else
      echo "{\"f\":\"$fileBase\"}" >> $dir.ndjson
    fi
done
