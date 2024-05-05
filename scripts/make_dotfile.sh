#!/bin/bash

##############################################
#   DON'T USE ON FILES OUTSIDE OF HOME DIR.  #
#   IT WILL ATTEMPT TO DIRECTORY TRAVERSE!   #
#   YOU HAVE BEEN WARNED.                    #
##############################################

if [ ! -L "$1" ] ; then
    REALPATH=$(readlink -f "$1")
    RELPATH=$(realpath -s --relative-to "$HOME" "$REALPATH")

    # create in dotfiles
    mkdir -p "$(dirname "$HOME/dotfiles/$RELPATH")"
    cp "$HOME/$RELPATH" "$HOME/dotfiles/$RELPATH"

    # write to install script
    echo $RELPATH >> "$HOME/dotfiles/tracked.txt"

    # run install script commands
    mv "$HOME/$RELPATH" "$HOME/$RELPATH.bak"
    ln -s "$HOME/dotfiles/$RELPATH" "$HOME/$RELPATH"

    echo "Successfully made dotfile!"
else 
    echo "File is already a symlink!"
fi