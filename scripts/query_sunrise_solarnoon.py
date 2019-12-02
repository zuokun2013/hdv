from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
from collections import OrderedDict
from lxml import html
#from lxml import etree
import json
import requests
import lxml.html as lh
import pandas as pd
import base64
import pdfkit as pdf

def print_sunrise_solornoon(timeanddate_city_url):
    if timeanddate_city_url.find('/'):
        fname = timeanddate_city_url.rsplit('/', 1)[1]
    else:
        fname = base64.b64encode(timeanddate_city_url)

    
    
    print ('--------------------------------------------')
    print (timeanddate_city_url)
    page = requests.get(timeanddate_city_url)
    df_list = pd.read_html(page.content,attrs = {'id': 'as-monthsun'})

    #print (df_list[0].columns)
    # astronomy
    #print (df_list[0].iloc[:, [0,1,5]])

    #sun
    print (df_list[0].iloc[:, [0,1,11]].to_string())
    #df_list[0].iloc[:, [0,1,11]].to_html(fname + '.html',index=False)

    html = df_list[0].iloc[:, [0,1,11]].to_html(index=False)

    with open(fname + '.html', "w", encoding="utf-8") as file:
        file.writelines('<meta charset="UTF-8">\n')
        file.write(html)

    nazivFajla=fname + '.pdf'
    pdf.from_file(fname + '.html', nazivFajla)
    print ('--------------------------------------------')

print_sunrise_solornoon('https://www.timeanddate.com/sun/canada/vancouver')
print_sunrise_solornoon('https://www.timeanddate.com/sun/canada/ottawa')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/beijing')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/guangzhou')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/shanghai')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/chengdu')

