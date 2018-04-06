const cheerio = require('cheerio');

module.exports.raqualia = function (data) {
  function twoParse(dl, topUrl) {
    const dt = dl.children.filter(v => v.name === 'dt');
    const dd = dl.children.filter(v => v.name === 'dd');
    if (dt.length > 5) dt.splice(5, (dt.length - 5));
    const result = dt.map((element, index) => {
      const res = {
        date: element.children[0].data,
        title: dd[index].children[1].children[0].data,
        url: `${topUrl}${dd[index].children[1].attribs.href}`,
      };
      return res;
    });
    return result;
  }
  const $c = cheerio.load(data);
  const dl = $c("div[class='box'] dl");
  return twoParse(dl[0], '').concat(twoParse(dl[1], 'http://www.raqualia.co.jp/'));
}

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
}

module.exports.aratana = function (data) {
  const result = [];
  const $c = cheerio.load(data);
  const header = $c("div[class='news-blocks'] header[class=entry-header]");
  for (let i = 0; i < header.length; i += 1) {
    result.push({
      date: header[i].children[2].children[1].children[0].data,
      title: header[i].children[1].children[0].children[0].data,
      url: header[i].children[1].children[0].attribs.href,
    });
    if (i >= 4) break;
  }
  return result;
}

module.exports.syros = function (dataNews) {
  const resulNews = [];
  const $cn = cheerio.load(dataNews);
  const divNews = $cn("div[class='media-body']");
  for (let i = 0; i < divNews.length; i += 1) {
    resulNews.push({
      date: divNews[i].children[1].children[0].children[0].data,
      title: divNews[i].children[3].children[1].children[0].data.trim(),
      url: divNews[i].children[3].children[1].attribs.href,
    });
    if (i >= 4) break;
  }
  return resulNews;
}
