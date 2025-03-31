#!/bin/bash

date
curdir=$(dirname "$0")
mpv $curdir/ding-126626.mp3

mpv $curdir/发菩提心.webm
mpv $curdir/00入座v2.webm  
#mpv /home/zuokun/Videos/观修仪轨2/0-v1.mp4

mpv $curdir/1.m4a
mpv $curdir/2.m4a

for i in {1..8}
do
  date
  echo "##################### Loop spin: " $i "/ 8 #####################"
  mpv $curdir/ding-126626.mp3  
  mpv $curdir/ding-126626.mp3  
  
  mpv $curdir/1min-silence.m4a

  mpv $curdir/ding-126626.mp3  
  mpv $curdir/ding-101492.mp3
  
  mpv $curdir/5min-silence.m4a
done


mpv $curdir/ding-126626.mp3  
mpv $curdir/ding-126626.mp3  
mpv $curdir/ding-126626.mp3  

mpv $curdir/3.m4a
mpv $curdir/4.m4a
mpv $curdir/5-1.m4a
mpv $curdir/5-2.m4a
mpv $curdir/5-3.m4a
mpv $curdir/6-1.m4a
mpv $curdir/6-2.m4a
mpv $curdir/7.m4a
mpv $curdir/8-1.m4a
mpv $curdir/8-2.m4a
mpv $curdir/8-3.m4a
mpv $curdir/8-4.m4a
mpv $curdir/8-5.m4a
mpv $curdir/9-1.m4a
mpv $curdir/9-2.m4a
mpv $curdir/9-3.m4a
mpv $curdir/9-4.m4a
mpv $curdir/9-5.m4a
mpv $curdir/9-6.m4a
mpv $curdir/9-7.m4a
mpv $curdir/9-8.m4a
mpv $curdir/9-9.m4a
mpv $curdir/9-10.m4a


mpv $curdir/10-出坐.mp4
#mpv /home/zuokun/Videos/观修仪轨2/10.mp4
date