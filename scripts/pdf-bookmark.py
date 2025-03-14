from PyPDF2 import PdfReader, PdfWriter

import json
import os

with open('toc.json', 'r', encoding='utf-8') as f:
    # Opening JSON file
    # f = open('toc.json')
    data = json.load(f)

    print(data)
    print(data['filename'])

    reader = PdfReader(data['filename'])  # open input
    writer = PdfWriter()  # open output

    n = len(reader.pages)

    for i in range(n):
        writer.add_page(reader.pages[i])  # insert page


    for x,y in data['toc'].items():
        print(x, y+1)
        writer.add_outline_item(x, y+1, parent=None)

# Closing file



# File path
file_path = data['filename']

# Extract the file name without the extension
file_name = os.path.splitext(os.path.basename(file_path))[0]

outputfile = os.path.join('.', 'output',  file_name + '.pdf')
print(outputfile)  # Output: example

with open(outputfile, "wb") as fp:  # creating result pdf JCT
    writer.write(fp)  # writing to result pdf JCT

f.close()
fp.close()


# reader = PdfReader(r"C:\Users\zuoku\Downloads\加行班教材01.pdf")  # open input
# writer = PdfWriter()  # open output

# n = len(reader.pages)

# for i in range(n):
#     writer.add_page(reader.pages[i])  # insert page


# # add a bookmark on the first page
# writer.add_outline_item("目录", 0, parent=None)
# writer.add_outline_item("前行之重要性", 2, parent=None)
# writer.add_outline_item("《上师瑜伽速赐加持》修法仪轨", 21, parent=None)
# writer.add_outline_item("《上师瑜伽速赐加持》讲记", 23, parent=None)

# writer.add_outline_item("第001课", 34, parent=None)
# writer.add_outline_item("第002课", 50, parent=None)
# writer.add_outline_item("第003课", 68, parent=None)

# # add a bookmark on the sixth page
# # par = writer.add_outline_item("Second Bookmark", 5, parent=None)

# # add a child bookmark on the eighth page
# # writer.add_outline_item("Third Bookmark", 7, parent=par)

# with open("c:\\tmp\\result.pdf", "wb") as fp:  # creating result pdf JCT
#     writer.write(fp)  # writing to result pdf JCT
    
    