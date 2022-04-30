#pip install scipy
# pip install scipy
#pip install Pygame
#choco upgrade imagemagick -y

# https://pypi.org/project/pysub-parser/
# pip install pysub-parser
# pip install movipy

import os
import time
from datetime import time

import numpy as np
from moviepy.editor import *
from moviepy.video.tools.segmenting import findObjects
from pysubparser import parser

subtitle_file = 'xiaman-01.kdenlive.srt'
audio_file = "《心性休息》颂词 朗诵版01.mp3"
output_file = 'xiaman-allclips.mp4'

screensize = (720, 460)

allclips = []

subtitles = parser.parse(subtitle_file)

#for subtitle in subtitles:
for index, subtitle in enumerate(subtitles, start=1):
    print(f'{subtitle.start} > {subtitle.end}')
    print(subtitle.duration / 1000)
    print(subtitle.lines)
    #print(f'ffplay -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    #os.system(f'ffplay -nodisp -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    print()

    sbtt_0 = """
    {}
    """.format("\n".join(subtitle.lines[0:])) + "\n(" + str(index) + ")"

    sbtt = sbtt_0.lstrip()
    print(sbtt)

    audioclip2 = AudioFileClip(audio_file).subclip(subtitle.start.isoformat(),
                                                   subtitle.end.isoformat())
    txtclip = TextClip(sbtt,
                       color='white',
                       font="SimHei",
                       fontsize=40,
                       kerning=-2,
                       interline=-1,
                       bg_color='blue',
                       size=screensize).set_duration(audioclip2.duration)
    #txtclip.set_duration(audioclip2.duration)
    subclip = txtclip.set_audio(audioclip2)

    txtclip2 = TextClip(sbtt,
                        color='white',
                        font="SimHei",
                        fontsize=40,
                        kerning=-2,
                        interline=-1,
                        bg_color='blue',
                        size=screensize).set_duration(60)

    #fclip.preview()
    #time.sleep(9)
    allclips.append(subclip)
    allclips.append(txtclip2)
    allclips.append(subclip)
    allclips.append(txtclip2)


fclip = concatenate_videoclips(allclips)
fclip.write_videofile(output_file, fps=10, codec='mpeg4')
