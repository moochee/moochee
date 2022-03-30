#!/bin/sh -e

./assert-clean-local-repo.sh

echo 'Local stage'
npm ci
npm run lint
npm test
./graceful-shutdown-test.sh

cf login -a https://api.cf.sap.hana.ondemand.com -u $CF_USER -p $CF_PW -o cc-acdc-tools

echo 'Integration stage'
cf target -s gorilla-quiz-test
./deploy.sh $CF_USER $CF_PW -test

echo 'Production stage'
cf target -s gorilla-quiz
./deploy.sh $CF_USER $CF_PW
