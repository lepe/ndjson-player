#!/bin/bash
# This script resize all files in a directory and store them in another directory (using imagemagick)

if [[ $1 == "" ]]; then
    echo ""
    echo "Usage: $0 DIR_SRC [DIR_TGT] [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -o DIR_TGT          : Where do the resized images will be stored. Default: {DIR_SRC}-{SIZE}."
    echo "  -e EXTENSION        : Image extension filter (by default will get any file inside directory)"
    echo "  -w WIDTH            : Maximum width of resized image (height can be automatically calculated)"
    echo "  -h HEIGHT           : Maximum height of resized image (width can be automatically calculated)"
    echo "  -s SIZE             : Target image size (eg.: 50%, 640x480)"
    echo "  -x 'EXTRA_ARGUMENTS': Extra arguments to pass to 'mogrify'"
    echo ""
    echo "Examples: "
    echo "  $0 source/ -o target/ -w 200"
    echo "  $0 source/ target/ -s 50%"
    echo "  $0 source/ target/ -w 100 -h 100 -x '-background white -quality 75'"
    echo ""
    exit;
fi

dir=""
target=""
extension="*"
width=""
height=""
size=""
resizer="mogrify" #Command used to resize
extra=""

POS_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        "-o" )
           target=${2%/}; shift;;
        "-e" )
           extension=$2; shift;;
        "-w")
           width=$2; shift;;
        "-h" )
           height=$2; shift;;
        "-s" )
           size=$2; shift;;
        "-x" )
           if [[ $2 != ";" ]]; then
              extra=$2;
           fi
           shift;;
        "--help" )
           "$0"; exit;;
        -*)
           echo "Unknown option: $1"; exit 4;;
         *)
           POS_ARGS+=("$1");;
   esac
   shift
done

# ----- POSITIONAL ARGS -----------
set -- "${POS_ARGS[@]}"
dir=${1%/}
if [[ $target == "" && $2 != "" ]]; then
  target=${2%/}
fi
if [[ $size != "" ]]; then
  if [[ $target == "" ]]; then
    target="${dir}-${size/%/}"
  fi
  size="${size}"
else
  if [[ $target == "" ]]; then
    target="${dir}-${width}x${height}"
  fi
  size="${width}x${height}"
fi

# ----------- VALIDATION --------------
if [[ "${width}${height}${size}" == "" ]]; then
    >&2 echo "You need to specify either WIDTH (w), HEIGHT (h) or SIZE (s)"
    >&2 echo "Example: $0 $@ -w 600"
    exit 1
fi

if [[ ! -d "$dir" ]]; then
  >&2 echo "Directory doesn't exists: $dir"
  exit 2
fi

which "$resizer" > /dev/null
if [[ $? != 0 ]]; then
    >&2 echo "Unable to locate $resizer"
    exit 3
fi

# ------------- EXECUTE ----------------
echo "Resizing $dir..."
mkdir -p "$target"
echo mogrify -resize "$size" $extra -path "$target" "$dir"/*."$extension"
#read -p "Enter to proceed... " enter
mogrify -resize "$size" $extra -path "$target" "$dir"/*."$extension"
