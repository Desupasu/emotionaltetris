const fs = require('fs');
const UglifyJS = require('uglify-js');
const uglifycss = require('uglifycss');

fs.readdirSync('./src/scripts').forEach(filename => {
    fs.writeFileSync(
        `./src/minscripts/${filename.slice(0,-2) + 'min.js'}`,
        UglifyJS.minify(
            fs.readFileSync(`./src/scripts/${filename}`, "utf8"),
            {}
        ).code,
        "utf8"
    );
})

fs.readdirSync('./src/styles').forEach(filename => {
    fs.writeFileSync(
        `./src/minstyles/${filename.slice(0,-3) + 'min.css'}`,
        uglifycss.processFiles([`./src/styles/${filename}`]),
        "utf8"
    );
})