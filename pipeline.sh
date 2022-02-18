#!/bin/sh -e

./assert-clean-local-repo.sh

echo 'Local stage'
npm run lint
npm test
./graceful-shutdown-test.sh

echo 'Integration stage'
cf target -s gorilla-quiz-test
./deploy.sh $CF_USER $CF_PASS -test # CF_PW?

read -p 'Press enter to continue to production'

echo 'Production stage'
cf target -s gorilla-quiz
./deploy.sh $CF_USER $CF_PASS
