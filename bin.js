#! /usr/bin/env node

const rssToJekyll = require('./index');

const argv = require('minimist')(process.argv.slice(2),{
  'default': {
    'descriptionWordLength': 100,
    'outputFolder': '_posts',
    'layout': 'post'
  }
});

if (argv._.length === 1) {
  rssToJekyll(argv._[0],argv.descriptionWordLength,argv.outputFolder,argv.layout)
    .then(() => {
      console.log('Done!')
    })
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    })
} else {
  console.log('Usage: \n# rss-to-jekyll <RSS URL> [--descriptionWordLength=# --outputFolder=_posts --layout=post]')
}
