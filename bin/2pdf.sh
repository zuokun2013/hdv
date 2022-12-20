echo "--- `date` $1 ---"
pandoc $1 -s -f markdown \
    -V 'CJKmainfont:Yuanti SC' \
    --pdf-engine=xelatex --toc --number-section  \
    -H $(dirname $0)/pdf-options2.sty \
    --lua-filter $(dirname $0)/count-para.lua \
    -o $1.pdf

echo "--- `date` $1 done. ---" 
echo ""
