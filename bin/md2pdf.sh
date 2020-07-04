pandoc $1 -f markdown -s \
    -V 'mainfont:DejaVu Sans' \
    -V 'CJKmainfont:Yuanti SC' \
    -V 'linkcolor:blue' \
    -V 'geometry:a5paper' \
    -V 'geometry:margin=1.2cm' \
    -V 'fontsize=12pt' \
    --pdf-engine=xelatex --toc --number-section  \
    -o $1.pdf