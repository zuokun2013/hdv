from moviepy import *
import os

curr_dir = os.path.dirname(os.path.realpath(__file__))
clips = []

faxin_video = VideoFileClip(os.path.join(curr_dir,"发菩提心.webm"), target_resolution=(1280, 720))
ruzuo_video = VideoFileClip(os.path.join(curr_dir,"00入坐2025v1.mp4"), target_resolution=(1280, 720))

niansong_list1 = [
    ["1.m4a", "幻灯片6.PNG"],
    ["2.m4a", "幻灯片7.PNG"],
    ["3.m4a", "幻灯片8.PNG"],
    ["4.m4a", "幻灯片9.PNG"]
]

dazuo_list = [
    ["5min-silence.m4a", "幻灯片1.PNG"],
    ["5min-silence.m4a", "幻灯片1.PNG"],
    ["ding-126626.mp3", "幻灯片1.PNG"],
    ["ding-101492.mp3", "幻灯片2.PNG"],
    ["1min-silence.m4a", "幻灯片2.PNG"],
    ["1min-silence.m4a", "幻灯片2.PNG"],
    ["ding-126626.mp3", "幻灯片1.PNG"]
    ]


niansong_list2 = [
    ["ding-126626.mp3", "幻灯片1.PNG"],
    ["ding-126626.mp3", "幻灯片1.PNG"],
    ["5-1.m4a", "幻灯片10.PNG"],
    ["5-2.m4a", "幻灯片11.PNG"],
    ["5-3.m4a", "幻灯片12.PNG"],
    ["6-1.m4a", "幻灯片13.PNG"],
    ["6-2.m4a", "幻灯片14.PNG"],
    ["7.m4a", "幻灯片15.PNG"],
    ["8-1.m4a", "幻灯片16.PNG"],
    ["8-2.m4a", "幻灯片17.PNG"],
    ["8-3.m4a", "幻灯片18.PNG"],
    ["8-4.m4a", "幻灯片19.PNG"],
    ["8-5.m4a", "幻灯片20.PNG"],
    ["9-1.m4a", "幻灯片21.PNG"],
    ["9-2.m4a", "幻灯片22.PNG"],
    ["9-3.m4a", "幻灯片23.PNG"],
    ["9-4.m4a", "幻灯片24.PNG"],
    ["9-5.m4a", "幻灯片25.PNG"],
    ["9-6.m4a", "幻灯片26.PNG"],
    ["9-7.m4a", "幻灯片27.PNG"],
    ["9-8.m4a", "幻灯片28.PNG"],
    ["9-9.m4a", "幻灯片29.PNG"],
    ["9-10.m4a", "幻灯片30.PNG"]
    ]


# media/kxjtd/前行念诵仪轨藏中对照版2025-colored

chuzuo_video = VideoFileClip(os.path.join(curr_dir,"10-出坐.mp4"), target_resolution=(1280, 720))

def append_audio_list(audio_list):
    for audio_img_pair in audio_list:
        print(audio_img_pair[0], audio_img_pair[1])

        audio = AudioFileClip(os.path.join(curr_dir,audio_img_pair[0]))
        image_file = audio_img_pair[1]
        # Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
        clip = ImageClip(os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", image_file), duration=audio.duration)
        # Set the audio of the clip
        clip = clip.with_audio(audio)
        # Export the clip
        clip=clip.with_effects([vfx.Resize(width=1280)])
        clips.append(clip)

clips.append(faxin_video)
clips.append(ruzuo_video)

append_audio_list(niansong_list1)

for i in range(4):
    append_audio_list(dazuo_list)

append_audio_list(niansong_list2)

clips.append(chuzuo_video)

final_clip = concatenate_videoclips(clips)
final_clip.write_videofile('./lunhui-1h.mp4', fps=10, threads=8)