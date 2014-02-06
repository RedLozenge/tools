#!/bin/bash

# Exit codes:
# 20 - jshint error
# 21 - NPM not installed

BASE_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../.. && pwd )"
pushd "${BASE_PATH}" &> /dev/null

function err() {
    echo "[31;01m$@[0m" 1>&2
}

# Copy newest version of hooks
tools/bin/copy-hooks
if [ $? -gt 0 ]; then
    # run the new hook script
    .git/hooks/pre-commit
    exit $?
fi

# Update packages
which npm &> /dev/null
if [ $? -ne 0 ]; then
    err "ERROR:"
    err "    NPM is not installed. Please install Node.js to supply it."
    err "    See: http://nodejs.org/"
    exit 21
fi
npm install &> /dev/null

# Run Jshint
node_modules/.bin/jshint *
if [ $? -ne 0 ]; then
    err "ERROR:"
    err "    aborting on jshint errors."
    exit 20
fi
