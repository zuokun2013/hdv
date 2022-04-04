import os

#os.system(f'ffmpeg -ss 132 -t 139 -i "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3" xmtest.mp3')

subttl="《心性休息》颂词 朗诵版01"
#ffmpeg -f lavfi -i color=size=320x240:duration=10:rate=25:color=blue -vf "drawtext=fontfile=/path/to/font.ttf:fontsize=30:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='Stack Overflow'" output.mp4
#os.system(f'ffmpeg -f lavfi -i color=size=1280x720:rate=10:color=blue -i xmtest.mp3 -vf "drawtext=fontfile=c:\\windows\\fonts\\simhei.ttf:fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text=\'{subttl}\'" -c:a copy -shortest output2.mp4')

os.system(f'ffmpeg -f lavfi -i color=blue:size=1280x720:rate=10 -i xmtest.mp3 -vf "drawtext=fontfile=C\\\\:/Windows/Fonts/simhei.ttf:fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:textfile=ttt.txt" -c:a copy -shortest output3.mp4')
