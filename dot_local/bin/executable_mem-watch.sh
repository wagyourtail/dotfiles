#!/bin/sh
# Memory-pressure notifier — warns instead of killing.
# Hysteresis: notifies once when usage crosses WARN_PCT, re-arms
# only after it drops below RESET_PCT.
WARN_PCT=85
RESET_PCT=70
STATE_FILE="${XDG_RUNTIME_DIR:-/tmp}/mem-watch-alerted"

avail=$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)
total=$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)
pct=$(( 100 - avail * 100 / total ))

if [ "$pct" -ge "$WARN_PCT" ]; then
    if [ ! -f "$STATE_FILE" ]; then
        top=$(ps -eo rss,comm --sort=-rss | awk 'NR==2 {printf "%.1f GiB  %s", $1/1048576, $2}')
        notify-send -u critical -a "memory watchdog" \
            "Memory usage at ${pct}%" \
            "Top process: ${top}  (available: $((avail / 1024)) MiB)"
        touch "$STATE_FILE"
    fi
elif [ "$pct" -lt "$RESET_PCT" ] && [ -f "$STATE_FILE" ]; then
    rm -f "$STATE_FILE"
fi
