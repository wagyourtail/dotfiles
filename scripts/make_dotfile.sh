#!/bin/bash

##############################################
#   DON'T USE ON FILES OUTSIDE OF HOME DIR.  #
#   IT WILL ATTEMPT TO DIRECTORY TRAVERSE!   #
#   YOU HAVE BEEN WARNED.                    #
##############################################

REALPATH=$(readlink -f "$1")
RELPATH=$(realpath -s --relative-to "$HOME" "$REALPATH")

# create in dotfiles
mkdir -p "$(dirname "$HOME/dotfiles/$RELPATH")"
cp "$HOME/$RELPATH" "$HOME/dotfiles/$RELPATH"

# write to install script
echo "mv \"\$HOME/$RELPATH\" \"\$HOME/$RELPATH.bak\"" >> $HOME/dotfiles/scripts/install_dotfiles.sh
echo "ln -s \"\$HOME/dotfiles/$RELPATH\" \"\$HOME/$RELPATH\"" >> $HOME/dotfiles/scripts/install_dotfiles.sh

# run install script commands
mv "$HOME/$RELPATH" "$HOME/$RELPATH.bak"
ln -s "$HOME/dotfiles/$RELPATH" "$HOME/$RELPATH"