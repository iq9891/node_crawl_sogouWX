//数据下载下来爬虫
//做的事情
//1.从搜狗搜索中下载吆喝科技公众账号的图片地址，文章标题，文章链接，存入ext.json文件
//2.把图片从网上下到本地存入knowledgeImg文件夹中

var cheerio = require("cheerio");
var http = require("http");
var fs= require('fs');
var gs = require('nodegrass');

function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}

var url = "http://weixin.sogou.com/weixin?type=1&query=%E5%90%86%E5%96%9D%E7%A7%91%E6%8A%80&ie=utf8"
var oNew = {};  //存储数据
var iNowPage = 1;
var iNowPage2 = 1;
var iAllPage = 5;

download(url, function(data) {
  if (data) {
    //console.log(data);

    var $ = cheerio.load(data);
    var sUrl = $('#sogou_vr_11002301_box_0').attr('href');
    var aUrl = sUrl.split('?');

    downDateFn (iNowPage,aUrl)
    function downDateFn (iNow,aUrl) {
      if (iNow === iAllPage+1) {
        diguiFn (iNowPage2, aUrl);
        return;
      }

      getInfoFn (iNow,aUrl, function () {
        downDateFn (++iNow,aUrl)
      });
    }

    function diguiFn (iNow, aUrl) {
      if (iNow === iAllPage+1) {
        //将数据存入json文件
        fs.writeFile('../adhoc_site/app/knowledge.json', JSON.stringify(oNew), function (err) {
          if (err) throw err;
          console.log('It\'s saved!'); //文件被保存
        })
        return;
      }

      readInfoFn (iNow,aUrl, function () {
        diguiFn (++iNow,aUrl)
      });
    }

  }
  else console.log("error67");
});
function getInfoFn (iNow,aUrl,cb) {
  //gs.get('http://192.168.1.116/tongbuWX/ext'+ iNow +'.json', function(d){
  //console.log('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime());
  gs.get('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime(), function(d){

    //将数据存入json文件
    fs.writeFile('newJson/knowledge'+ iNow +'.json', d, function (err) {
      if (err) throw err;
      console.log('It\'s saved!'); //文件被保存
      //执行回调函数
      if (cb) {
        cb();
      }
    })

  }, 'UTF-8').on('error',function(err){
    console.log(err);
  });
}
function readInfoFn (iNow,aUrl,cb) {
  //gs.get('http://192.168.1.116/tongbuWX/ext'+ iNow +'.json', function(d){
  //console.log('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime());

  fs.readFile('newJson/knowledge'+ iNow +'.json','utf-8',function(err,d){
      if(err){
          console.log("error94");
      }else{
          var reg0 = /\{(.+?)\]\}/g;
          var oldUrl = d.match(reg0);//d.substring(19,19+19194);
          var oData = JSON.parse(oldUrl);
          oNew[iNow] = oData;
          var reg = /\<imglink\>(.+?)\<\\\/imglink\>/g;
          var sLink = d.match(reg);
          var reg2 = /\<imglink\>\<\!\[CDATA\[|\]\]\>\<\\\/imglink\>/g;
          var sText = sLink.toString().replace(reg2, "");
          var aText = sText.split(',');

          for (var i = 0; i < aText.length; i++) {
            sImgFn (oNew[iNow],iNow, i+'' ,aText);
          }

          //执行回调函数
          if (cb) {
            cb();
          }
          //第一次到时候给数据加长度
          if (iNow===1) {
            oNew['length'] = iAllPage = oData.totalPages;
          }
      }
  });
  //gs.get('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime(), function(d){

  //     var oldUrl = d.substring(19,d.length-2);
  //     var oData = JSON.parse(oldUrl);
  //     oNew[iNow] = oData;
  //     var reg = /\<imglink\>(.+?)\<\\\/imglink\>/g;
  //     var sLink = d.match(reg);
  //     var reg2 = /\<imglink\>\<\!\[CDATA\[|\]\]\>\<\\\/imglink\>/g;
  //     var sText = sLink.toString().replace(reg2, "");
  //     var aText = sText.split(',');
  //
  //     for (var i = 0; i < aText.length; i++) {
  //       sImgFn (oNew[iNow],iNow, i+'' ,aText);
  //     }
  //
  //     //执行回调函数
  //     if (cb) {
  //       cb();
  //     }
  //     //第一次到时候给数据加长度
  //     if (iNow===1) {
  //       oNew['length'] = iAllPage = oData.totalPages;
  //     }
  //
  // }, 'UTF-8').on('error',function(err){
  //   console.log(err);
  // });
}

//保存图片
function sImgFn (obj,iNow, i, aText) {
  http.get('http://img01.sogoucdn.com/net/a/04/link?appid=100520031&url='+aText[i], function(res){
      var imgData = "";

      res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

      res.on("data", function(chunk){
          imgData+=chunk;
      });

      res.on("end", function(){
          var sName = aText[i].substring(27);
          var reg3 = /\/0\?wx_fmt\=jpeg/g;
          var sNewName = sName.toString().replace(reg3, "");
          //图片输出
          fs.writeFile("../adhoc_site/app/knowledgeImg/"+ sNewName +".jpg", imgData, "binary", function(err){
              if(err){
                  console.log("down fail");
                  return;
              }
              console.log("down success"+iNow);
          });
      });
  });
}

//截取url上面的参数
function getQueryString(sUrl, name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = sUrl.match(reg);
  if(r!=null)return  unescape(r[2]); return null;
}
