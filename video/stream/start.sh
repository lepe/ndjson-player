#!/bin/bash
# Generates a NDJSON file with random numbered images to test streaming mode.

# Options:
fps=1

# Variables:
file=random.png
tmpfile=tmp.png
num=0

# Main loop
while :
do
  # Generate a random image of 128 x 64:
  # From: https://unix.stackexchange.com/a/289670/41945
  mx=128;my=64;head -c "$((3*mx*my))" /dev/urandom | convert -depth 8 -size "${mx}x${my}" RGB:- $file

  # Add count into image:
  tmpnum="000000000$num"
  convert -pointsize 20 -fill black -draw "text 20,40 \"${tmpnum:(-8)}\" " $file $tmpfile
  num=$((num + 1));

  # Convert image to bas64:
  b64=$(base64 -w 0 $tmpfile);

  # Generate ndjson file:
  time=$(date +'%H:%M:%S.%3N')
  echo "{\"fps\": 5, \"t\":\"${time}\", \"f\":\"data:image/jpeg;base64,${b64}\"}" >> stream.ndjson

  # Clean-up:
  rm $tmpfile
  rm $file

  # FPS
  sleep $((1000 / $fps))
done