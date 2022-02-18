#!/bin/sh -e

# REVISE get rid of local profile, e.g. use some no-auth approach or dummy uaa data
source local.profile
node server/gorilla.js ./local-client.js &
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

curl --fail -X POST http://localhost:3000/api/v1/stop

(sleep 5; if ps -p $pid > /dev/null; then echo 'timeout'; kill -9 $pid; fi;) &
timeoutPid=$!

wait $pid
