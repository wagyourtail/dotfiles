#!/bin/bash

sleep 5
hyprctl dispatch exec "steam -nochatui -nofriendsui -silent"
hyprctl dispatch exec vesktop
