#!/usr/bin/env sh
set -x

rep_url=$(git remote get-url origin)
sitePath=$(
    cd $(dirname $0)/..
    pwd
)/dist


set -e


npm run build


cd ${sitePath}


git init
git add -A
git commit -m 'deploy'

git push -f ${rep_url} master:gh-pages
cd -
