#!/bin/bash
if [[ $(fuser -k "$1") ]]; then 
    echo "closed"
else
    flock -xn "$1" -c "$2"
fi