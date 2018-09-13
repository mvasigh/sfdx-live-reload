const minimist = require('minimist');
const fs = require('fs');

module.exports = () => {
    const args = minimist(process.argv.slice(2));
    const path = args._[0];

    return fs.existsSync(path)
        ? require('./src/live_reload')(args)
        : console.error(`${path} does not exist. Please enter a valid path.`)
}