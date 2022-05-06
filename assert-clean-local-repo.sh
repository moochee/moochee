#!/bin/sh

if [ -n "$(git status --porcelain)" ]; then
    echo "there are uncommitted chages, stopping pipeline"
    exit 1
fi

git fetch

if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
    echo "current branch is not in sync with origin/main, stopping pipeline"
    exit 1
fi
