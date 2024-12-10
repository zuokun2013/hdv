from moviepy import *
# Import the audio(Insert to location of your audio instead of audioClip.mp3)
audio = AudioFileClip("name.mp3")
# Import the Image and set its duration same as the audio (Insert the location of your photo instead of photo.jpg)
clip = ImageClip("output.png", duration=audio.duration)
# Set the audio of the clip
clip = clip.with_audio(audio)
# Export the clip
clip=clip.with_effects([vfx.Resize(width=1280)])

clip.write_videofile("name.mp4", fps=10)