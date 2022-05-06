#!/bin/sh -e

./assert-clean-local-repo.sh

echo 'Local stage'
npm ci
npm run lint
npm test
./graceful-shutdown-test.sh
curl -O --silent https://unified-agent.s3.amazonaws.com/wss-unified-agent.jar
WS_WSS_URL=https://sap.whitesourcesoftware.com/agent WS_FORCECHECKALLDEPENDENCIES=true WS_FORCEUPDATE=true WS_FORCECHECKPOLICIES=true WS_FAILERRORLEVEL=all java -jar wss-unified-agent.jar

echo 'Integration stage'
cf api https://api.cf.eu12.hana.ondemand.com
cf auth $CF_USER $CF_PW
cf target -o additional-services-xrnbvs9d -s test.service.gorilla-quizz
./deploy.sh $CF_USER $CF_PW -test

echo 'Production stage'
cf target -o additional-services-xrnbvs9d -s service.gorilla-quizz
./deploy.sh $CF_USER $CF_PW
