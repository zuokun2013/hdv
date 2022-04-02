
# https://pypi.org/project/pysub-parser/
# pip install pysub-parser
import os
import time
from pysubparser import parser

subtitles = parser.parse('C:\\tmp\\xiaman.kdenlive.srt')

for subtitle in subtitles:
    print(f'{subtitle.start} > {subtitle.end}')
    print(subtitle.duration / 1000)
    print(subtitle.text)
    print(f'ffplay -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    os.system(f'ffplay -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    print()
    time.sleep(3)
