//做的事情
//1.从搜狗搜索中下载吆喝科技公众账号的图片地址，文章标题，文章链接，存入 knowledge.json 文件
//2.把图片从网上下到本地存入 knowledgeImg 文件夹中

var cheerio = require("cheerio");
var http = require("http");
var https = require("https");
var fs= require('fs');
var gs = require('nodegrass');

var url='https://mp.weixin.qq.com/mp/getmasssendmsg?__biz=MzAxMjYyNDQxMQ==&from=message&isappinstalled=0&uin=MTA5ODEwMjAxNA%3D%3D&key=710a5d99946419d9d53c7b709ef281c48a7bc9c3ecf563ba1a0a90e62b67bbfce675284f3a1dd8045dff0b8cc8eefd0c&devicetype=iMac+Macmini7%2C1+OSX+OSX+10.11.2+build(15C50)&version=11020201&lang=zh_CN&pass_ticket=MkJvgkT%2FAXmWh%2B7jt4BDrlet40t2NzGNovwaGnQTKdr%2FcLk0W7Bu3SCw2TLR6BqK#wechat_webview_type=1';

var oNew = {};  //存储数据
var iTotal = 0;
downloadhttps(url, function(data) {
  if (data) {
    fs.writeFile('/Applications/XAMPP/xamppfiles/htdocs/weixinJson/test.json', JSON.stringify(data), function (err) {
      if (err) throw err;
      console.log('It\'s saved!'); //文件被保存
    })
  }
  else{
    console.log("error22");
    console.log(data);
  }
});

//下载数据
//downFn (url,400859696);

//递归下载微信接口数据
function downFn (url,iNow) {
  iTotal++;
  console.log(iNow);

  gs.get('http://192.168.1.119/weixinJson/d'+ iNow +'.json', function(d){

    var oDate = JSON.parse(d);
    var oList = JSON.parse(oDate.general_msg_list);
    oNew[iNow] = oDate;

    if (!oDate.is_continue) {
      oNew['length'] = iTotal;
      //所有数据输出
      fs.writeFile('/Applications/XAMPP/xamppfiles/htdocs/weixinJson/knowledge.json', JSON.stringify(oNew), function (err) {
        if (err) throw err;
        console.log('It\'s saved!'); //文件被保存
      })
      return;
    }

    downFn (url,oList.list[oList.list.length-1].comm_msg_info.id);

  }, 'UTF-8').on('error',function(err){
    console.log(err);
  });
}

//------

//下载图片
var url2 = "http://weixin.sogou.com/weixin?type=1&query=%E5%90%86%E5%96%9D%E7%A7%91%E6%8A%80&ie=utf8?t="+ (new Date()).getTime();
var iNowPage = 1;
var iAllPage = 5;

//下载图片启动
// download(url2, function(data) {
//   if (data) {
//
//     if (data[0] === '<') {
//       console.log('302 Found 错误');
//       return;
//     }
//
//     var $ = cheerio.load(data);
//     var sUrl = $('#sogou_vr_11002301_box_0').attr('href');
//
//     var aUrl = sUrl.split('?');
//     console.log(aUrl);
//     downDateFn (iNowPage,aUrl);
//
//     function downDateFn (iNow,aUrl) {
//       if (iNow === iAllPage+1) {
//         return;
//       }
//
//       getInfoFn (iNow,aUrl, function () {
//         downDateFn (++iNow,aUrl)
//       });
//     }
//
//   }
//   else console.log("error67");
// });
function getInfoFn (iNow,aUrl,cb) {
  //gs.get('http://192.168.1.116/tongbuWX/ext'+ iNow +'.json', function(d){
  //console.log('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime());
  gs.get('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime(), function(d){
      var oldUrl = d.match(/\{(.+?)\]\}/g);
      var oData = JSON.parse(oldUrl);
      var reg = /\<imglink\>(.+?)\<\\\/imglink\>/g;
      var sLink = d.match(reg);
      var reg2 = /\<imglink\>\<\!\[CDATA\[|\]\]\>\<\\\/imglink\>/g;
      var sText = sLink.toString().replace(reg2, "");
      var aText = sText.split(',');

      for (var i = 0; i < aText.length; i++) {
        sImgFn (oData[iNow],iNow, i+'' ,aText);
      }

      //执行回调函数
      if (cb) {
        cb();
      }


  }, 'UTF-8').on('error',function(err){
    console.log(err);
  });
}

//保存图片
function sImgFn (obj,iNow, i, aText) {
  http.get('http://img01.sogoucdn.com/net/a/04/link?appid=100520031&url='+aText[i], function(res){
      var imgData = "";

      res.setEncoding("binary");

      res.on("data", function(chunk){
          imgData+=chunk;
      });

      res.on("end", function(){
          var sName = aText[i].substring(27);
          var reg3 = /\/0\?wx_fmt\=jpeg/g;
          var sNewName = sName.toString().replace(reg3, "");
          //图片输出
          //../adhoc_site/app/public
          fs.writeFile("/Applications/XAMPP/xamppfiles/htdocs/weixinJson/images/"+ sNewName +".jpg", imgData, "binary", function(err){
              if(err){
                  console.log(err);
                  return;
              }
              console.log("down success:"+sNewName);
          });
      });
  });
}

//下载
function downloadhttps(url, callback) {
  var postData = JSON.stringify({
    'msg' : 'Hello World!'
  });

var options = {
  hostname: 'mp.weixin.qq.com',
  port: 80,
  path: '/mp/getmasssendmsg?__biz=MzAxMjYyNDQxMQ==&uin=MTA5ODEwMjAxNA%3D%3D&key=710a5d99946419d94f393b9594379df13f09de38f2823782e56516eb943fe7516e6206ac0b72525a2442ff81ac9d314f&devicetype=iMac+Macmini7%2C1+OSX+OSX+10.11.2+build(15C50)&version=11020201&lang=zh_CN&pass_ticket=V66VeD3Di5PE7dFJMKo5MCncKo%2Bt6lwZL5W7qrFWkDuAC9YAr2GvcBpzPG3ZVlZH#wechat_webview_type=1',
  method: 'GET',
  headers: {
    'Content-Type': 'keep-alive',
    //'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) PhantomJS/19.0', //添加你想要的
    'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B466 MicroMessenger/6.3.9 NetType/WIFI Language/zh_CN',
    'Content-Length': postData.length
  }
};

var req = http.request(options, function(res){
  console.log('STATUS: '+res.statusCode);
  console.log('HEADERS: '+JSON.stringify(res.headers));
  res.setEncoding('utf8');
  var sData = '';
  res.on('data', function(chunk) {
    sData += chunk;
    //console.log('BODY: '+chunk);
  });
  res.on('end', function() {
    callback(sData);
    console.log('No more data in response.')
  })
});

req.on('error', function(e) {
  console.log('problem with request:'+e.message);
});

// write data to request body
req.write(postData);
req.end();

  // https.get(url, function(res) {
  //   var data = "";
  //   res.on('data', function (chunk) {
  //     data += chunk;
  //   });
  //   res.on("end", function() {
  //     callback(data);
  //   });
  // }).on("error", function() {
  //   callback(null);
  // });
}
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
//截取url上面的参数
function getQueryString(sUrl, name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = sUrl.match(reg);
  if(r!=null)return  unescape(r[2]); return null;
}
