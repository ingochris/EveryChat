#!/bin/bash

#install all dependencies:
npm install --save body-parser express merge-descriptors nunjucks request socket.io zlib

if [ $? -eq 0 ]
then
  echo "Win"
  exit 0
else
  echo "Lose" >&2
  exit 1
fi