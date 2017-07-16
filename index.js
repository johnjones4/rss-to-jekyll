const FeedParser = require('feedparser');
const request = require('request');
const slug = require('slug');
const fs = require('fs-extra');
const YAML = require('yamljs');
const path = require('path');
const htmlToText = require('html-to-text');

module.exports = (rssURL,descriptionWordLength,outputFolder,layout) => {
  const handleFeedItem = (rssItem) => {
    const filePath = filePathForRSSItem(rssItem);
    return fs.exists(filePath)
      .then((exists) => {
        if (!exists) {
          const fileContents = generateFileContentsForRSSItem(rssItem);
          return fs.writeFile(filePath,fileContents);
        }
      })
  }

  const filePathForRSSItem = (rssItem) => {
    const filename = [rssItem.pubDate.getFullYear(),rssItem.pubDate.getMonth()+1,rssItem.pubDate.getDate()].map(prefixZero).join('-')+'-'+slug(rssItem.title).toLowerCase()+'.md';
    return path.join(outputFolder,filename);
  }

  const prefixZero = (n) => {
    if (n < 10) {
      return '0'+n;
    } else {
      return n;
    }
  }

  const generateFileContentsForRSSItem = (rssItem) => {
    const description = htmlToText.fromString(rssItem.description).replace(/\n/g,' ').split(' ').slice(0,descriptionWordLength).join(' ')
    const frontMatter = {
      'layout': layout,
      'title': rssItem.title,
      'description': description
    }
    return '---\n'+YAML.stringify(frontMatter)+'---\n\nFrom Medium:\n\n>'+description+'\n\n[Read More]('+rssItem.link+']\n';
  }

  return new Promise((resolve,reject) => {
    const req = request(rssURL)
    const feedparser = new FeedParser();

    req.on('error',(error) => {
      reject(error);
    });

    req.on('response',function(res) {
      const stream = this;
      if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'));
      } else {
        stream.pipe(feedparser);
      }
    });

    feedparser.on('error',(error) => {
      reject(error);
    });

    feedparser.on('readable',function() {
      const stream = this;
      var item;
      while (item = stream.read()) {
        handleFeedItem(item);
      }
    });

    feedparser.on('end',() => {
      resolve();
    })
  });
}
