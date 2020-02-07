
from bs4 import BeautifulSoup
import urllib.request

docurlbase = 'http://www.xianmifw.com/audio/index.php?do=content&id=102&p='
docsuffix = '.doc'

for num in range(1,14): 
    docurl = docurlbase + str(num)
    print(docurl)
    resp = urllib.request.urlopen(docurl)
    soup = BeautifulSoup(resp, from_encoding=resp.info().get_param('charset'), parser="lxml")

    for link in soup.find_all('a', href=True):
        if link['href'].endswith(docsuffix):
            print(link['href'])

            fileurl = link['href']
            filename = fileurl.split('/')[-1]
            urllib.request.urlretrieve(fileurl, filename)

