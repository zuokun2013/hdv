echo "Install miktex first"
echo "choco install miktex"


for /R %f in (.\*.md) do ( pandoc %f -s ^
    -V CJKmainfont="YouYuan" ^
    --toc --number-section  ^
    -H %~dp0\pdf-options.sty ^
    --pdf-engine=xelatex ^
    --lua-filter %~dp0\count-para.lua ^
    --verbose ^
    -o %f.pdf)


echo ""