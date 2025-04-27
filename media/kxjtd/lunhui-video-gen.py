from moviepy import *
import os

curr_dir = os.path.dirname(os.path.realpath(__file__))
image_file=os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片6.PNG")

clips = []

faxin_video = VideoFileClip(os.path.join(curr_dir, "发菩提心.webm"), target_resolution=(1280, 720))
ruzuo_video = VideoFileClip(os.path.join(curr_dir, "00入坐2025v1.mp4"), target_resolution=(1280, 720))
niansong_list1 = {
    os.path.join(curr_dir, "1.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片6.PNG"),
    os.path.join(curr_dir, "2.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片7.PNG"),
    os.path.join(curr_dir, "3.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片8.PNG")
}

dazuo_list = {
    os.path.join(curr_dir, "5min-silence.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片1.PNG"),
    os.path.join(curr_dir, "1min-silence.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片2.PNG")
}

niansong_list2 = {
    os.path.join(curr_dir, "7.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片17.PNG"),
    os.path.join(curr_dir, "8-1.m4a"): os.path.join(curr_dir, "前行念诵仪轨藏中对照版2025-colored", "幻灯片18.PNG")
}

chuzuo_video = VideoFileClip(os.path.join(curr_dir, "10-出坐.mp4"), target_resolution=(1280, 720))

clips.append(faxin_video)
clips.append(ruzuo_video)

for key in niansong_list1:
    print(key, niansong_list1[key])
    audio = AudioFileClip(key)
    image_file = niansong_list1[key]
    # Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
    clip = ImageClip(image_file, duration=audio.duration)
    # Set the audio of the clip
    clip = clip.with_audio(audio)
    # Export the clip
    clip=clip.with_effects([vfx.Resize(width=1280)])
    clips.append(clip)

for key in dazuo_list:
    print(key, dazuo_list[key])
    audio = AudioFileClip(key)
    image_file = dazuo_list[key]
    # Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
    clip = ImageClip(image_file, duration=audio.duration)
    # Set the audio of the clip
    clip = clip.with_audio(audio)
    # Export the clip
    clip=clip.with_effects([vfx.Resize(width=1280)])
    clips.append(clip)

for key in niansong_list2:
    print(key, niansong_list2[key])
    audio = AudioFileClip(key)
    image_file = niansong_list2[key]
    # Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
    clip = ImageClip(image_file, duration=audio.duration)
    # Set the audio of the clip
    clip = clip.with_audio(audio)
    # Export the clip
    clip=clip.with_effects([vfx.Resize(width=1280)])
    clips.append(clip)

clips.append(chuzuo_video)

final_clip = concatenate_videoclips(clips)

final_clip.write_videofile('./lunhui.mp4', fps=10, threads=8)