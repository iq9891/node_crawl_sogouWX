//做的事情
//1.从搜狗搜索中下载吆喝科技公众账号的图片地址，文章标题，文章链接，存入 knowledge.json 文件
//2.把图片从网上下到本地存入 knowledgeImg 文件夹中

var cheerio = require("cheerio");
var http = require("http");
var fs= require('fs');
var gs = require('nodegrass');

function download(url, callback) {
  //'http://192.168.1.119/tongbuWX/html.json'
  http.get('http://192.168.1.119/tongbuWX/html.json', function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      //将数据存入json文件
      // fs.writeFile('/Applications/XAMPP/xamppfiles/htdocs/weixinJson/html.json', JSON.stringify(data), function (err) {
      //   if (err) throw err;
      //   console.log('It\'s saved!'); //文件被保存
      //   http.get('http://192.168.1.119/tongbuWX/html.json', function(res) {
      //     var data = "";
      //     res.on('data', function (chunk) {
      //       data += chunk;
      //     });
      //     res.on("end", function() {
      //       callback(data);
      //     });
      //   }).on("error", function() {
      //     callback(null);
      //   });
      // })
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });

}

var url = "http://weixin.sogou.com/weixin?type=1&query=%E5%90%86%E5%96%9D%E7%A7%91%E6%8A%80&ie=utf8&w=01019900&sut=0&sst0=1453965975472&lkt=0%2C0%2C0&ie=utf8?t="+ (new Date()).getTime();
var oNew = {link:{}};  //存储数据
var iNowPage = 1;
var iAllPage = 5;

download(url, function(data) {
  if (data) {

    if (data[0] === '<') {
      console.log('302 Found 错误');
      return;
    }

    var $ = cheerio.load(data);
    var sUrl = $('#sogou_vr_11002301_box_0').attr('href');

    var aUrl = sUrl.split('?');
    console.log(aUrl);
    downDateFn (iNowPage,aUrl);

    function downDateFn (iNow,aUrl) {
      if (iNow === 2/*iAllPage+1*/) {
        //将数据存入json文件
        fs.writeFile('../adhoc_site/app/public/knowledge.json', JSON.stringify(oNew), function (err) {
          if (err) throw err;
          console.log('It\'s saved!'); //文件被保存
        })
        return;
      }
      oNew['link'][iNow] = [];
      getInfoFn (iNow,aUrl, function () {
        downDateFn (++iNow,aUrl)
      });
    }

  }
  else console.log("error67");
});
function getInfoFn (iNow,aUrl,cb) {
  gs.get('http://192.168.1.119/tongbuWX/ext'+ iNow +'.json', function(d){
  //console.log('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime());
  //gs.get('http://weixin.sogou.com/gzhjs?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext='+ getQueryString(aUrl[1], "ext") +'&cb=arcFn&page='+ iNow +'&t='+ (new Date()).getTime() +'&_='+ (new Date()).getTime(), function(d){
    fs.writeFile('/Applications/XAMPP/xamppfiles/htdocs/tongbuWX/ext'+ iNow +'.json', d, function (err) {
      if (err) throw err;
      console.log('It\'s saved!'); //文件被保存
      fs.readFile('/Applications/XAMPP/xamppfiles/htdocs/tongbuWX/ext'+ iNow +'.json', 'utf8', function (err,d) {
        if (err) throw err;
        console.log('It\'s get ext!'); //文件被保存
        var oldUrl = d.match(/\{(.+?)\]\}/g);
        var oData = JSON.parse(oldUrl);
        oNew[iNow] = oData;
        var reg = /\<imglink\>(.+?)\<\\\/imglink\>/g;
        var sLink = d.match(reg);
        var reg2 = /\<imglink\>\<\!\[CDATA\[|\]\]\>\<\\\/imglink\>/g;
        var sText = sLink.toString().replace(reg2, "");
        var aText = sText.split(',');
        var sLink = d.match(/\<url\>(.+?)\<\\\/url\>/g);
        var sUrlLink = sLink.toString().replace(/\<url\>\<\!\[CDATA\[|\]\]\>\<\\\/url\>/g, "");
        var aUrlLink = sUrlLink.split(',');
        oNew['link'][iNow] = aUrlLink;

        // for (var i = 0; i < aText.length; i++) {
        //   sImgFn (oNew[iNow],iNow, i+'' ,aText);
        // }

        //执行回调函数
        if (cb) {
          cb();
        }
        //第一次到时候给数据加长度
        if (iNow===1) {
          oNew['length'] = iAllPage = oData.totalPages;
        }
      })
    })


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
          fs.writeFile("../adhoc_site/app/public/images/"+ sNewName +".jpg", imgData, "binary", function(err){
              if(err){
                  console.log(err);
                  return;
              }
              console.log("down success:"+sNewName);
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
