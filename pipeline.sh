#!/bin/sh -e

./assert-clean-local-repo.sh

echo 'Local stage'
npm ci
npm run lint
npm test
./graceful-shutdown-test.sh

echo 'Integration stage'
cf target -s gorilla-quiz-test
./deploy.sh dummy-cf-user dummy-cf-pw -test #TODO use CF tech user and supply creds through env

#echo 'Production stage'
#cf target -s gorilla-quiz
#./deploy.sh dummy-cf-user dummy-cf-pw #TODO use CF tech user and supply creds through env
