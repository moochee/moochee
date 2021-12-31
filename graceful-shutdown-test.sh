#!/bin/sh -e

echoerr() { >&2 echo $@; }

echo 'starting server'

source local.profile
node server/gorilla.js ./local-client.js &
pid=$!

attempts=0
until $(curl --output /dev/null --silent --fail http://localhost:3000/api/v1/status); do
    attempts=$((attempts+1))
    if [ "$attempts" == "10" ]; then
        echoerr 'app not started after 10 attempts, giving up'
        exit 1
    fi
    sleep 1
done

echo 'server started, requesting to stop'

curl --fail -X POST http://localhost:3000/api/v1/stop

attempts=0
while $(curl --output /dev/null --silent --fail http://localhost:3000/api/v1/status); do
    attempts=$((attempts+1))
    if [ "$attempts" == "10" ]; then
        echoerr 'ERROR: app not stopped after 10 attempts, giving up'
        kill $pid
        exit 1
    fi
    sleep 1
done

echo 'server stopped'

if ps -p $pid > /dev/null; then
   echoerr "application did not completely terminate, process still exist: $pid"
   echoerr 'killing process now to prevent stale processes piling up, fix this immediately'
   kill $pid
   exit 1
fi
