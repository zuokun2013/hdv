echo "Install miktex first"
echo "choco install miktex"


Get-ChildItem –Path "." -Recurse -Filter *.md | Foreach-Object {  pandoc $_.FullName  -s --toc --number-section  --toc-depth=6 --output $_.FullName.replace(".md",".pdf") -V CJKmainfont="YouYuan" -N -Vsecnumdepth=6 --pdf-engine=xelatex -H $PSScriptRoot\pdf-options.sty --lua-filter $PSScriptRoot\count-para.lua }




echo ""