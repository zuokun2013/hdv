from moviepy import *
import os

vdn = VideoFileClip("./00入坐2025v1.mp4", target_resolution=(1280, 720))

curr_dir = os.path.dirname(os.path.realpath(__file__))
image_file=os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片6.PNG")

# ----------- step 3 ------------
# Import the audio(Insert to location of your audio instead of audioClip.mp3)
audio = AudioFileClip("1.m4a")
# Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
clip = ImageClip(image_file, duration=audio.duration)
# Set the audio of the clip
clip = clip.with_audio(audio)
# Export the clip
clip=clip.with_effects([vfx.Resize(width=1280)])

# clip.write_videofile(name_mp4, fps=10)


final_clip = concatenate_videoclips(
    [
        vdn, clip

    ]
)

final_clip.write_videofile('./lunhui.mp4', fps=10, threads=8)