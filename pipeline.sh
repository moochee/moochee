#!/bin/sh -e

echo 'Local stage'
npm ci
npm run lint
npm test
./graceful-shutdown-test.sh

echo 'Production stage'
./deploy.sh
