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

def print_sunrise_solornoon(timeanddate_city_url):
    print ('--------------------------------------------')
    print (timeanddate_city_url)
    page = requests.get(timeanddate_city_url)
    df_list = pd.read_html(page.content,attrs = {'id': 'as-monthsun'})

    #print (df_list[0].columns)
    # astronomy
    #print (df_list[0].iloc[:, [0,1,5]])

    #sun
    print (df_list[0].iloc[:, [0,1,11]])
    print ('--------------------------------------------')

print_sunrise_solornoon('https://www.timeanddate.com/sun/canada/vancouver')
print_sunrise_solornoon('https://www.timeanddate.com/sun/canada/ottawa')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/beijing')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/guangzhou')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/shanghai')
print_sunrise_solornoon('https://www.timeanddate.com/sun/china/chengdu')

