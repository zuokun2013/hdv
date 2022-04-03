#pip install scipy
# pip install scipy
#pip install Pygame
#choco upgrade imagemagick -y


import numpy as np

from moviepy.editor import *
from moviepy.video.tools.segmenting import findObjects

from datetime import time


def t2sec(t: time) -> int:
    seconds = (t.hour * 60 + t.minute) * 60 + t.second
    return seconds

# WE CREATE THE TEXT THAT IS GOING TO MOVE, WE CENTER IT.

screensize = (720,460)
txtClip = TextClip(u'你好',color='white', font="SimHei",
                   kerning = 5, fontsize=60)
cvc = CompositeVideoClip( [txtClip.set_pos('center')],
                        size=screensize)

txt_credits = """
乙一、略说暇满难得
【友等暇满宝藏身，六趣之中极难得，
犹如盲人获宝藏，当以极喜修利乐。】 	
										
- 乙二、广说暇满难得（分八）：													
- 丙一、宣说十八暇满：													
【何为闲暇与圆满？吾者未生三恶趣，
边鄙邪见长寿天，佛不出世及喑哑，远离一切八无暇。】 	

"""

credits = (TextClip(txt_credits, color='white',
            font="SimHei", fontsize=35, kerning=-2,
            interline=-1, bg_color='black', size=screensize)
          .set_duration(9.5)
          .fadein(.5)
          .fadeout(.5))


from moviepy.editor import *
audioclip = AudioFileClip("C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3").subclip(60+33, 60+50)
clip2=credits.set_audio(audioclip)
clip2.set_duration(audioclip.duration)

# ASSEMBLE EVERYTHING, WRITE TO FILE

final = concatenate_videoclips([clip2])
#final.write_videofile("dancing_knights.mp4", fps=10,                   audio_bitrate="1000k", bitrate="4000k",codec='mpeg4')
# WE CONCATENATE EVERYTHING AND WRITE TO A FILE

# final_clip = concatenate_videoclips(cvc)
# final_clip.write_videofile('coolTextEffects.mp4',fps=10,codec='mpeg4')

# https://pypi.org/project/pysub-parser/
# pip install pysub-parser
import os
import time
from pysubparser import parser

allclips = []

subtitles = parser.parse('C:\\tmp\\xiaman2.kdenlive.srt')

#for subtitle in subtitles:
for index, subtitle in enumerate(subtitles, start=1):    
    print(f'{subtitle.start} > {subtitle.end}')
    print(subtitle.duration / 1000)
    print(subtitle.lines)
    #print(f'ffplay -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    #os.system(f'ffplay -nodisp -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    print()

    sbtt= """
    {}
    """.format("\n".join(subtitle.lines[0:])) + "\n(" + str(index) + ")"

    

    print(sbtt)

    audioclip2 = AudioFileClip("C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3").subclip(subtitle.start.isoformat(), subtitle.end.isoformat())
    txtclip = TextClip(sbtt , color='white',
            font="SimHei", fontsize=40, kerning=-2,
            interline=-1, bg_color='blue', size=screensize).set_duration(audioclip2.duration)
    #txtclip.set_duration(audioclip2.duration)
    subclip=txtclip.set_audio(audioclip2)

    txtclip2 = TextClip(sbtt, color='white',
            font="SimHei", fontsize=40, kerning=-2,
            interline=-1, bg_color='blue', size=screensize).set_duration(60)
    
    #fclip.preview()
    #time.sleep(9)
    allclips.append(subclip)
    allclips.append(txtclip2)
    allclips.append(subclip)
    allclips.append(txtclip2)


fclip = concatenate_videoclips(allclips)
fclip.set_fps(10)
fclip.write_videofile('xiaman-allclips2.mp4',fps=10,codec='mpeg4')
