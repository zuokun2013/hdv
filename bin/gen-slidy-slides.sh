pandoc -t slidy --slide-level=1 --css my.css --toc --number-section -s $1 -o $1.html
echo "$1.html generated."