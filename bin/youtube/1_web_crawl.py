# coding: utf-8
import requests
import codecs
from bs4 import BeautifulSoup


def build_upload_cmd(video_file):
    print (video_file)
    upload_cmd_part0 = 'hdenv/bin/python3 upload_video.py --file="'

    fname = video_file
    desc = fname.replace(".mp4", "")
    print ("filename=" + fname + ", desc=" + desc)

    upload_cmd = upload_cmd_part0 + fname + '" --title="' + desc + '" --description="' + desc + u'"  --keywords="慧灯之光,慧灯问道" --category="27" --privacyStatus="unlisted"'
    print (upload_cmd)
    return upload_cmd


def parse_page():

    headers = {
        'User-Agent': 'Mozilla/5.0',
        'From': 'youremail@domain.com'  # This is another valid field
    }

    url = 'https://www.huidengzhiguang.com/index.php/download/yinshipin?view=items&gid=13.1'
    url = 'https://www.huidengzhiguang.com/index.php/download/yinshipin?view=items&gid=13.9'

    page = requests.get(url, headers=headers)

    soup = BeautifulSoup(page.text, 'html.parser')

    # Remove bottom links
    #//*[@id="adminForm"]
    #adminForm > div.sb-content > div > div.bs-example > table
    ttt = soup.find(class_='bs-example')

    #print(ttt)

    mp4list = ttt.find_all('a')
    f= codecs.open("2_mp4_down.sh","w","utf-8")

    for artist_name in mp4list:
        href = artist_name.get('href')
        fname = href.split('=')[1]
        f.write('wget ' + artist_name.get('href') + ' -O ' + fname)
        f.write('\n')
        f.write(build_upload_cmd(fname))
        f.write('\n')
        f.write('\n')

    f.close


parse_page()

#build_upload_cmd (u'慧灯之光_《慧灯·问道》第一季之“放生篇”第2期_20170215.mp4'.encode('utf-8'))

