'use strict';



const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: 'ea3580fc0838ba1c568d86025f82e2ae',
    channelAccessToken: 'NzinPKPdtLW7wiob9Ycpr8eCjwRDKgesW3f0ASvbFNpjsGctml4NBVkdwUJrOVL57XLlFnHWRK50zPgoYS9Q7NcmBQ2Sd+9c6E/aDG9QvRlyyVryMwGa+Uo2l/qUQUUZp42IxZvuPUVJuDrPOXx9DAdB04t89/1O/w1cDnyilFU='
};


const app = express();

// can access directory 
app.use(express.static(__dirname + '/tmp'));

var host = "";

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    host = req.headers.host;
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);



function readAllChunks(readableStream) {
  const reader = readableStream.getReader();
  const chunks = [];

  function pump() {
    return reader.read().then(({ value, done }) => {
      if (done) {
        return chunks;
      }
      chunks.push(value);
      return pump();
    });
  }

  return pump();
}

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text' || event.message.type !=='image') {
    const contentStream = client.getMessageContent(event.message.id);

    var uuid = require('uuid');
    const fileName = uuid.v4();

    const fs = require('fs');
    fs.mkdir('tmp', function (err) {});

    var writeStream = fs.createWriteStream('tmp/' + fileName + '.jpg', { flags : 'w' });
    contentStream.pipe(writeStream);

    writeStream.on('close', function () {
      // const cloudinary = require('cloudinary');
      // cloudinary.config({
      //   cloud_name: process.env.CLOUDINARY_NAME,
      //   api_key: process.env.CLOUDINARY_KEY,
      //   api_secret: process.env.CLOUDINARY_SECRET
      // });
      // cloudinary.uploader.upload('tmp/' + fileName + '.jpg', function(result) {
      //   console.log(result)
        var os = require("os");

        const message = { type: 'text', text: "https://" + host + fileName + '.jpg'};
        return client.replyMessage(event.replyToken, message);
      }); 

    }else{
        return Promise.resolve(null);
    }
}


app.listen(PORT);
console.log(`Server running at ${PORT}`);

// exception info
process.on('unhandledRejection', console.dir);