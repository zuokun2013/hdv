
# $inputDir="D:/hdcx/jmy/037-量理宝藏论/辅导-智诚堪布第1次讲解于2006至07年"
$inputDir="."

$outputDir="c:/tmp/Markdown"

# Ensure the output directory exists
if (not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Loop through all .docx files in the input directory
Get-ChildItem -Path $inputDir -Filter *.docx | ForEach-Object {
    $docxFile = $_.FullName
    $baseName = $_.BaseName
    $mdFile = Join-Path -Path $outputDir -ChildPath "$baseName.md"
    
    # Run pandoc command to convert the .docx to .md
    pandoc $docxFile -o $mdFile

    Write-Host "Converted $docxFile to $mdFile"
}
