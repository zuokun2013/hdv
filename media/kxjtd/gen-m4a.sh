

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

ffmpeg -i 9.mp4 -i 9-1.png -ss 00:00:00.000 -to 00:00:11.044 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-1.m4a

ffmpeg -i 9.mp4 -i 9-2.png -ss 00:00:11.044 -to 00:00:23.056 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-2.m4a

ffmpeg -i 9.mp4 -i 9-3.png -ss 00:00:23.056 -to 00:00:33.500 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-3.m4a

ffmpeg -i 9.mp4 -i 9-4.png -ss 00:00:33.500 -to 00:00:48.215 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-4.m4a

ffmpeg -i 9.mp4 -i 9-5.png -ss 00:00:48.215 -to 00:01:00.093 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-5.m4a


ffmpeg -i 9.mp4 -i 9-6.png -ss 00:01:00.093 -to 00:01:13.540 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-6.m4a

ffmpeg -i 9.mp4 -i 9-7.png -ss 00:01:13.540 -to 00:01:24.985 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-7.m4a

ffmpeg -i 9.mp4 -i 9-8.png -ss 00:01:24.985 -to 00:01:37.998 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-8.m4a

ffmpeg -i 9.mp4 -i 9-9.png -ss 00:01:37.998 -to 00:01:48.709 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-9.m4a

ffmpeg -i 9.mp4 -i 9-10.png -ss 00:01:48.709 -map 0:a -map 1:v -c:a copy -c:v mjpeg -strict -2 -metadata:s:v title="Cover" -metadata:s:v comment="Cover (Front)" -disposition:v attached_pic 9-10.m4a