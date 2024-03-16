# My Dotfiles

This is a collection of scripts and dotfiles I use for configuring my systems.

## Dependencies
*if you're smart enough, you can skip any of these you don't want*

* hyprland
* waybar
* wofi
* python
* python-vpk
* linux-wallpaperengine
* wlr-randr
* zsh

some other stuff probably

## Installation

1. git clone this so it's in `$HOME/dotfiles`
1. run `$HOME/scripts/install_dotfiles.sh`
1. job done

## Post Installation

Symlinks will be created from the normal locations for the files to those in the dotfiles dir.
this means you can open dotfiles in an editor, and not have to worry about all the other crap.

## Adding Tracked Files

If you want to add a file to dotfiles
run the [`make_dotfiles.sh`](scripts/make_dotfile.sh) script, do note the big disclaimer.

## Uninstalling

read [`install_dotfiles.sh`](scripts/install_dotfiles.sh) and do the opposite. Good Luck :)


## Not Included Stuff

* I use [oh-my-zsh](https://ohmyz.sh/) with the [af-magic](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes#af-magic) theme.

## Notes

### Changing guake's size

guake's size must match it's configured size in the hyprland.conf file, or it'll try to resize itself when you open a new tab.

Edit it in [`guake.conf`](other/guake.conf) and set the same values in the [`hyprland.conf`](.config/hypr/hyprland.conf)

then run `guake --restore-preferences "$HOME/dotfiles/other/guake.conf"`
