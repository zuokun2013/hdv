Get-ChildItem "." -Filter *.m4a | 
Foreach-Object {
    echo ($_.Name)
    ffmpeg -i $_.Name -c:v copy -c:a libmp3lame -q:a 0 "$_.mp3"
}
