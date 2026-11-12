#!/bin/sh

ags quit 2>/dev/null || killall -q ags
sleep 1
ags run &
