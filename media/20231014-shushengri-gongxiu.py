import os
import time
import datetime
 
realpath=os.path.abspath(__file__)
print(realpath)
os.chdir('c:/tmp/20230505')

# download files first
# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/a/恒常念诵愿文.mp3"')

# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/videos/课前念诵.mp4" ')
# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/videos/金刚七句-流畅版.mp4"')
# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/videos/普贤如来愿文.mp4"')

# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/videos/普贤如来愿文.mp4"')

# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/videos/普贤如来愿文.mp4"')


# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/v/4jx/暇满难得-上师念诵.mp4"')

# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/v/法王如意宝阿弥陀佛灌顶实录.mp4"')

# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/yigui/诸佛菩萨名号集-念诵仪轨.mp4"')
# os.system('wget -N  "https://f.huidengchanxiu.net/hdv/videos/回向(2021版).mp4"')

# 2 play files

os.system('mpv --fullscreen  "恒常念诵愿文.mp3"')

os.system('mpv --fullscreen  "课前念诵.mp4" ')
os.system('mpv --fullscreen  "金刚七句-流畅版.mp4"')
os.system('mpv --fullscreen  "C:/tmp/20230505/普贤王如来发愿文（贝诺法王唱诵）.mp4"')
time.sleep(3)

os.system('mpv --fullscreen  "C:/Users/zuoku/OneDrive/Desktop/轮回痛苦-上师念诵.mp4"')
time.sleep(3)
os.system('mpv --fullscreen  "普贤如来愿文.mp4"')
time.sleep(3)
# sleep 3 secs
now = datetime.datetime.now()
print(now)
print("休息5分钟。。。")
time.sleep(300)

os.system('mpv --fullscreen  "诸佛菩萨名号集-念诵仪轨.mp4"')

os.system('mpv --fullscreen  "C:/tmp/20230505/普贤王如来发愿文（贝诺法王唱诵）.mp4"')
time.sleep(3)

os.system('mpv --fullscreen  "回向(2021版).mp4"')

# os.system('mpv --fullscreen  "https://f.huidengchanxiu.net/hdv/a/%e6%81%92%e5%b8%b8%e5%bf%b5%e8%af%b5%e6%84%bf%e6%96%87.mp3"')
# os.system('mpv --fullscreen  ""')