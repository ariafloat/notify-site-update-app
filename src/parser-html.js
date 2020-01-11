const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports.raqualia = function (data) {
  return fetch('https://www.raqualia.co.jp/ir/api/recent')
    .then(res => res.json())
    .then((json) => {
      const resultPress = [];
      for (let i = 0; i < json.length; i += 1) {
        resultPress.push({
          date: json[i].pubdate,
          title: json[i].title,
          url: `https://www.raqualia.co.jp/${json[i].document_url}`,
        });
        if (i >= 4) break;
      }
      const resultNews = [];
      const $c = cheerio.load(data);
      const li = $c("ul[id='view1'] li[class='m-headline_list--item']");
      for (let i = 0; i < li.length; i += 1) {
        resultNews.push({
          date: li[i].children[1].children[1].children[0].data,
          title: li[i].children[1].children[7].children[0].data,
          url: li[i].children[1].attribs.href,
        });
        if (i >= 4) break;
      }
      return resultPress.concat(resultNews); 
  });
};

module.exports.askat = function (data) {
  const result = [];
  const $c = cheerio.load(data);
  const li = $c("ul[class='news stripe'] li");
  for (let i = 0; i < li.length; i += 1) {
    result.push({
      date: li[i].children[1].children[1].children[1].children[0].data,
      title: li[i].children[1].children[3].children[1].children[1].children[1].children[0].data,
      url: li[i].children[1].children[3].children[1].attribs.href,
    });
    if (i >= 4) break;
  }
  return result;
};

module.exports.aratana = function (data) {
  const result = [];
  const $c = cheerio.load(data);
  const header = $c("div[class='news-blocks'] header[class=entry-header]");
  for (let i = 0; i < header.length; i += 1) {
    result.push({
      date: header[i].children[5].children[1].children[0].data,
      title: header[i].children[3].children[0].children[0].data,
      url: header[i].children[3].children[0].attribs.href,
    });
    if (i >= 4) break;
  }
  return result;
};

module.exports.syros = function (dataNews) {
  const resultNews = [];
  const $cn = cheerio.load(dataNews);
  const divNews = $cn("div[class='media-body']");
  for (let i = 0; i < divNews.length; i += 1) {
    resultNews.push({
      date: divNews[i].children[1].children[0].children[0].data,
      title: divNews[i].children[3].children[1].children[0].data.trim(),
      url: divNews[i].children[3].children[1].attribs.href,
    });
    if (i >= 4) break;
  }
  return resultNews;
};

module.exports.luoxin = function (dataNews) {
  const resultNews = [];
  const $cn = cheerio.load(dataNews);
  const divNews = $cn("div[class='news'] ul li");
  for (let i = 0; i < divNews.length; i += 1) {
    resultNews.push({
      date: divNews[i].children[1].children[5].children[0].data,
      title: divNews[i].children[1].children[3].children[0].data,
      url: 'https://www.luoxin.cn' + divNews[i].children[1].attribs.href,
    });
    if (i >= 4) break;
  }
  return resultNews;
};
