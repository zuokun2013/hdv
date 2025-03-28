

ffmpeg -i 5-2.m4a -i 5-2.PNG -map 0 -map 1 -c copy -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 5-2o.m4a

ffmpeg -i 5-3.m4a -i 5-3.PNG -map 0 -map 1 -c copy -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 5-3.m4a

# cut m4a audio file
ffmpeg -i 6.m4a -ss 00:00:00.00 -to 00:00:06.406 -c copy 6-1.m4a
ffmpeg -i 6.m4a -ss 00:00:06.406 -c copy 6-2.m4a

# add png image file as cover
ffmpeg -i 6-1.m4a -i 6-1.PNG -map 0 -map 1 -c copy -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 6-1o.m4a

ffmpeg -i 6-2.m4a -i 6-2.PNG -map 0 -map 1 -c copy -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 6-2o.m4a

ffmpeg -i 7.mp4 -ss 00:00:00 -t 00:02:30 -vn -c copy output.m4a

ffmpeg -i 7.mp4 -i 7.PNG -map 0 -map 1 -ss 00:00:00 -vn -c copy -disposition:v attached_pic 7o.m4a

ffmpeg -i 7.mp4 -i 7.png -ss 00:00:00  -map 0:a -map 1:v -c:a copy -c:v mjpeg -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 7o.m4a

ffmpeg -i 8.mp4 -i 8-1.png -ss 00:00:00 -to 00:00:13.614 -map 0:a -map 1:v -c:a copy -c:v mjpeg -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 8-1.m4a

ffmpeg -i 8.mp4 -i 8-2.png -ss 00:00:13.614 -to 00:00:29.229 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 8-2.m4a

ffmpeg -i 8.mp4 -i 8-3.png -ss 00:00:29.229 -to 00:00:37.704 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 8-3.m4a

ffmpeg -i 8.mp4 -i 8-4.png -ss 00:00:37.704 -to 00:00:59.526 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 8-4.m4a

ffmpeg -i 8.mp4 -i 8-5.png -ss 00:00:59.526 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 8-5.m4a