for file in *.md; 
do echo "$file";
pandoc $file -f markdown -s -V 'mainfont:DejaVu Sans' -V 'CJKmainfont:Yuanti SC Light' --pdf-engine=xelatex --toc --number-section  -o $file.pdf;
done