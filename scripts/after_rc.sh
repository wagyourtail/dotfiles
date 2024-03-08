
export PATH="$HOME/dotfiles/scripts:$PATH"
alias prime-run="env DRI_PRIME=1"
nkill() {
    for u in $(ps -ef | grep "$1" | sed -r "s/ +/ /g" | cut -d' ' -f2 | head -n -1); do;
        kill -9 $u
    done
}
