#!/bin/bash

for file in $(cat "$HOME/dotfiles/tracked.txt") ; do
    if [ -e "$HOME/$file.bak" ] ; then
        rm "$HOME/$file.bak"
    fi
done