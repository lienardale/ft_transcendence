#!/bin/bash
dir=$1
version=$2
cd $1
docker build -t $1 . > $1_build_$version.log
img_id=$(cat $1_build.log | tail | grep "Successfully built" | cut -d " " -f 3)
echo "img id $1 : $img_id" 
docker tag $img_id ghcr.io/YOUR_GIT/$1:$version > $1_tag_$version.log
docker push ghcr.io/YOUR_GIT/$1:$version > $1_push_$version.log