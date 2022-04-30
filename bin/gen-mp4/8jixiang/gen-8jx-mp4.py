#pip install scipy
# pip install scipy
#pip install Pygame
#choco upgrade imagemagick -y

# https://pypi.org/project/pysub-parser/
# pip install pysub-parser
# pip install movipy

import os
import time
from datetime import time

import numpy as np
from moviepy.editor import *
from moviepy.video.tools.segmenting import findObjects
from pysubparser import parser

dir_path = os.path.dirname(os.path.realpath(__file__)) + '\\'

subtitle_file = dir_path +'8吉祥.kdenlive.srt'
audio_file = dir_path +"8吉祥.ogg"
output_file = dir_path +'8吉祥.mp4'

screensize = (720, 460)

allclips = []

subtitles = parser.parse(subtitle_file)

#for subtitle in subtitles:
for index, subtitle in enumerate(subtitles, start=1):
    print(f'{subtitle.start} > {subtitle.end}')
    print(subtitle.duration / 1000)
    print(subtitle.lines)
    #print(f'ffplay -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    #os.system(f'ffplay -nodisp -ss {subtitle.start}  -t {subtitle.duration / 1000} -autoexit  "C:\\Users\\zuoku\\Downloads\\A076-有声书《心性休息》\\《心性休息》颂词 朗诵版01.mp3"')
    print()

    sbtt_0 = """
    {}
    """.format("\n".join(subtitle.lines[0:])) + "\n(" + str(index) + ")"

    sbtt = sbtt_0.lstrip()
    print(sbtt)

# >>> TextClip.list('font')
# ['Agency-FB', 'Agency-FB-Bold', 'Alef-Bold', 'Alef-Regular', 'Algerian', 'Amiri', 'Amiri-Bold', 'Amiri-Bold-Slanted', 'Amiri-Quran', 'Amiri-Slanted', 'Arial', 'Arial-Black', 'Arial-Bold', 'Arial-Bold-Italic', 'Arial-Italic', 'Arial-Narrow', 'Arial-Narrow-Bold', 'Arial-Narrow-Bold-Italic', 'Arial-Narrow-Italic', 'Arial-Rounded-MT-Bold', 'Bahnschrift', 'Baskerville-Old-Face', 'Bauhaus-93', 'Bell-MT', 'Bell-MT-Bold', 'Bell-MT-Italic', 'Berlin-Sans-FB', 'Berlin-Sans-FB-Bold', 'Berlin-Sans-FB-Demi-Bold', 'Bernard-MT-Condensed', 'Blackadder-ITC', 'Bodoni-MT', 'Bodoni-MT-Black', 'Bodoni-MT-Black-Italic', 'Bodoni-MT-Bold', 'Bodoni-MT-Bold-Italic', 'Bodoni-MT-Condensed', 'Bodoni-MT-Condensed-Bold', 'Bodoni-MT-Condensed-Bold-Italic', 'Bodoni-MT-Condensed-Italic', 'Bodoni-MT-Italic', 'Bodoni-MT-Poster-Compressed', 'Book-Antiqua', 'Book-Antiqua-Bold', 'Book-Antiqua-Bold-Italic', 'Book-Antiqua-Italic', 'Bookman-Old-Style', 'Bookman-Old-Style-Bold', 'Bookman-Old-Style-Bold-Italic', 'Bookman-Old-Style-Italic', 'Bookshelf-Symbol-7', 'Bradley-Hand-ITC', 'Britannic-Bold', 'Broadway', 'Brush-Script-MT-Italic', 'Caladea', 'Caladea-Bold', 'Caladea-Bold-Italic', 'Caladea-Italic', 'Calibri', 'Calibri-Bold', 'Calibri-Bold-Italic', 'Calibri-Italic', 'Calibri-Light', 'Calibri-Light-Italic', 'Californian-FB', 'Californian-FB-Bold', 'Californian-FB-Italic', 'Calisto-MT', 'Calisto-MT-Bold', 'Calisto-MT-Bold-Italic', 'Calisto-MT-Italic', 'Cambria-&-Cambria-Math', 'Cambria-Bold', 'Cambria-Bold-Italic', 'Cambria-Italic', 'Candara', 'Candara-Bold', 'Candara-Bold-Italic', 'Candara-Italic', 'Candara-Light', 'Candara-Light-Italic', 'Carlito', 'Carlito-Bold', 'Carlito-Bold-Italic', 'Carlito-Italic', 'Castellar', 'Centaur', 'Century', 'Century-Gothic', 'Century-Gothic-Bold', 'Century-Gothic-Bold-Italic', 'Century-Gothic-Italic', 'Century-Schoolbook', 'Century-Schoolbook-Bold', 'Century-Schoolbook-Bold-Italic', 'Century-Schoolbook-Italic', 'Chiller', 'Colonna-MT', 'Comic-Sans-MS', 'Comic-Sans-MS-Bold', 'Comic-Sans-MS-Bold-Italic', 'Comic-Sans-MS-Italic', 'Consolas', 'Consolas-Bold', 'Consolas-Bold-Italic', 'Consolas-Italic', 'Constantia', 'Constantia-Bold', 'Constantia-Bold-Italic', 'Constantia-Italic', 'Cooper-Black', 
# 'Copperplate-Gothic-Bold', 'Copperplate-Gothic-Light', 'Corbel', 'Corbel-Bold', 'Corbel-Bold-Italic', 'Corbel-Italic', 'Corbel-Light', 'Corbel-Light-Italic', 'Courier-New', 'Courier-New-Bold', 'Courier-New-Bold-Italic', 'Courier-New-Italic', 'Curlz-MT', 'David-CLM-Bold', 'David-CLM-Bold-Italic', 'David-CLM-Medium', 'David-CLM-Medium-Italic', 'David-Libre-Bold', 'David-Libre-Regular', 'DejaVu-Sans', 'DejaVu-Sans-Bold', 'DejaVu-Sans-Bold-Oblique', 'DejaVu-Sans-Condensed', 'DejaVu-Sans-Condensed-Bold', 'DejaVu-Sans-Condensed-Bold-Oblique', 'DejaVu-Sans-Condensed-Oblique', 'DejaVu-Sans-ExtraLight', 'DejaVu-Sans-Mono', 'DejaVu-Sans-Mono-Bold', 'DejaVu-Sans-Mono-Bold-Oblique', 'DejaVu-Sans-Mono-Oblique', 'DejaVu-Sans-Oblique', 'DejaVu-Serif', 'DejaVu-Serif-Bold', 'DejaVu-Serif-Bold-Italic', 'DejaVu-Serif-Condensed', 'DejaVu-Serif-Condensed-Bold', 'DejaVu-Serif-Condensed-Bold-Italic', 'DejaVu-Serif-Condensed-Italic', 'DejaVu-Serif-Italic', 'DejaVuMathTeXGyre-Regular', 'DengXian', 'DengXian-Bold', 'DengXian-Light', 'Dubai-Bold', 'Dubai-Light', 'Dubai-Medium', 'Dubai-Regular', 'Ebrima', 'Ebrima-Bold', 'Edwardian-Script-ITC', 'Elephant', 'Elephant-Italic', 'EmojiOne-Color-SVGinOT', 'Engravers-MT', 'Eras-Bold-ITC', 'Eras-Demi-ITC', 'Eras-Light-ITC', 'Eras-Medium-ITC', 'FangSong', 'Felix-Titling', 'Footlight-MT-Light', 'Forte', 'Frank-Ruehl-CLM-Bold', 'Frank-Ruehl-CLM-Bold-Oblique', 'Frank-Ruehl-CLM-Medium', 'Frank-Ruehl-CLM-Medium-Oblique', 'Frank-Ruhl-Hofshi-Bold', 
# 'Franklin-Gothic-Book', 'Franklin-Gothic-Book-Italic', 'Franklin-Gothic-Demi', 'Franklin-Gothic-Demi-Cond', 'Franklin-Gothic-Demi-Italic', 'Franklin-Gothic-Heavy', 'Franklin-Gothic-Heavy-Italic', 'Franklin-Gothic-Medium', 'Franklin-Gothic-Medium-Cond', 'Franklin-Gothic-Medium-Italic', 'FrankRuhlHofshi-Regular', 'Freestyle-Script', 'French-Script-MT', 'FZShuTi', 'FZYaoTi', 'Gabriola', 'Gadugi', 'Gadugi-Bold', 'Garamond', 'Garamond-Bold', 'Garamond-Italic', 'Gentium-Basic', 'Gentium-Basic-Bold', 'Gentium-Basic-Bold-Italic', 'Gentium-Basic-Italic', 'Gentium-Book-Basic', 'Gentium-Book-Basic-Bold', 'Gentium-Book-Basic-Bold-Italic', 'Gentium-Book-Basic-Italic', 'Georgia', 'Georgia-Bold', 'Georgia-Bold-Italic', 'Georgia-Italic', 'Gigi', 
# 'Gill-Sans-MT', 'Gill-Sans-MT-Bold', 'Gill-Sans-MT-Bold-Italic', 'Gill-Sans-MT-Condensed', 'Gill-Sans-MT-Ext-Condensed-Bold', 'Gill-Sans-MT-Italic', 'Gill-Sans-Ultra-Bold', 'Gill-Sans-Ultra-Bold-Condensed', 'Gloucester-MT-Extra-Condensed', 'Goudy-Old-Style', 'Goudy-Old-Style-Bold', 'Goudy-Old-Style-Italic', 'Goudy-Stout', 'Haettenschweiler', 'Harlow-Solid-Italic', 'Harrington', 'High-Tower-Text', 'High-Tower-Text-Italic', 'Holo-MDL2-Assets', 'Impact', 'Imprint-MT-Shadow', 'Informal-Roman', 'Ink-Free', 'Javanese-Text', 'Jokerman', 'Juice-ITC', 'KacstBook', 'KacstOffice', 'KaiTi', 'Kristen-ITC', 'Kunstler-Script', 'Leelawadee', 'Leelawadee-Bold', 'Leelawadee-UI', 'Leelawadee-UI-Bold', 'Leelawadee-UI-Semilight', 'Liberation-Mono', 'Liberation-Mono-Bold', 'Liberation-Mono-Bold-Italic', 'Liberation-Mono-Italic', 'Liberation-Sans', 'Liberation-Sans-Bold', 'Liberation-Sans-Bold-Italic', 'Liberation-Sans-Italic', 'Liberation-Sans-Narrow', 'Liberation-Sans-Narrow-Bold', 'Liberation-Sans-Narrow-Bold-Italic', 'Liberation-Sans-Narrow-Italic', 'Liberation-Serif', 'Liberation-Serif-Bold', 'Liberation-Serif-Bold-Italic', 'Liberation-Serif-Italic', 'Linux-Biolinum-G-Bold', 'Linux-Biolinum-G-Italic', 'Linux-Biolinum-G-Regular', 'Linux-Libertine-G-Bold', 'Linux-Libertine-G-Bold-Italic', 'Linux-Libertine-G-Display-Regular', 'Linux-Libertine-G-Italic', 'Linux-Libertine-G-Regular', 'Linux-Libertine-G-Semibold', 'Linux-Libertine-G-Semibold-Italic', 'LiSu', 'Lucida-Bright', 'Lucida-Bright-Demibold', 'Lucida-Bright-Demibold-Italic', 'Lucida-Bright-Italic', 'Lucida-Calligraphy-Italic', 'Lucida-Console', 'Lucida-Fax-Demibold', 'Lucida-Fax-Demibold-Italic', 'Lucida-Fax-Italic', 'Lucida-Fax-Regular', 'Lucida-Handwriting-Italic', 'Lucida-Sans-Demibold-Italic', 'Lucida-Sans-Demibold-Roman', 'Lucida-Sans-Italic', 'Lucida-Sans-Regular', 'Lucida-Sans-Typewriter-Bold', 'Lucida-Sans-Typewriter-Bold-Oblique', 'Lucida-Sans-Typewriter-Oblique', 'Lucida-Sans-Typewriter-Regular', 'Lucida-Sans-Unicode', 'Magneto-Bold', 'Maiandra-GD', 'Malgun-Gothic', 'Malgun-Gothic-Bold', 'Malgun-Gothic-SemiLight', 'Matura-MT-Script-Capitals', 'Microsoft-Himalaya', 'Microsoft-JhengHei-&-Microsoft-JhengHei-UI', 'Microsoft-JhengHei-Bold-&-Microsoft-JhengHei-UI-Bold', 'Microsoft-JhengHei-Light-&-Microsoft-JhengHei-UI-Light', 'Microsoft-New-Tai-Lue', 'Microsoft-New-Tai-Lue-Bold', 'Microsoft-PhagsPa', 'Microsoft-PhagsPa-Bold', 'Microsoft-Sans-Serif', 'Microsoft-Tai-Le', 'Microsoft-Tai-Le-Bold', 'Microsoft-Uighur', 'Microsoft-Uighur-Bold', 'Microsoft-YaHei-&-Microsoft-YaHei-UI', 'Microsoft-YaHei-Bold-&-Microsoft-YaHei-UI-Bold', 'Microsoft-YaHei-Light-&-Microsoft-YaHei-UI-Light', 
# 'Microsoft-Yi-Baiti', 'MingLiU-ExtB-&-PMingLiU-ExtB-&-MingLiU_HKSCS-ExtB', 'Miriam-CLM-Bold', 'Miriam-CLM-Book', 'Miriam-Libre-Bold', 'Miriam-Mono-CLM-Bold', 'Miriam-Mono-CLM-Bold-Oblique', 'Miriam-Mono-CLM-Book', 'Miriam-Mono-CLM-Book-Oblique', 'MiriamLibre-Regular', 'Mistral', 'Modern-No.-20', 'Mongolian-Baiti', 'Monotype-Corsiva', 'MS-Gothic-&-MS-UI-Gothic-&-MS-PGothic', 'MS-Outlook', 'MS-Reference-Sans-Serif', 'MS-Reference-Specialty', 
# 'MT-Extra', 'MV-Boli', 'Myanmar-Text', 'Myanmar-Text-Bold', 'Nachlieli-CLM-Bold', 'Nachlieli-CLM-Bold-Oblique', 'Nachlieli-CLM-Light', 'Nachlieli-CLM-Light-Oblique', 'Niagara-Engraved', 'Niagara-Solid', 'Nirmala-UI', 'Nirmala-UI-Bold', 'Nirmala-UI-Semilight', 'Noto-Kufi-Arabic', 'Noto-Kufi-Arabic-Bold', 'Noto-Mono', 'Noto-Naskh-Arabic', 'Noto-Naskh-Arabic-Bold', 'Noto-Naskh-Arabic-UI', 'Noto-Naskh-Arabic-UI-Bold', 'Noto-Sans-Arabic-Bold', 'Noto-Sans-Arabic-Regular', 'Noto-Sans-Arabic-UI-Bold', 'Noto-Sans-Arabic-UI-Regular', 'Noto-Sans-Armenian-Bold', 'Noto-Sans-Armenian-Regular', 'Noto-Sans-Bold', 'Noto-Sans-Bold-Italic', 'Noto-Sans-Condensed', 'Noto-Sans-Condensed-Bold', 'Noto-Sans-Condensed-Bold-Italic', 'Noto-Sans-Condensed-Italic', 'Noto-Sans-Georgian-Bold', 'Noto-Sans-Georgian-Regular', 'Noto-Sans-Hebrew-Bold', 'Noto-Sans-Hebrew-Regular', 'Noto-Sans-Italic', 'Noto-Sans-Lao-Bold', 'Noto-Sans-Lao-Regular', 'Noto-Sans-Light', 'Noto-Sans-Light-Italic', 'Noto-Sans-Lisu-Regular', 'Noto-Sans-Regular', 'Noto-Serif-Armenian-Bold', 'Noto-Serif-Armenian-Regular', 'Noto-Serif-Bold', 'Noto-Serif-Bold-Italic', 'Noto-Serif-Condensed', 'Noto-Serif-Condensed-Bold', 'Noto-Serif-Condensed-Bold-Italic', 'Noto-Serif-Condensed-Italic', 'Noto-Serif-Georgian-Bold', 'Noto-Serif-Georgian-Regular', 'Noto-Serif-Hebrew-Bold', 'Noto-Serif-Hebrew-Regular', 'Noto-Serif-Italic', 'Noto-Serif-Lao-Bold', 'Noto-Serif-Lao-Regular', 'Noto-Serif-Light', 'Noto-Serif-Light-Italic', 'Noto-Serif-Regular', 'OCR-A-Extended', 'Old-English-Text-MT', 'Onyx', 'OpenSymbol', 'Palace-Script-MT', 'Palatino-Linotype', 'Palatino-Linotype-Bold', 'Palatino-Linotype-Bold-Italic', 'Palatino-Linotype-Italic', 'Papyrus', 'Parchment', 'Perpetua', 'Perpetua-Bold', 'Perpetua-Bold-Italic', 'Perpetua-Italic', 'Perpetua-Titling-MT-Bold', 'Perpetua-Titling-MT-Light', 'Playbill', 'Poor-Richard', 'Pristina', 'Rage-Italic', 'Ravie', 'Reem-Kufi-Regular', 'Rockwell', 'Rockwell-Bold', 'Rockwell-Bold-Italic', 'Rockwell-Condensed', 'Rockwell-Condensed-Bold', 'Rockwell-Extra-Bold', 'Rockwell-Italic', 'Rubik-Bold', 'Rubik-Bold-Italic', 'Rubik-Italic', 'Rubik-Regular', 'Scheherazade', 'Scheherazade-Bold', 'Script-MT-Bold', 'Segoe-MDL2-Assets', 'Segoe-Print', 'Segoe-Print-Bold', 'Segoe-Script', 'Segoe-Script-Bold', 'Segoe-UI', 'Segoe-UI-Black', 'Segoe-UI-Black-Italic', 'Segoe-UI-Bold', 'Segoe-UI-Bold-Italic', 'Segoe-UI-Emoji', 'Segoe-UI-Historic', 'Segoe-UI-Italic', 'Segoe-UI-Light', 'Segoe-UI-Light-Italic', 'Segoe-UI-Semibold', 'Segoe-UI-Semibold-Italic', 'Segoe-UI-Semilight', 'Segoe-UI-Semilight-Italic', 'Segoe-UI-Symbol', 'Showcard-Gothic', 'SimHei', 'SimSun-&-NSimSun', 'SimSun-ExtB', 'Sitka-Small-&-Sitka-Text-&-Sitka-Subheading-&-Sitka-Heading-&-Sitka-Display-&-Sitka-Banner', 'Sitka-Small-Bold-&-Sitka-Text-Bold-&-Sitka-Subheading-Bold-&-Sitka-Heading-Bold-&-Sitka-Display-Bold-&-Sitka-Banner-Bold', 'Sitka-Small-Bold-Italic-&-Sitka-Text-Bold-Italic-&-Sitka-Subheading-Bold-Italic-&-Sitka-Heading-Bold-Italic-&-Sitka-Display-Bold-Italic-&-Sitka-Banner-Bold-Italic', 'Sitka-Small-Italic-&-Sitka-Text-Italic-&-Sitka-Subheading-Italic-&-Sitka-Heading-Italic-&-Sitka-Display-Italic-&-Sitka-Banner-Italic', 'Snap-ITC', 'Source-Code-Pro', 'Source-Code-Pro-Black', 'Source-Code-Pro-Black-Italic', 'Source-Code-Pro-Bold', 'Source-Code-Pro-Bold-Italic', 'Source-Code-Pro-ExtraLight', 'Source-Code-Pro-ExtraLight-Italic', 'Source-Code-Pro-Italic', 'Source-Code-Pro-Light', 'Source-Code-Pro-Light-Italic', 'Source-Code-Pro-Medium', 'Source-Code-Pro-Medium-Italic', 'Source-Code-Pro-Semibold', 'Source-Code-Pro-Semibold-Italic', 'Source-Sans-Pro', 'Source-Sans-Pro-Black', 'Source-Sans-Pro-Black-Italic', 'Source-Sans-Pro-Bold', 'Source-Sans-Pro-Bold-Italic', 'Source-Sans-Pro-ExtraLight', 'Source-Sans-Pro-ExtraLight-Italic', 'Source-Sans-Pro-Italic', 'Source-Sans-Pro-Light', 'Source-Sans-Pro-Light-Italic', 'Source-Sans-Pro-Semibold', 'Source-Sans-Pro-Semibold-Italic', 'Source-Serif-Pro', 'Source-Serif-Pro-Black', 'Source-Serif-Pro-Black-Italic', 'Source-Serif-Pro-Bold', 'Source-Serif-Pro-Bold-Italic', 'Source-Serif-Pro-ExtraLight', 'Source-Serif-Pro-ExtraLight-Italic', 'Source-Serif-Pro-Italic', 'Source-Serif-Pro-Light', 'Source-Serif-Pro-Light-Italic', 'Source-Serif-Pro-Semibold', 'Source-Serif-Pro-Semibold-Italic', 'STCaiyun', 'Stencil', 'STFangsong', 'STHupo', 'STKaiti', 'STLiti', 'STSong', 'STXihei', 'STXingkai', 'STXinwei', 'STZhongsong', 'Sylfaen', 'Symbol', 'Tahoma', 'Tahoma-Bold', 'Tempus-Sans-ITC', 'Times-New-Roman', 'Times-New-Roman-Bold', 'Times-New-Roman-Bold-Italic', 'Times-New-Roman-Italic', 'Trebuchet-MS', 'Trebuchet-MS-Bold', 'Trebuchet-MS-Bold-Italic', 'Trebuchet-MS-Italic', 'Tw-Cen-MT', 'Tw-Cen-MT-Bold', 'Tw-Cen-MT-Bold-Italic', 'Tw-Cen-MT-Condensed', 'Tw-Cen-MT-Condensed-Bold', 'Tw-Cen-MT-Condensed-Extra-Bold', 'Tw-Cen-MT-Italic', 'Verdana', 'Verdana-Bold', 'Verdana-Bold-Italic', 'Verdana-Italic', 'Viner-Hand-ITC', 'Vivaldi-Italic', 'Vladimir-Script', 'Webdings', 'Wide-Latin', 'Wingdings', 'Wingdings-2', 'Wingdings-3', 'YouYuan', 'Yu-Gothic-Bold-&-Yu-Gothic-UI-Semibold-&-Yu-Gothic-UI-Bold', 'Yu-Gothic-Light-&-Yu-Gothic-UI-Light', 'Yu-Gothic-Medium-&-Yu-Gothic-UI-Regular', 'Yu-Gothic-Regular-&-Yu-Gothic-UI-Semilight']
    audioclip2 = AudioFileClip(audio_file).subclip(subtitle.start.isoformat(),
                                                   subtitle.end.isoformat())
    txtclip = TextClip(sbtt,
                       color='white',
                       font="YouYuan",
                       fontsize=36,
                       kerning=-2,
                       interline=-1,
                       bg_color='blue',
                       size=screensize).set_duration(audioclip2.duration)
    #txtclip.set_duration(audioclip2.duration)
    subclip = txtclip.set_audio(audioclip2)

    txtclip2 = TextClip(sbtt,
                        color='white',
                        font="YouYuan",
                        fontsize=36,
                        kerning=-2,
                        interline=-1,
                        bg_color='blue',
                        size=screensize).set_duration(60)

    # subclip.preview()
    #time.sleep(9)
    allclips.append(subclip)
    # allclips.append(txtclip2)
    # allclips.append(subclip)
    # allclips.append(txtclip2)


fclip = concatenate_videoclips(allclips)
fclip.write_videofile(output_file, fps=10, codec='mpeg4')