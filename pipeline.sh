#!/bin/sh -e

echo 'Local stage'
npm ci
npm run lint
npm test
./graceful-shutdown-test.sh

# echo 'Production stage'
# cf target -o additional-services-xrnbvs9d -s service.gorilla-quizz
# ./deploy.sh $CF_USER $CF_PW
