#!/bin/bash

mpv $(dirname "$0")/ding-126626.mp3
mpv $(dirname "$0")/b01-顶礼加倍咒-3遍.m4a

for i in {1..5}
do
  echo "Loop spin:" $i
  mpv $(dirname "$0")/ding-126626.mp3
  mpv $(dirname "$0")/法王如意宝上师瑜伽5遍.m4a
#  sleep 20
#  mpv ~/Downloads/ding-101492.mp3
  
done