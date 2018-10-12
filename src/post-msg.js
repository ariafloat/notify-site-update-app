const fetch = require('node-fetch');
const twitter = require('twitter');

module.exports.slack = function (postName, value) {
  const postData = {
    channel: process.env.SLACK_CHANNEL,
    text: `【${postName}】\n${value.date}「${value.title}」\n${value.url}`,
  };
  fetch(process.env.SLACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  }).then(res => res.text()).then(console.log).catch(console.error);
}

module.exports.twitter = function (postName, value) {
  const client = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
  const text = `【${postName}】\n${value.date}「${value.title}」\n${encodeURI(value.url)}`;
  client.post('statuses/update', {status: text}, function(error, tweet, response) {
    if(error) console.error(error);
    console.log(tweet); // Tweet body
    console.log(response); // Raw response object
  });
}
