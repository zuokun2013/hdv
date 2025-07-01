from moviepy import *
import os

curr_dir = os.path.dirname(os.path.realpath(__file__))
clips = []

faxin_video = VideoFileClip(os.path.join(curr_dir,"发菩提心.webm"), target_resolution=(1280, 720))
ruzuo_video = VideoFileClip(os.path.join(curr_dir,"00入坐2025v1.mp4"), target_resolution=(1280, 720))

niansong_list1 = [
    ["1.m4a", "Slide6.png"],
    ["2.m4a", "Slide7.png"],
    ["3.m4a", "Slide8.png"],
    ["4.m4a", "Slide9.png"]
]

dazuo_list = [
    ["1min-silence.m4a", "Slide1.png"],
    ["1min-silence.m4a", "Slide1.png"],
    ["ding-126626.mp3", "Slide1.png"],
    ["5min-silence.m4a", "Slide9.png"],
    ["5min-silence.m4a", "Slide9.png"],
    ["ding-126626.mp3", "Slide1.png"],
    ["ding-126626.mp3", "Slide1.png"]
    ]

niansong_list2 = [
    ["1min-silence.m4a", "Slide1.png"],
    ["1min-silence.m4a", "Slide1.png"],
    ["ding-126626.mp3", "Slide1.png"],
    ["5min-silence.m4a", "Slide9.png"],
    ["1min-silence.m4a", "Slide9.png"],
    ["ding-126626.mp3", "Slide1.png"],
    ["ding-126626.mp3", "Slide1.png"],

    ["ding-126626.mp3", "Slide1.png"],
    ["5-1.m4a", "Slide10.png"],
    ["5-2.m4a", "Slide11.png"],
    ["5-3.m4a", "Slide12.png"],
    ["6-1.m4a", "Slide13.png"],
    ["6-2.m4a", "Slide14.png"],
    ["7.m4a", "Slide15.png"],
    ["8-1.m4a", "Slide16.png"],
    ["8-2.m4a", "Slide17.png"],
    ["8-3.m4a", "Slide18.png"],
    ["8-4.m4a", "Slide19.png"],
    ["8-5.m4a", "Slide20.png"],
    ["9-1.m4a", "Slide21.png"],
    ["9-2.m4a", "Slide22.png"],
    ["9-3.m4a", "Slide23.png"],
    ["9-4.m4a", "Slide24.png"],
    ["9-5.m4a", "Slide25.png"],
    ["9-6.m4a", "Slide26.png"],
    ["9-7.m4a", "Slide27.png"],
    ["9-8.m4a", "Slide28.png"],
    ["9-9.m4a", "Slide29.png"],
    ["9-10.m4a", "Slide30.png"]
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

for i in range(3):
    append_audio_list(dazuo_list)

append_audio_list(niansong_list2)

clips.append(chuzuo_video)

final_clip = concatenate_videoclips(clips)
final_clip.write_videofile('./lunhui.mp4', fps=10, threads=8)