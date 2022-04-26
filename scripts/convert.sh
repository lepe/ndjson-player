#!/bin/bash
# This script converts a video into a sequence of images using ffmpeg

if [[ $1 == "" ]]; then
    echo ""
    echo "Usage: $0 VIDEO.file [DIRECTORY] [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -o DIRECTORY        : Where do the images will be stored. Default is created using video file name"
    echo "  -nt                 : Do not create thumbnails"
    echo "  -t DIRECTORY_THUMBS : If specified, thumbnails will be created in that directory (default: DIRECTORY/th/)"
    echo "  -s THUMBS_SIZE      : By default thumbnails will be of width 10% (-s 10). It can also be set in pixels (-s 100x, -s 100x50, -s x50)"
    echo "  -e EXTENSION        : Image format to export to (default: jpg) Must be supported by ffmpeg"
    echo "  -p PREFIX           : Frame (image) prefix (default: empty)"
    echo "  -w WIDTH            : If specified, images will be resized (height can be automatically calculated)"
    echo "  -h HEIGHT           : If specified, images will be resized (width can be automatically calculated)"
    echo "  -x 'EXTRA_ARGUMENTS': Extra arguments to pass to 'ffmpeg'"
    echo ""
    echo "Examples:"
    echo "  $0 video.mp4 -o target/ -e png -w 960"
    echo "  $0 video.mp4 target/ -t thumbs/ -s 50x"
    echo ""
    exit;
fi

encoder="ffmpeg"
extension='jpg'
dir=""
width="-1"
height="-1"
thDir=""
thSize="10"
thCreate=true
prefix=""

POS_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        "-o" )
           dir=${2%/}; shift;;
        "-nt" )
           thCreate=false;;
        "-t" )
           thDir=${2%/}; shift;;
        "-s" )
           thSize=$2; shift;;
        "-e" )
           extension=$2; shift;;
        "-p" )
           prefix=$2; shift;;
        "-w")
           width=$2; shift;;
        "-h" )
           height=$2; shift;;
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
video=$1
bname=$(basename "$video")
base=${bname%.*}

if [[ $dir == "" && $2 != "" ]]; then
  dir=${2%/}
elif [[ "$dir" == "" ]]; then
  dir="$base"
fi
if [[ "$thDir" == "" ]]; then
  thDir="${dir}/th"
fi

# ----------- VALIDATION --------------
if ! which "$encoder" > /dev/null; then
    >&2 echo "Unable to locate $encoder"
    exit 1
fi
if [[ ! -e $video ]]; then
    >&2 echo "File not found: $video"
    exit 2
fi

# ------------- EXECUTE ----------------
mkdir -p "$dir"
if [[ $width != "-1" || $height != "-1" ]]; then
  resize="-vf scale=${width}:${height}"
fi
echo "Converting $video ..."
echo $encoder -i "$video" -an -f image2 $resize $extra "$dir"/${prefix}%06d."$extension"

#read -p "Enter to proceed... " enter

$encoder -i "$video" -an -f image2 $resize $extra "$dir"/${prefix}%06d."$extension"

if [[ $thCreate == true ]]; then
  echo ./resize.sh "$dir" -o "$thDir" -s "$thSize"
  ./resize.sh "$dir" -o "$thDir" -s "$thSize"
fi
