echo "--- $1 ---"
pandoc $1 -f markdown -s \
    -V 'mainfont:DejaVu Sans' \
    -V 'CJKmainfont:Yuanti SC' \
    -V 'linkcolor:blue' \
    -V 'geometry:a5paper' \
    -V 'geometry:margin=1.5cm' \
    -V 'fontsize=12pt' \
    --pdf-engine=xelatex --toc   \
    -o $1.pdf

echo `date`
echo "--- $1 done. ---" 
echo ""