#!/bin/sh -e

if [ -n "$(git status --porcelain)" ]; then
    echo "there are uncommitted chages, stopping pipeline"
    exit 1
fi

git fetch

if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/master)" ]; then
    echo "current branch is not in sync with origin/master, stopping pipeline"
    exit 1
fi

cf target -s gorilla-quiz-test

cf target -s gorilla-quiz
