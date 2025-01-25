import pymupdf

import json
import os

f = open('rxl-toc.json', 'r', encoding='utf-8')
data = json.load(f)
print(data)
print(data['filename'])

src = pymupdf.open(data['filename'])
doc = pymupdf.open()  # empty output PDF

for spage in src:  # for each page in input
    r = spage.rect  # input page rectangle
    print(r)
    print(spage.rotation)
    spage.remove_rotation()
    print(spage.rect )

    d = pymupdf.Rect(spage.cropbox_position,  # CropBox displacement if not
                  spage.cropbox_position)  # starting at (0, 0)
    #--------------------------------------------------------------------------
    # example: cut input page into 2 x 2 parts
    #--------------------------------------------------------------------------
    r1 = r / 2  # top left rect
    r2 = r1 + (r1.width, 0, r1.width, 0)  # top right rect
    r3 = r1 + (0, r1.height, 0, r1.height)  # bottom left rect
    r4 = pymupdf.Rect(r1.br, r.br)  # bottom right rect

    rl = pymupdf.Rect(0, 0, r.width/2, r.height  )
    rr = pymupdf.Rect(r.width / 2, 0,  r.width, r.height )
    
    print(rl)
    print(rr)
    rect_list = [rl, rr]
    # rect_list = [r1, r2, r3, r4]  # put them in a list

    for rx in rect_list:  # run thru rect list
        rx += d  # add the CropBox displacement
        page = doc.new_page(-1,  # new output page with rx dimensions
                           width = rx.width,
                           height = rx.height)
        page.show_pdf_page(
                page.rect,  # fill all new page with the image
                src,  # input document
                spage.number,  # input page number
                clip = rx,  # which part to use of input page
            )

toc = doc.get_toc()
for x,y in data['toc'].items():
    print(x, y+2)
    toc_item = [1, x, y+2]
    toc.append(toc_item)

doc.set_toc(toc)

# that's it, save output file
file_path = data['filename']

# Extract the file name without the extension
file_name = os.path.splitext(os.path.basename(file_path))[0]

outputfile = os.path.join('.', 'output',  file_name + '.pdf')

doc.save(outputfile,
         garbage=3,  # eliminate duplicate objects
         deflate=True,  # compress stuff where possible
)