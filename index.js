'use strict';
var template = require( "./dialogue.json" );
var questionNumber = 1;
var score=0;
var stage=[0,0,0,0,0];

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: 'aefd4e784f5b48f6d7e89bdbd0863786',
    channelAccessToken: '7lhY3o2lB0tT918k8qRjoS0+IhbpEmBpQD6i2hxARgwTMlyfmxJbqQA/86KG3k1JCiZlVXam2SsVPbL/upM6ww2EIi2W/yOOTpH6nhdz9Fhr+ui9DFovSeWxcyn919r4wIHiqeQR6sCtzQsxXmNFnQdB04t89/1O/w1cDnyilFU='
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);


function handleEvent(event) {
    //送信用変数
    var responsemsg = {};
    //重みづけ変数
    var Weight=[47,28,44,34,33,36,23,44,34,37];    
    if ( event.type == 'message') {
        //メッセージ受信時
        if(event.message.text === 'ボタン'){
            //1問目を送信
            questionNumber = 1;
            score=0;
            stage=[0,0,0,0,0];
            responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question1
              };
        }
    }else if (event.type == "postback"){
        //ボタンが押されたとき
        var data = event.postback.data;
        if (data=="yes")var addpoint=2;
        if (data=="soso")var addpoint=1;
        if (data=="no")var addpoint=0;
        if (questionNumber==1||questionNumber==6){
            stage[0]+=addpoint;
        }else if (questionNumber==2||questionNumber==7){
            stage[1]+=addpoint;
        }else if (questionNumber==3||questionNumber==8){
            stage[2]+=addpoint;
        }else if (questionNumber==4||questionNumber==9){
            stage[3]+=addpoint;
        }else if (questionNumber==5||questionNumber==10){
            stage[4]+=addpoint;
        }
        
        if (data==="yes"){
            score+=Weight[questionNumber-1];
        }else if (data==="soso"){
            score+=Weight[questionNumber-1]/2;
        }
        questionNumber++;
        console.log(stage);
        console.log(score);
        
        //質問を番号に従って送信
        switch(questionNumber){
            case 2:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question2
             };
               break;
            case 3:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question3
             };
               break;
            case 4:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question4
             };
               break;
            case 5:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question5
             };
               break;
            case 6:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question6
             };
               break;
            case 7:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question7
             };
               break;
            case 8:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question8
             };
               break;
            case 9:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question9
             };
               break;
            case 10:
               responsemsg = {
                type: 'template',
                altText: 'template alt text',
                template: template.output.question10
             };
               break;
            case 11://結果を返す
                
                //ここに結果を書く
                var recommend="改善への提案:\n";
                var recommend2="";
                //4段階分類
                switch(stage[0]){
                    case 0:
                    case 1:
                    case 2:
                        recommend+="◆ストレスを感じていませんか？\nストレスや健康は幸福度に大きな影響を与えます。\n";
                        break;
                    case 3:
                    case 4:
                        recommend+="";
                        break;
                }
                if (recommend=="改善への提案:\n"){
                switch(stage[1]){
                    case 0:
                    case 1:
                    case 2:
                        recommend+="◆安心して暮らせる環境が大切です\n身の回りに不安があるとストレスの原因にもなります\n";
                        break;
                    case 3:
                    case 4:
                        recommend+="";
                        break;
                }
                switch(stage[2]){
                    case 0:
                    case 1:
                    case 2:
                        recommend+="◆人との繋がりを大切にしましょう\n学校や会社などの一員として属することでより高い幸福度を得られます\n";
                        break;
                    case 3:
                    case 4:
                        recommend+="";
                        break;
                }
            }
            if (recommend=="改善への提案:\n"){
                switch(stage[3]){
                    case 0:
                    case 1:
                    case 2:
                        recommend+="◆承認欲求が満たされないと鬱や無力感の原因になります\nまずは自分のことを認めてあげましょう\n相手のことを認めてあげるのもポイントです\n";
                        break;
                    case 3:
                    case 4:
                        recommend+="";
                        break;
                }
            }
            if (recommend=="改善への提案:\n"){
                switch(stage[4]){
                    case 0:
                    case 1:
                    case 2:
                        recommend+="◆なりたい自分を目指しましょう\n";
                        break;
                    case 3:
                    case 4:
                        recommend+="";
                        break;
                }
            }
                if(recommend=="改善への提案:\n"){
                    recommend="◆あなたは高次元の欲求を満たしています\n幸福度はとても高いと言えます\n";
                }

                //レコメンド
                score=Math.round((score/360)*100);
                if (score>=90){
                    recommend2="\n評価S"
                }else if (score>=80){
                    recommend2="\n評価A"
                }else if (score>=70){
                    recommend2="\n評価B"
                }else if (score>=60){
                    recommend2="\n評価C"
                }else{
                    recommend2="\n評価D"
                }
                
                String(score);
                score="結果は"+score+"点でした！\n\n"
                console.log(score);
                return client.replyMessage(event.replyToken,{
                    type:"text",
                    text:score+recommend+recommend2
                });
        }
    }else{
        //それ以外の時
        return Promise.resolve(null);
    }

    //質問を送信
    return client.replyMessage(event.replyToken,responsemsg);
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);