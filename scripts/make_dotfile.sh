#!/bin/bash

##############################################
#   DON'T USE ON FILES OUTSIDE OF HOME DIR.  #
#   IT WILL ATTEMPT TO DIRECTORY TRAVERSE!   #
#   YOU HAVE BEEN WARNED.                    #
##############################################

REALPATH=$(readlink -f "$1")
RELPATH=$(realpath -s --relative-to "$HOME" "$REALPATH")

mkdir -p "$(dirname "$HOME/dotfiles/$RELPATH")"
cp "$1" "$HOME/dotfiles/$RELPATH"
echo "ln -s \"\$HOME/dotfiles/$RELPATH\" \"\$HOME/$RELPATH\"" >> $HOME/dotfiles/scripts/install_dotfiles.sh
rm "$1"
ln -s "$HOME/dotfiles/$RELPATH" "$HOME/$RELPATH"