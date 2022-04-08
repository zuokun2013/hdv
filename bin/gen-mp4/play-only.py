import os
import time
import tkinter as tk
from random import choice, seed
from string import ascii_letters
from threading import *
from tracemalloc import start

from pysubparser import parser
import sys

start_pos = 0
if len(sys.argv) >= 2:
    start_pos = int(sys.argv[1])

pause_time = 60

seed(42)

root = tk.Tk()

root.geometry("{0}x{1}+0+0".format(root.winfo_screenwidth(),
                                   root.winfo_screenheight()))
#root.attributes('-fullscreen', True)
root.state('zoomed')
root.configure(bg='blue') 
# root.wm_overrideredirect(True)
# root.bind("<Button-1>", lambda evt: root.destroy())

#l = tk.Label(text='', font=("STKAITI", 60), fg='white',bg='blue')
l = tk.Label(text='', font=("STLITI", 60), fg='white',bg='blue')
l.pack(expand=True)
dir_path = os.path.dirname(os.path.realpath(__file__)) + '\\'
tmp_subtitles = list(parser.parse( dir_path +'xiaman-01.kdenlive.srt'))
#total_st = len(subtitles)
#subtitles = parser.parse( dir_path +'xiaman-01.kdenlive.srt')


subtitles = []
subtitles.extend(tmp_subtitles[start_pos:len(tmp_subtitles)])
subtitles.extend(tmp_subtitles[0:start_pos])

def work():

    i = 0
    for subtitle in (subtitles):
        i = i + 1
        
        print(subtitle)
        print(f'{subtitle.start} > {subtitle.end}')
        print(subtitle.duration / 1000)
       

        sbtt = """
        {}
        """.format("\n".join(subtitle.lines[0:])) + "\n(" + str(tmp_subtitles.index(subtitle)) + "/" + str(len(subtitles)) + ")"

        print(sbtt.lstrip())
        l.config(text=sbtt.lstrip())
        print()
        

        os.system(
            f'ffplay -nodisp -autoexit "' + dir_path + 'ding.mp3"'
        )
        os.system(
            f'ffplay -nodisp -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "' + dir_path + '《心性休息》颂词 朗诵版01.mp3"'
        )        
        time.sleep(pause_time)


# work function
t1 = Thread(target=work)
t1.start()

l.config(text='')
root.mainloop()
