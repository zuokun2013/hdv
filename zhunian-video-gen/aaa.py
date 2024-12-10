from moviepy import TextClip

font = "/System/Library/Fonts/Supplemental/Arial.ttf"
txt_clip1 = TextClip(
    font = font,
    text="Hello World !",
    font_size=30,
    size=(500, 200),
    color="#FF0000",  # Red
    bg_color="#FFFFFF",
    duration=5,
)

txt_clip1.write_videofile("result1.mp4", fps=10)