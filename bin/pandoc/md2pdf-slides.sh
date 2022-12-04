echo "--- `date` $1 ---"
pandoc $1 -f markdown -s \
    -V 'mainfont:NotoSansSC-Regular.otf' \
    -V 'CJKmainfont:NotoSansSC-Regular.otf' \
     --toc --number-section   \
    --pdf-engine=/usr/local/texlive/2022basic/bin/universal-darwin/xelatex \
    -H $(dirname $0)/opt.sty \
    -o $1.pdf

echo "--- `date` $1 done. ---" 
echo ""
