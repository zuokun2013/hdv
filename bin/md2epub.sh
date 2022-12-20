
pandoc $1 -f markdown \
    --lua-filter $(dirname $0)/count-para.lua \
    -o $1.epub

