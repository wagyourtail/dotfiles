#!/bin/bash

for file in $(cat "$HOME/dotfiles/tracked.txt") ; do
    if [ -f "$HOME/$file.bak" ] ; then
        rm "$HOME/$file.bak"
    fi
done