
# choco install ffmpeg -y
# powershell -ExecutionPolicy Bypass -File xm07.ps1

function playonly {

    param (
        $startpos, $dur
    )

    ffplay -ss $startpos -t $dur  -autoexit  "C:\\Users\\zuokun\\Music\\心性休息\\《心性休息》颂词 朗诵版01.mp3"
    #Start-Sleep -s 3

}

function playfunc {

    param (
        $startpos, $dur
    )

    ffplay -ss $startpos -t $dur  -autoexit  "C:\\Users\\zuokun\\Music\\心性休息\\《心性休息》颂词 朗诵版01.mp3"
    Start-Sleep -s 120

}

playfunc 00:03:34 00:00:10.9
playfunc 00:03:45 00:00:12.9
playfunc 00:03:56.8 00:00:05.9


playfunc 00:04:02.075 9
#偶尔心向微善法，多时罪蒙慧眼故，持相自他有何利？


playfunc 00:04:10.516  10
#彼等在家或出家，稍许胜过恶趣众，是故称为中等身。


playfunc 00:04:19.292  12
#佛说无垢之法器，最为殊胜之正士，自在闻思精华义，调己劝他行善法，


playfunc 00:04:30.069 12
#修行山王极稳固，彼等仙人胜幢相，无论在家或出家，即是珍宝之人身


playfunc 00:04:41.114  12
#故于大德前闻法，如法修持住正法，恒常行法止非法，以修法义而住法


playfunc 00:04:52.025  6
#不久越过三有海，速至寂洲得涅槃。


playfunc 00:04:57.597  10
#何者转生为人时，倘若不勤修善法， 则无比其智劣者，


playfunc 00:05:05.204  9
#如自宝洲空手返， 无义虚度暇满身，故当恒修寂灭法。

# ffplay -ss 00:03:34 -t 00:00:10.9  -autoexit  "C:\\Users\\zuokun\\Music\\心性休息\\《心性休息》颂词 朗诵版01.mp3"
# Start-Sleep -s 10
# ffplay -ss 00:03:44 -t 00:00:12.8  -autoexit  "C:\\Users\\zuokun\\Music\\心性休息\\《心性休息》颂词 朗诵版01.mp3"
# Start-Sleep -s 10
# ffplay -ss 00:03:56 -t 00:00:05.9  -autoexit  "C:\\Users\\zuokun\\Music\\心性休息\\《心性休息》颂词 朗诵版01.mp3"
# Start-Sleep -s 10
