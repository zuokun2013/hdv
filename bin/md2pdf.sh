echo "--- `date` $1 ---"
pandoc $1 -f markdown -s \
    -V 'mainfont:DejaVu Sans' \
    -V 'CJKmainfont:Yuanti SC' \
    -V 'linkcolor:blue' \
    -V 'geometry:a6paper' \
    -V 'geometry:margin=1.2cm' \
    --pdf-engine=xelatex --toc --number-section  \
    -H $(dirname $0)/options.sty \
    -o $1.pdf

echo "--- `date` $1 done. ---" 
echo ""