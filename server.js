const express = require('express');
const fetch = require('node-fetch');
const datastore = require('nedb-promise');
const parserHtml = require('./src/parser-html');
const post = require('./src/post-msg');

const db = {};
db.raqualia = new datastore({ filename: '.data/raqualia.db', autoload: true });
db.askat = new datastore({ filename: '.data/askat.db', autoload: true });
db.syros = new datastore({ filename: '.data/syros.db', autoload: true });
db.luoxin = new datastore({ filename: '.data/luoxin.db', autoload: true });

const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

const raqualiaSite = { name: 'raqualia', url: 'https://www.raqualia.co.jp/', postName: 'ラクオリア創薬', twitter: true }
const sites = [
  { name: 'askat', url: 'https://askat-inc.com/japanese/news/', postName: 'AskAt', twitter: false },
  { name: 'syros', url: 'https://ir.syros.com/press-releases', postName: 'Syros', twitter: false },
  { name: 'luoxin', url: 'https://www.luoxin.cn/list.aspx?node=53', postName: 'Luoxin', twitter: false },
];

async function getSiteHtml(siteName, url) {
  const fetchData = await fetch(url);
  const html = await fetchData.text();
  return parserHtml[siteName](html);
}

async function detectChange(siteName, latestData, postName, twitter) {
  const pastData = await db[siteName].find({});
  if (pastData.length > 0) {
    const changeData = latestData.filter(latest => !pastData.some(past => past.url === latest.url));
    if (changeData.length > 0) {
      changeData.forEach((v) => {
        post.slack(postName, v);
        if (twitter) {
          post.twitter(postName, v);
        }
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
        detectChange(raqualiaSite.name, latestData, raqualiaSite.postName, raqualiaSite.twitter).catch(console.error);
      }).catch(console.error);
    }).catch(console.error);
  sites.forEach((site) => {
    getSiteHtml(site.name, site.url).then((latestData) => {
      detectChange(site.name, latestData, site.postName, site.twitter).catch(console.error);
    }).catch(console.error);
  });
};

setInterval(start, 60000);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
