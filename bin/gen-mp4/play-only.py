import os
import time
import tkinter as tk
from random import choice, seed
from string import ascii_letters
from threading import *

from pysubparser import parser

seed(42)

root = tk.Tk()

root.geometry("{0}x{1}+0+0".format(root.winfo_screenwidth(),
                                   root.winfo_screenheight()))
#root.attributes('-fullscreen', True)
root.state('zoomed')
root.configure(bg='blue') 
# root.wm_overrideredirect(True)
# root.bind("<Button-1>", lambda evt: root.destroy())

l = tk.Label(text='', font=("SimHei", 60), fg='white',bg='blue')
l.pack(expand=True)

subtitles = parser.parse('xiaman-01.kdenlive.srt')
total_st = len(list(subtitles))
subtitles = parser.parse('xiaman-01.kdenlive.srt')

def work():

    i = 0
    for subtitle in (subtitles):
        print(f'{subtitle.start} > {subtitle.end}')
        print(subtitle.duration / 1000)
        i = i + 1

        sbtt = """
        {}
        """.format("\n".join(subtitle.lines[0:])) + "\n(" + str(i) + "/" + str(total_st) + ")"

        print(sbtt.lstrip())
        l.config(text=sbtt.lstrip())
        os.system(
            f'ffplay -nodisp -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "《心性休息》颂词 朗诵版01.mp3"'
        )
        print()

        time.sleep(5)


# work function
t1 = Thread(target=work)
t1.start()

l.config(text='')
root.mainloop()
