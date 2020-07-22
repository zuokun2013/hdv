import requests
import codecs
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0',
    'From': 'youremail@domain.com'  # This is another valid field
}

url = 'https://www.huidengzhiguang.com/index.php/download/yinshipin?view=items&gid=13.1'

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

f.close


