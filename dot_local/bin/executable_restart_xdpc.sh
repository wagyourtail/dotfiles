#!/usr/bin/env bash
sleep 1
killall -e xdg-desktop-portal-cosmic
killall -e xdg-desktop-portal
killall xdg-desktop-portal
/usr/lib/xdg-desktop-portal-cosmic &
sleep 2
/usr/lib/xdg-desktop-portal &
