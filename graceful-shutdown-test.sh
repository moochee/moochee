#!/bin/sh -e

export VCAP_SERVICES='{
    "xsuaa": [{"name": "gorilla-uaa","credentials": {"clientid": "a", "clientsecret": "b", "url": ""}}],
    "fs-storage": [{"name": "gorilla-fs","volume_mounts": [{"container_dir": "./quizzes"}]}]
}'
export PORT=3000

node server/gorilla.js ./local-client.js &
pid=$!

attempts=0
until $(curl --output /dev/null --silent --fail http://localhost:3000/api/v1/status); do
    attempts=$((attempts+1))
    if [ "$attempts" == "60" ]; then
        echo 'app not started after 60 attempts, giving up'
        exit 1
    fi
    sleep 1
done

echo "server started (process $pid), requesting to stop"

curl --fail -X POST http://localhost:3000/api/v1/stop

(sleep 5; if ps -p $pid > /dev/null; then echo 'timeout'; kill -9 $pid; fi;) &
timeoutPid=$!

wait $pid
