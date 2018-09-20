const express = require('express');
const fetch = require('node-fetch');
const datastore = require('nedb-promise');
const parserHtml = require('./src/parser-html');
const post = require('./src/post-msg');

const db = {};
db.raqualia = new datastore({ filename: '.data/raqualia.db', autoload: true });
db.askat = new datastore({ filename: '.data/askat.db', autoload: true });
db.aratana = new datastore({ filename: '.data/aratana.db', autoload: true });
db.syros = new datastore({ filename: '.data/syros.db', autoload: true });

const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

const raqualiaSite = { name: 'raqualia', url: 'https://www.raqualia.co.jp/', postName: 'ラクオリア創薬' }
const sites = [
  { name: 'askat', url: 'http://askat-inc.com/japanese/news/', postName: 'AskAt' },
  { name: 'aratana', url: 'http://www.aratana.com/news/', postName: 'Aratana' },
  { name: 'syros', url: 'https://ir.syros.com/press-releases', postName: 'Syros' },
];

async function getSiteHtml(siteName, url) {
  const fetchData = await fetch(url);
  const html = await fetchData.text();
  return parserHtml[siteName](html);
}

async function detectChange(siteName, latestData, postName) {
  const pastData = await db[siteName].find({});
  if (pastData.length > 0) {
    const changeData = latestData.filter(latest => !pastData.some(past => past.url === latest.url));
    if (changeData.length > 0) {
      changeData.forEach((v) => {
        post.slack(postName, v);
        post.twitter(postName, v);
      });
      await db[siteName].remove({}, { multi: true });
      await db[siteName].insert(latestData);
    }
  }
}

const start = function () {
  fetch(raqualiaSite.url)
    .then(res => res.text())
    .then((html) => {
      parserHtml.raqualia(html).then((latestData) => {
        detectChange(raqualiaSite.name, latestData, raqualiaSite.postName).catch(console.error);
      }).catch(console.error);
    }).catch(console.error);
  
  sites.forEach((site) => {
    getSiteHtml(site.name, site.url).then((latestData) => {
      detectChange(site.name, latestData, site.postName).catch(console.error);
    }).catch(console.error);
  });
};

setInterval(start, 60000);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
