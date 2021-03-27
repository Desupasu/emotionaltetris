const fs = require('fs');
const UglifyJS = require('uglify-js');
const uglifycss = require('uglifycss');

const options = {
    mangle: {
        toplevel: true,
    },
    compress: {
        global_defs: {
            "@console.log": "alert"
        },
        passes: 2
    },
};

fs.readdirSync('./src/scripts').forEach(filename => {
    fs.writeFileSync(
        `./src/minscripts/${filename.slice(0,-2) + 'min.js'}`,
        UglifyJS.minify(
            fs.readFileSync(`./src/scripts/${filename}`, "utf8"),
            options
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