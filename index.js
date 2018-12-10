const util = require('util');
const exec = util.promisify(require('child_process').exec);
const watch = require('watch');
const argv = require('yargs')
    .demandCommand(0, 1, null, 'Too many commands')
    .option('u', {
        alias: 'org',
        demandOption: false,
        default: '',
        describe:
            'Alias of the scratch org that you want to push to (leave blank to use default).',
        type: 'string'
    }).argv;

watch.watchTree(`${process.cwd()}/force-app`, { interval: 1 }, async () => {
    console.clear();
    const { stdout, stderr } = await pushToOrg(argv.u);
    console.log(stdout);
    console.log(stderr);
    const orgSubdomain = await getOrgSubdomain(argv.u);
    const tabList = await getTabs(orgSubdomain);
    tabList.forEach(tab => reloadTab(tab.id));
});

async function getOrgSubdomain(alias) {
    const { stdout } = await exec('sfdx force:org:list --json');
    const { result } = JSON.parse(stdout);
    const orgs = result.nonScratchOrgs.concat(result.scratchOrgs);
    const predicate = alias ? o => o.alias === alias : o => o.isDefaultUsername;
    return orgs
        .find(predicate)
        .instanceUrl.split('.')[0]
        .slice(8);
}

async function getTabs(subdomain) {
    const { stdout } = await exec('chrome-cli list links');
    const tabList = stdout.split('\n').map(tab => {
        let [id, url] = tab.split(' ', 2);
        id = id.slice(1, -1);
        if (id.includes(':')) {
            const idArr = id.split(':');
            id = idArr[idArr.length - 1];
        }
        return { id, url };
    });
    return tabList
        .filter(tab => tab.id)
        .filter(tab => tab.url.includes(subdomain));
}

async function pushToOrg(alias) {
    try {
        const result = await exec(
            `sfdx force:source:push ${alias ? '-u ' + alias : ''}`
        );
        return result;
    } catch (e) {
        console.log(e.stdout);
    }
}

function reloadTab(tabId) {
    exec(`chrome-cli reload -t ${tabId}`);
}
