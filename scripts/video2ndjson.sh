#!/bin/bash
# This script is to convert any video into ndjson file

if [[ $1 == "" ]]; then
    echo ""
    echo "Usage: $0 VIDEO.file [FILE] [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -o FILE             : Name of the file to create. Default: {VIDEO}.ndjson"
    echo "  -nt                 : Do not create thumbnails"
    echo "  -l PATH             : Link files instead of converting them into base64 and store images in PATH"
    echo "  -zip                : Zip directory with images and thumbnails"
    echo "  -tgz                : Create tar.gz with images and thumbnails"
    echo "  -gz                 : Gzip ndjson file when done"
    echo "  -s THUMBS_SIZE      : By default thumbnails will be of width 10% (-s 10). It can also be set in pixels (-s 100x, -s 100x50, -s x50)"
    echo "  -e EXTENSION        : Image format to export to (default: jpg) Must be supported by ffmpeg"
    echo "  -p PREFIX           : Frame (image) prefix (default: empty)"
    echo "  -pa				    : Calculate Frame (image) prefix and Thumb prefix"
    echo "  -w WIDTH            : Video (frames) max width (height can be automatically calculated)"
    echo "  -h HEIGHT           : Video (frames) max height (width can be automatically calculated)"
    echo "  -f FPS              : FPS of video"
    echo "  -fx 'EXTRA'         : Extra arguments to pass to 'ffmpeg'"
    echo "  -ix 'EXTRA'         : Extra arguments to pass to 'mogrify' (for resizing images)"
    echo ""
    echo "Examples:"
    echo "  $0 video.mp4"
    echo "  $0 video.mp4 -pa new.ndjson"
    echo "  $0 video.mp4 -nt -gzip -s 10% -w 800 -e png"
    echo ""
    exit;
fi

file=""
extension='jpg'
width="-1"
height="-1"
fps=24
thSize="5%"
thCreate=true
prefix=""
previx_auto=false
fx_extra=""
ix_extra=""
link_dir=""
zip_dir=false
tgz_dir=false
gzip_file=false

POS_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        "-o" )
           file=$2; shift;;
        "-nt" )
           thCreate=false;;
        "-l" )
           link_dir=$2; shift;;
        "-zip" )
           zip_dir=true;;
        "-tgz" )
           tgz_dir=true;;
        "-gz" )
           gzip_file=true;;
        "-s" )
           thSize=$2; shift;;
        "-e" )
           extension=$2; shift;;
        "-p" )
           prefix=$2; shift;;
        "-pa" )
           prefix_auto=true;;
        "-w")
           width=$2; shift;;
        "-h" )
           height=$2; shift;;
        "-f" )
           fps=$2; shift;;
        "-fx" )
           fx_extra=$2; shift;;
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
video="$1"

if [[ $file == "" && $2 != "" ]]; then
  file="$2"
fi
if [[ $file == "" ]]; then
  file=$(basename "$video")
  file="${file%.*}.ndjson"
fi

# ----------- VALIDATION --------------
if [[ ! -e $video ]]; then
    >&2 echo "File not found: $video"
    exit 2
fi

if [[ $link_dir != "" && -d "$link_dir" ]]; then
	>&2 echo "Target directory exists: $link_dir"
	exit 3
fi

# ------------- EXECUTE ----------------
outDir=$(mktemp -d)
opts=""
if [[ $prefix != "" ]]; then
  opts="$opts -p $prefix"
fi
if [[ $width != "-1" ]]; then
  opts="$opts -w $width"
fi
if [[ $height != "-1" ]]; then
  opts="$opts -h $height"
fi

./convert.sh "$video" "$outDir" -nt -e "$extension" "$opts" -x "${fx_extra:-;}"
if [[ $thCreate != false ]]; then
  ./resize.sh "$outDir" -o "$outDir/th" -s "$thSize" -x "${ix_extra:-;}"
fi
if [[ $? == 0 ]]; then
  b64=""
  if [[ $link_dir == "" ]]; then
    b64="-b64"
  else
	mkdir -p $(dirname "$link_dir");
	mv "$outDir" "$link_dir";
	outDir="$link_dir";
  fi
  pa=""
  if [[ $prefix_auto ]]; then
	pa="-pa"
  fi
  ./ndjson.sh "$outDir" -o "$file" -e "$extension" -f "$fps" $pa $b64
  if [[ $? == 0 ]]; then
      bname="${file%.*}"
      if [[ $zip_dir == true ]]; then
		echo "Compressing ZIP..."
		if which 7z > /dev/null; then
			7z a "${bname}.zip" "$outDir"
			link_dir="" # Remove outDir on clean
        elif which zip > /dev/null; then
			if which pv > /dev/null; then
			  zip -qr - "$outDir" | pv -bep -s $(du -bs "$outDir" | awk '{print $1}') > "${bname}.zip"
			else
			  zip -qr "${bname}.zip" "$outDir"
			fi
			link_dir="" # Remove outDir on clean
        else
          >&2 echo "zip command not found"
        fi
      fi
      if [[ $tgz_dir == true ]]; then
        if which tar > /dev/null; then
		  echo "Compressing TGZ..."
		  if which pv > /dev/null; then
	          tar cf - "$outDir" -P | pv -s $(du -bs "$outDir" | awk '{print $1}') | gzip > "${bname}.tgz"
		  else
	          tar zcf "${bname}.tgz" "$outDir"
		  fi
		  link_dir="" # Remove outDir on clean
        else
          >&2 echo "tar command not found"
        fi
      fi
      if [[ $gzip_file == true ]]; then
        if which gzip > /dev/null; then
          gzip "$file"
        else
          >&2 echo "gzip command not found"
        fi
      fi
  fi
fi
# ------------- CLEAN UP -------------
# Be sure that directory is not mistaken before removing
if [[ $link_dir == "" ]]; then
	tmpPath="$outDir"
	if which realpath > /dev/null; then
	  tmpPath=$(realpath "$outDir")
	fi
	if [[ "$tmpPath" != "/" ]]; then
	  rm -rf "$outDir"
	fi
fi
