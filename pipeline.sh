#!/bin/sh -e

./assert-clean-local-repo.sh

echo 'Local stage'
npm ci
npm run lint
npm test
./graceful-shutdown-test.sh

cf api https://api.cf.sap.hana.ondemand.com
cf auth $CF_USER $CF_PW

echo 'Integration stage'
cf target -o cc-acdc-tools -s gorilla-quiz-test
./deploy.sh $CF_USER $CF_PW -test

echo 'Production stage'
cf target -o cc-acdc-tools -s gorilla-quiz
./deploy.sh $CF_USER $CF_PW
