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
first=$(ls "$dir"/*.jpg | head -n 1);
if [[ $(identify --version) ]]; then
  width=$(identify -format '%w' "$first")
  height=$(identify -format '%h' "$first")
else
  width=$(file "$first" | grep -Eo "[0-9]{3,5}+x[0-9]{3,5}+" | awk -Fx '{print $1}')
  height=$(file "$first" | grep -Eo "[0-9]{3,5}+x[0-9]{3,5}+" | awk -Fx '{print $2}')
fi
echo "{\"fb\":\"video/$dir/\", \"tf\": $totalFrames, \"fps\": $fps, \"w\":\"$width\", \"h\":\"$height\" }" > "$dir".ndjson
for frame in "$dir"/*.jpg
do
    fileBase=$(basename "$frame");
    modDate=$(stat -c %y "$frame");
    if [[ $thDir != "" ]]; then
      thb="$thDir/$fileBase";
      echo "{\"f\":\"$fileBase\", \"th\":\"$thb\" }" >> "$dir".ndjson
    else
      echo "{\"f\":\"$fileBase\", \"t\":\"$modDate\"}" >> "$dir".ndjson
    fi
done
