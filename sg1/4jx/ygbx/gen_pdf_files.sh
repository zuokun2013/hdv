cd $(dirname $0)

../../../bin/gen-pdfs.sh `pwd`

find . -path ./docs -prune -o -name "*_.md.pdf" -exec cp {} ./docs \;

