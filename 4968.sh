#! /usr/bin/env bash
watchman watch-del-all
rm -rf ./node_modules
npm cache clean verify
yarn cache clean
rm -rf $TMPDIR/react-*
yarn install
npm cache clean verify
yarn cache clean