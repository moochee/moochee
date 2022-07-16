#!/bin/sh -e

echo 'Local stage'
npm ci
npm run lint
npm test

echo 'Production stage'
./deploy.sh
