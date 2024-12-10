from moviepy import *

text = '黄淑群女士'

p1 = '01:02:09.03'
p2 = '01:03:08.04'
p3 = '01:03:57.07'
p4 = '01:05:15.04'
p5 = '01:06:14.08'
p6 = '01:07:03.08'
p7 = '01:08:21.07'
p8 = '01:09:20.09'
p9 = '01:10:10.01'

vd0 = VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4")
vdn = VideoFileClip('name.mp4')

v1=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(0, p1)
v2=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p1, p2)
v3=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p2, p3)
v4=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p3, p4)
v5=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p4, p5)
v6=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p5, p6)
v7=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p6, p7)
v8=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p7, p8)
v9=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p8, p9)
v10=VideoFileClip("/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4").subclipped(p9)

final_clip = concatenate_videoclips(
    [
        v1,vdn,
        v2,vdn,
        v3,vdn,
        v4,vdn,
        v5,vdn,
        v6,vdn,
        v7,vdn,
        v8,vdn,
        v9,vdn,
        v10

    ]
)

final_clip.write_videofile('./zhunian-' + text + '.mp4', fps=1, threads=8)