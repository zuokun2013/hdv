echo "--- `date` $1 ---"
pandoc %1 -s ^
    -V CJKmainfont="KaiTi" ^
    --toc --number-section  ^
    -H pdf-options.sty ^
    --pdf-engine=xelatex ^
    --lua-filter count-para.lua ^
    --verbose ^
    -o %1.pdf

echo "--- `date` %1 done. ---" 
echo ""