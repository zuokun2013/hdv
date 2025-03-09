from moviepy import *
import os

name_text = '刘德元女士'
# srcVideo = "/Users/jzhang/Downloads/助念往生仪轨2022修改版.mp4"
srcVideo = "/home/zuokun/Downloads/助念往生仪轨2022修改版.mp4"

# fontDir="/System/Library/Fonts/PingFang.ttc"
fontDir="/usr/share/fonts/opentype/noto/NotoSansCJK-Light.ttc"

name_mp3="~name.mp3"
name_png="~name.png"
name_mp4="~name.mp4"

# ----------- step 1 ------------
# step1: generate name.mp3 using edge tts
import edge_tts

communicate = edge_tts.Communicate(name_text)
communicate.save_sync(name_mp3)

# ----------- step 2 ------------
from PIL import Image, ImageDraw, ImageFont

# Load the image
image_dir = os.path.dirname(os.path.realpath(__file__))
image_file=os.path.join(image_dir, "Slide26.png")
image = Image.open(image_file)
text2 = '亡者：' + name_text

# Create a drawing context
draw = ImageDraw.Draw(image)
position = (20, 20)
# font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 64)

font = ImageFont.truetype(fontDir, 64)

# Add text to the image
draw.text(position, text2, font=font, fill=(10, 10, 10))

# Save or display the modified image
image.save(name_png)

# ----------- step 3 ------------
# Import the audio(Insert to location of your audio instead of audioClip.mp3)
audio = AudioFileClip(name_mp3)
# Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
clip = ImageClip(name_png, duration=audio.duration)
# Set the audio of the clip
clip = clip.with_audio(audio)
# Export the clip
clip=clip.with_effects([vfx.Resize(width=1280)])

clip.write_videofile(name_mp4, fps=10)

# ----------- step 4 ------------

p1 = '01:02:09.03'
p2 = '01:03:08.04'
p3 = '01:03:57.07'
p4 = '01:05:15.04'
p5 = '01:06:14.08'
p6 = '01:07:03.08'
p7 = '01:08:21.07'
p8 = '01:09:20.09'
p9 = '01:10:10.01'

startA = convert_to_seconds(p1)-3
endA = convert_to_seconds(p3)+3
startB = convert_to_seconds(p4)-3
endB = convert_to_seconds(p6)+3
startC = convert_to_seconds(p7)-3
endC = convert_to_seconds(p9)+3

def replace_with_png(srcmp4, start, end, pngfile):

    audio = VideoFileClip(srcmp4).subclipped(start, end).audio
    # Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
    clip = ImageClip(pngfile, duration=audio.duration)
    # Set the audio of the clip
    clip = clip.with_audio(audio)
    # Export the clip
    clip=clip.with_effects([vfx.Resize(width=1280)])
    return clip
    
tmp_clip = concatenate_videoclips([
    VideoFileClip(srcVideo).subclipped(0, startA),
    replace_with_png(srcVideo, startA, endA, name_png),
    VideoFileClip(srcVideo).subclipped(endA, startB),
    replace_with_png(srcVideo, startB, endB, name_png),
    VideoFileClip(srcVideo).subclipped(endB, startC),
    replace_with_png(srcVideo, startC, endC, name_png),
    VideoFileClip(srcVideo).subclipped(endC)]
)

# vd0 = VideoFileClip(srcVideo)
vdn = VideoFileClip(name_mp4)

v1=tmp_clip.copy().subclipped(0, p1)
v2=tmp_clip.copy().subclipped(p1, p2)
v3=tmp_clip.copy().subclipped(p2, p3)
v4=tmp_clip.copy().subclipped(p3, p4)
v5=tmp_clip.copy().subclipped(p4, p5)
v6=tmp_clip.copy().subclipped(p5, p6)
v7=tmp_clip.copy().subclipped(p6, p7)
v8=tmp_clip.copy().subclipped(p7, p8)
v9=tmp_clip.copy().subclipped(p8, p9)
v10=tmp_clip.copy().subclipped(p9)

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

final_clip.write_videofile('./zhunian-' + name_text + '.mp4', fps=10, threads=8)