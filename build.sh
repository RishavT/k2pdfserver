#!/bin/bash

rm -rf ./dist
electron-packager . --build-with-native-modules --platform=darwin --arch=x64 \
  --package-manager=yarn --overwrite --out=./dist \
  --icon=./icons/icon.icns \
  --app-category-type=public.app-category.productivity \
  # --osx-sign.identity="Rishav Thakker" \

cd ./dist/Rayk-darwin-x64
mv ./LICENSE ./LICENSE-Electron
mv ./version ./version-Electron
cd -
cp ./LICENSE ./dist/Rayk-darwin-x64
