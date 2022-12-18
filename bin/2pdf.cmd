echo "Install miktex first"
echo "choco install miktex"
echo "--- `date` $1 ---"
pandoc %1 -s ^
    -V CJKmainfont="YouYuan" ^
    --toc --number-section  ^
    -H %~dp0\pdf-options.sty ^
    --pdf-engine=xelatex ^
    --lua-filter %~dp0\count-para.lua ^
    --verbose ^
    -o %1.pdf

echo "--- `date` %cd%\%1.pdf done. ---" 
echo ""