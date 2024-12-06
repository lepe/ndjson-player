#!/bin/bash
# This script convert a directory with images into ndjson file to use in the player

if [[ $1 == "" ]]; then
    echo ""
    echo "Usage: $0 DIRECTORY [FILE] [OPTIONS]"
    echo "  DIRECTORY: place where images (frames) are stored"
    echo ""
    echo "Options:"
    echo "  -o FILE             : Name of the file to create. Default: {DIRECTORY}.ndjson"
    echo "  -t DIRECTORY_THUMBS : Where does the thumbnails are located (default: DIRECTORY/th/)"
    echo "  -e EXTENSION        : Image extension filter (by default will get any file inside directory)"
    echo "  -s WIDTHxHEIGHT     : Force size (or in case detection is failing)."
    echo "  -f FPS              : FPS to specify in header (default: 24)"
    echo "  -pa                 : Automatically calculate frame and thumb prefixes (only for base64)"
    echo "  -b64                : Encode files to Base64 instead of using file path"
    echo ""
    echo "Examples:"
    echo " $0 target/ -t thumbs/ -e png -s 1024x768 -f 10"
    echo " $0 target/ -s 800x -b64"
    echo ""
    exit;
fi

file=""
dir=""
extension='*'
fps=24
width=0
height=0
thDir=""
b64=false
pa=false
prefix=""
th_prefix=""

POS_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        "-o" )
           file=$2; shift;;
        "-t" )
           thDir=${2%/}; shift;;
        "-e" )
           extension=$2; shift;;
        "-s" )
           width=${2%x*}
           height=${2#*x}
           shift;;
        "-f" )
           fps=$2; shift;;
        "-pa" )
           pa=true;;
        "-b64" )
           b64=true;;
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
if [[ $file == "" && $2 != "" ]]; then
  file="$2"
fi
if [[ $file == "" ]]; then
  bname=$(basename "$dir")
  file="${bname}.ndjson"
fi
if [[ "$thDir" == "" ]]; then
  thDir="${dir}/th"
  if [[ ! -d "${dir}/th" ]]; then
	thDir=""
  fi
fi

# ----------- VALIDATION --------------
if [[ ! -d "$dir" ]]; then
  >&2 echo "Directory doesn't exists: $dir"
  exit 1
fi

mapfile -d $'\0' images < <(find "$dir/" -maxdepth 1 -type f -name "*.$extension" -print0)
totalFrames="${#images[@]}"
echo "Total frames: $totalFrames"

if (( $totalFrames <= 0 )); then
    >&2 echo "No images found with extension: $extension in directory: $dir"
    exit 2
fi

# ------------- EXECUTE ----------------
if [[ $width == 0 || $height == 0 ]]; then
  first="${images[0]}";
  if [[ $(identify --version) ]]; then
    if [[ $width == 0 ]]; then
      width=$(identify -format '%w' "$first")
    fi
    if [[ $height == 0 ]]; then
      height=$(identify -format '%h' "$first")
    fi
  else
    info=$(file "$first" | grep -Eo "[0-9]{3,5}+x[0-9]{3,5}+")
    if [[ $width == 0 ]]; then
      width=$(echo "$info" | awk -Fx '{print $1}')
    fi
    if [[ $height == 0 ]]; then
      height=$(echo "$info" | awk -Fx '{print $2}')
    fi
  fi
fi

# Exporting header:
if [[ $b64 == true ]]; then
  first="${images[0]}";
  contentType=$(file --mime-type "$first" | awk '{ print $2 }')
  if [[ $pa ]]; then
	  echo "{\"fb\":\"data:${contentType};base64,PA_FRAME\", \"thb\": \"data:${contentType};base64,PA_TH_FRAME\", \"tf\": $totalFrames, \"fps\": $fps, \"w\":\"$width\", \"h\":\"$height\" }" > "$file"
  else
	  echo "{\"fb\":\"data:${contentType};base64,\", \"tf\": $totalFrames, \"fps\": $fps, \"w\":\"$width\", \"h\":\"$height\" }" > "$file"
  fi
else
  echo "{\"fb\":\"$dir/\", \"tf\": $totalFrames, \"fps\": $fps, \"w\":\"$width\", \"h\":\"$height\" }" > "$file"
fi

function set_common_prefix {
  if [[ $prefix == "" ]]; then
	  prefix="$1"
  else
    i=0
    while [ "${prefix:i:1}" == "${1:i:1}" ] && [ $i -lt ${#prefix} ] && [ $i -lt ${#1} ]; do
      ((i++))
    done
    prefix="${prefix:0:$i}"
  fi
}
function set_common_th_prefix {
  if [[ $th_prefix == "" ]]; then
	  th_prefix="$1"
  else
    i=0
    while [ "${th_prefix:i:1}" == "${1:i:1}" ] && [ $i -lt ${#th_prefix} ] && [ $i -lt ${#1} ]; do
      ((i++))
    done
    th_prefix="${th_prefix:0:$i}"
  fi
}

# Exporting frames:
function export_frame_b64 {
    frame="$1"
    fileBase=$(basename $frame);
    enc64=$(base64 -w 0 $frame);
	set_common_prefix "$enc64"
    if [[ $thDir != "" ]]; then
      thb64=$(base64 -w 0 $thDir/$fileBase);
	  set_common_th_prefix "$thb64"
      echo "{\"f\":\"$enc64\", \"th\":\"$thb64\" }" >> "$file"
    else
      echo "{\"f\":\"$enc64\"}" >> "$file"
    fi
}
function export_frame_link {
    frame="$1"
    fileBase=$(basename "$frame");
    modDate=$(stat -c %y "$frame");
    if [[ $thDir != "" ]]; then
      thb="$thDir/$fileBase";
      echo "{\"f\":\"$fileBase\", \"th\":\"$thb\" }" >> "$file"
    else
      echo "{\"f\":\"$fileBase\", \"t\":\"$modDate\"}" >> "$file"
    fi
}

#read -p "Enter to proceed... " enter

for img in "${images[@]}"; do
  if [[ $b64 == true ]]; then
    export_frame_b64 "$img";
  else
    export_frame_link "$img";
  fi
done

if [[ $pa ]]; then
	echo "Prefix: $prefix"
	echo "TH Prefix: $th_prefix"
	# Remove repeated prefixes
	sed -i "s@$prefix@@" $file
	sed -i "s@$th_prefix@@" $file
	sed -i "s@PA_FRAME@$prefix@" $file
	sed -i "s@PA_TH_FRAME@$th_prefix@" $file
fi
