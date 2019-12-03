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
from datetime import date
from dateutil.relativedelta import relativedelta

def print_sunrise_solarnoon(timeanddate_city_url):
    print ('--------------------------------------------')
    print (timeanddate_city_url)

    if timeanddate_city_url.find('/'):
        fname = timeanddate_city_url.rsplit('/', 1)[1]
        fname = fname.replace('?','_')
        fname = fname.replace('&','_')
    else:
        fname = base64.b64encode(timeanddate_city_url)

    with open(fname + '.html', "w", encoding="utf-8") as file:
        file.writelines('<meta charset="UTF-8">\n')

    for x in range(12):
        ts_month = date.today() + relativedelta(months=+x)
        url_month = ts_month.month
        url_year = ts_month.year
        # https://www.timeanddate.com/sun/hong-kong/hong-kong?month=12&year=2019
        full_url = timeanddate_city_url + '?month=' + str(url_month) + '&year=' + str(url_year)
    
        print (full_url)
        page = requests.get(full_url)
        df_list = pd.read_html(page.content,attrs = {'id': 'as-monthsun'})
        print (df_list[0].iloc[:, [0,1,11]].to_string())
    
        html = df_list[0].iloc[:, [0,1,11]].to_html(index=False)
        with open(fname + '.html', "a+", encoding="utf-8") as file:
            file.write(html)
    

    nazivFajla=fname + '.pdf'
    pdf.from_file(fname + '.html', nazivFajla)
    print ('--------------------------------------------')

print_sunrise_solarnoon('https://www.timeanddate.com/sun/canada/vancouver')
print_sunrise_solarnoon('https://www.timeanddate.com/sun/canada/ottawa')
print_sunrise_solarnoon('https://www.timeanddate.com/sun/china/beijing')
print_sunrise_solarnoon('https://www.timeanddate.com/sun/china/guangzhou')
print_sunrise_solarnoon('https://www.timeanddate.com/sun/china/shanghai')
print_sunrise_solarnoon('https://www.timeanddate.com/sun/china/chengdu')

print_sunrise_solarnoon('https://www.timeanddate.com/sun/hong-kong/hong-kong')

