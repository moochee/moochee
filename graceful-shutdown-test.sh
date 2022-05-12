#!/bin/sh -e

node server/gorilla.js ./local-bindings.js &
pid=$!

attempts=0
until $(curl --output /dev/null --silent --fail http://localhost:3000/api/v1/status); do
    attempts=$((attempts+1))
    if [ "$attempts" == "10" ]; then
        echo 'app not started after 10 attempts, giving up'
        exit 1
    fi
    sleep 1
done

echo "server started (process $pid), requesting to stop"

set +e; curl --fail -X POST http://localhost:3000/api/v1/stop; set -e

(sleep 2; if ps -o pid | grep "^\s*$pid\s*$"; then echo 'timeout'; kill -9 $pid; fi;) &
timeoutPid=$!

wait $pid
