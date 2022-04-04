import tkinter as tk
from random import seed, choice
from string import ascii_letters

import os
import time
from pysubparser import parser
from threading import *


seed(42)

colors = ('red', 'yellow', 'green', 'cyan', 'blue', 'magenta')
def do_stuff():
    s = ''.join([choice(ascii_letters) for i in range(10)])
    color = choice(colors)
    l.config(text=s, fg=color)
    root.after(100, do_stuff)

root = tk.Tk()
root.wm_overrideredirect(True)
root.geometry("{0}x{1}+0+0".format(root.winfo_screenwidth(), root.winfo_screenheight()))
root.bind("<Button-1>", lambda evt: root.destroy())

l = tk.Label(text='', font=("Helvetica", 60))
l.pack(expand=True)

subtitles = parser.parse('C:\\tmp\\xiaman2.kdenlive.srt')  

def work():
    
    i=0
    for subtitle in (subtitles):    
        print(f'{subtitle.start} > {subtitle.end}')
        print(subtitle.duration / 1000)
        i=i+1

        sbtt= """
        {}
        """.format("\n".join(subtitle.lines[0:])) + "\n(" + str(i) + ")"

        print(sbtt)
        l.config(text=sbtt)
        print(f'ffplay -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
        os.system(f'ffplay -nodisp -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
        print()
        
        time.sleep(3)


t1=Thread(target=work)
t1.start()
  
# work function


#do_stuff()
l.config(text='')
root.mainloop()



