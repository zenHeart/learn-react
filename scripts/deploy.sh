#!/usr/bin/env sh
set -x

rep_url=$(git remote get-url origin) # 仓库地址
sitePath=$(
    cd $(dirname $0)/..
    pwd
)/dist

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd ${sitePath}

# 如果是发布到自定义域名

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
git push -f ${rep_url} master:gh-pages

cd -
