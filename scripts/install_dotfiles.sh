#!/bin/bash

if [ ! `grep -Fxq "source \"\$HOME/dotfiles/scripts/after_rc.sh\"" "$HOME/.zshrc"` ] ; then
    echo "source \"\$HOME/dotfiles/scripts/after_rc.sh\"" >> "$HOME/.zshrc"
else
    echo "Already sourced after_rc.sh in .zshrc!"
fi

guake --restore-preferences "$HOME/dotfiles/other/guake.conf"

for file in $(cat "$HOME/dotfiles/tracked.txt") ; do
    if [ ! -L "$HOME/$file" ] ; then
        # make parent directories
        mkdir -p "$(dirname "$HOME/$file")"
        # backup original file
        mv "$HOME/$file" "$HOME/$file.bak"
        # create symlink
        ln -s "$HOME/dotfiles/$file" "$HOME/$file"
    else 
        echo "File \"$file\" is already a symlink!"
    fi
done