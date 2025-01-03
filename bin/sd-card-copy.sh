PS C:\tmp\sd-card> 

$curTStamp = (Get-Date)
$fileno = 1
$target = "f:"

 Get-ChildItem "." -Filter *.mp3 | Foreach-Object {
     echo "$fileno : $_"
     $_.CreationTime = $curTStamp
     $_.LastWriteTime = $curTStamp
     cp $_ $target
     $fileno = $fileno + 1
 }


1 : a1-上师念诵-加倍咒.mp3
2 : a2-上师念诵-念珠加持咒.mp3
3 : a3-上师念诵-早上醒來語加持百字明及发愿.mp3
4 : b01-佛法融入生活-顶礼加倍咒-7遍.mp3
5 : b02-佛法融入生活-行善加倍咒-7遍.mp3
6 : b03-佛法融入生活-饭前供施咒.mp3
7 : b04-佛法融入生活-供花加倍咒-7遍.mp3
8 : b05-佛法融入生活-绕塔加倍咒-7遍.mp3
9 : b06-佛法融入生活-沐浴净罪咒-7遍.mp3
10 : b07-佛法融入生活-践踏佛影咒-7遍.mp3
11 : b08-佛法融入生活-剩饭布施咒-7遍.mp3
12 : b09-佛法融入生活-口水布施咒-7遍.mp3
13 : b10佛法融入生活-流汗布施咒-7遍.mp3
14 : b11-佛法融入生活-鼻涕布施咒-7遍.mp3
15 : b12-佛法融入生活-小便布施咒-7遍.mp3
16 : b13-佛法融入生活-大便布施咒-7遍.mp3
17 : c1-上师念诵-莲师心咒108遍-快速.m4a.mp3
18 : c2-上师念诵-百字明21遍.m4a.mp3
19 : c3-上师念诵-忿怒莲师心咒-110遍-18min.mp3
20 : c4-上师念诵-普获悉地祈祷文111遍.mp3
21 : c5-加行念诵-皈依110遍.mp3
22 : c6-上师念诵-发菩提心110遍.mp3
23 : h1-达钦法王-文殊心咒.mp3
24 : h2-达钦法王-观音心咒.mp3
25 : h3-崔津法王-三怙主心咒.mp3
26 : h4-崔津法王-百岁长寿佛简轨.mp3
27 : h5-崔津法王-药师佛心咒.mp3
28 : h6-崔津法王-摩利支咒语21遍.mp3
29 : h7-法王如意宝-怀业祈祷文.mp3
30 : h8-佛母达嫫拉-绿度母修法仪轨.mp3
31 : h9-阿桑噶仁波切-崔津法王长寿祈请文.mp3
32 : m01-佛曲-法王如意宝纪念祈请文-上师造颂.mp3
33 : m02-佛曲-皈依依處總集本體蓮花生大師.mp3
34 : m03-佛曲-龍欽巴祈禱文.mp3
35 : m04-佛曲-门措上师祈祷颂.mp3
36 : m05-佛曲-普贤王如来愿文.mp3
37 : m06-佛曲-三主要道.mp3
38 : m07-佛曲-佛子行三十七頌.mp3
39 : m08-佛曲-索达吉堪布祈祷文.mp3
40 : m09-佛曲-堪布益西彭措仁波切住世祈祷文.mp3
41 : m10-佛曲-薩迦五祖祈請文.mp3
42 : x01-妙莲老和尚-六度弥陀-30分钟.mp3
43 : x02-妙莲老和尚-六度观音-30分钟.mp3
44 : x03-净空法师-念佛快速版(30分钟).mp3
45 : x04-显宗念诵-楞严咒-万佛城.mp3
46 : x05-显宗念诵-楞严咒咒心108遍 .mp3
47 : x06-显宗念诵-大悲咒和心经-灵岩山寺女众师父.mp3
48 : x07-精进观音-灵岩山寺女众师父.mp3
49 : x08-显宗念诵-地藏经读诵-60分钟版.mp3
50 : x09-显宗念诵-大乘无量寿经-63分钟版.mp3
51 : x10-南无阿弥陀佛-印光大师传承-60分钟.mp3
52 : z1-益西上师-赞佛偈（朝暮功课）.mp3
53 : z2-灵岩山寺-助念佛号-30分钟.mp3
PS C:\tmp\sd-card>
