const watch = require('watch');
const chromix = require('chromix-too')().chromix;
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

watch.watchTree(`${process.cwd()}/force-app`, {}, (f, curr, prev) => {
  console.clear();
  // get org url
  exec('sfdx force:org:list --json', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    }
    const result = JSON.parse(stdout).result;
    const orgs = result.nonScratchOrgs.concat(result.scratchOrgs);
    const predicate = argv.u
      ? o => o.alias === argv.u
      : o => o.isDefaultUsername;
    const orgSubdomain = orgs.find(predicate).instanceUrl.split('.')[0];

    exec(
      `sfdx force:source:push ${argv.u ? '-u ' + argv.u : ''}`,
      (err, stdout, stderr) => {
        if (err) {
          console.log(`exec err: ${err}`);
        }
        console.log(stdout);
        exec(`chromix-too reload ${orgSubdomain}`, (err, stdout, stderr) => {
          if (err) {
            console.log(err);
          }
        });
      }
    );
  });
});
