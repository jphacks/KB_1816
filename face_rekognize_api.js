'use strict';

const AWS = require("aws-sdk");
AWS.config.loadFromPath('./awsconfig.json');

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
  if (event.message.type =='image') {
    // client.getMessageContent(event.message.id).then(function(data){
    //     var buf = new Buffer(data);
    //     var param = {
    //     Image: {
    //       Bytes: buf
    //       }
    //     };
    //     save_to_bucket(buf, fileName);
    //   })
    // }

    const contentStream = client.getMessageContent(event.message.id);

    var buf = new Buffer(contentStream);

    console.log("buffer Successfully");

    var uuid = require('uuid');
    const fileName = uuid.v4();

    const fs = require('fs');
    fs.mkdir('tmp', function (err) {});

    //save imagefile to /tmp
    var writeStream = fs.createWriteStream('tmp/' + fileName + '.jpg', { flags : 'w' });
    var imageName = fileName + '.jpg';

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
      

      var img_url = "https://" + host +"/"+ fileName + '.jpg';

      save_to_bucket(buf, imageName)
      .then(function(bucket){ return rekognition_happy_rate(bucket, fileName)})
      .then(function(happy){
          const message = { type: 'text', text: img_url};
          return client.replyMessage(event.replyToken, message);
      });
      // var s3Object = save_to_bucket(img_url, imageName);
      // 幸福度診断
      // var happy = rekognition_happy_rate(s3Object);
      // const message = { type: 'text', text: img_url};
    }); 

    }else{
        return Promise.resolve(null);
    }
}




// s3に保存
function save_to_bucket(contentStream, imageName){
  return new Promise(function(resolve){
    console.log("save_to_bucket");
    var s3 = new AWS.S3(); 
    var bucket = "lnebot-rekognition";
    var params = {
      Bucket: bucket,
      Key: imageName,
      ContentType: "image/png",
      Body: contentStream
    };
    console.log("params ok");

    s3.putObject(params, function(err, data) {
      if (err) { 
        console.log(err, err.stack);
      }else{
        console.log("Successfully uploaded data to "+  bucket + "/" + imageName);
        // var s3Object= {
        //     Bucket: bucket,
        //     Name: imageName
        // }
        resolve(bucket);
      } 
    });
  });
}



function rekognition_happy_rate(bucket, imageName){
  return new Promise(function (resolve){
    
    console.log(bucket);
    console.log(imageName);
    var params = {
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: imageName
        }
      }
    };
    var rekognition = new AWS.Rekognition();
    console.log('conection AWS .....');
    // 顔分析
    rekognition.detectFaces(params, function(err, data) {
      if (err) {
        console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        console.log(err, err.stack);
      } else {

        console.log(data);
        data.FaceDetails.Emotions.forEach(function(emotion) {
          if (emotion['Type'] == 'HAPPY'){
            emo_rate = emotion['Confidence'].toFixed(1);
          }
           var happy = 'あなたの幸福度は' + emo_rate.toString + '%です。';
          resolve(happy);
        });
      }
    });
  });
}


app.listen(PORT);
console.log(`Server running at ${PORT}`);

// exception info
process.on('unhandledRejection', console.dir);
