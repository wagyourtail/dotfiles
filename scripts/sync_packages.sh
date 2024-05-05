#!/bin/bash

paru -D --asdeps --noconfirm $(paru -Qq)
paru -D --asexplicit --noconfirm $(cat "$HOME/dotfiles/packages.txt")
paru -R --noconfirm $(paru -Qdtq)
paru -Sy --noconfirm --needed  $(cat "$HOME/dotfiles/packages.txt")