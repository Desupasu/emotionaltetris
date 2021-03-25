#!/bin/bash
for filename in src/scripts/*.js; do
    npx uglifyjs "$filename" --compress --mangle -o src/minscripts/$(basename ${filename%.js}).min.js;
done

for filename in src/styles/*.css; do
    npx uglifycss "$filename" > src/minstyles/$(basename ${filename%.css}).min.css;
done