const watch = require('watch');
const exec = require('child_process').exec;
const argv = require('yargs')
  .demandCommand(0, 1, null, 'Too many commands')
  .option('u', {
    alias: 'org',
    demandOption: false,
    describe:
      'Alias of the scratch org that you want to push to (leave blank to use default).',
    type: 'string'
  }).argv;

watch.watchTree(process.cwd(), {}, (f, curr, prev) => {
  console.clear();
  exec(
    `sfdx force:source:push ${argv.u ? '-u ' + argv.u : ''} --json`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      }
      const result = JSON.parse(stdout);
      // use result to refresh browser window containing org url
      console.log(result);
    }
  );
});
