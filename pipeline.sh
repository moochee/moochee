#!/bin/sh -e

if [ -n "$(git status --porcelain)" ]; then
    echo "there are uncommitted chages, stopping pipeline"
    exit 1
fi

git fetch

if [ "$(git rev-parse HEAD)" != "$(git rev-parse HEAD)" ]; then
    echo "current branch is not in sync with origin/master, stopping pipeline"
    exit 1
fi

cf target -s acdc-gorilla-test

cf target -s acdc-gorilla
