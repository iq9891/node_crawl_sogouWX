var phantom = require('phantom');
var fs= require('fs');
var phantomProxy = require('phantom-proxy');

// phantom.create("--web-security=no", "--ignore-ssl-errors=yes", { port: 12345 }, function (ph) {
//     ph.createPage(function(page) {
//         console.log("Page created!")
//         page.open("http://weixin.sogou.com/gzh?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext=A77vTFKGmhESQdwnz0RYkLVEH6Rj2S2GzcJbZ8qcXbKLdZjUcH-9elNSLoBy1A5e", function (status) {
//             if (status == "success") {
//                 page.evaluate(
//                     function(selector) {
//                         var sHtml = document.querySelector(selector).innerHTML;
//                         return sHtml
//                     }
//                   , function(result) {
//                       fs.writeFile('html.json', result, function (err) {
//                         if (err) throw err;
//                         console.log('It\'s saved!'); //文件被保存
//                       });
//                       //console.log("The element contains the following text: "+result)
//                     }
//                   , "html"
//                 )
//                 //page.close()
//                 //phantom.exit();
//                 ph.exit(1);
//             }
//         })
//     })
// })
phantomProxy.create({}, function (proxy) {
    var page = proxy.page;

    page.open('http://weixin.sogou.com/gzh?openid=oIWsFt-RSUolht8Bi8IHvmLW_KMk&ext=A77vTFKGmhESQdwnz0RYkLVEH6Rj2S2GzcJbZ8qcXbKLdZjUcH-9epB5eQHxgvp_', function () {
       //console.log(page);
        page.waitForSelector('.img_box2', function () {
            console.log('body tag present');
            page.evaluate(
                 function(selector) {
                   //console.log(selector);
                     var sHtml = document.querySelector(selector).innerHTML;
                     return sHtml
                 }
               , function(result) {
                 //console.log(result);
                   var sNew = result.replace(/\&amp\;/g,'');
                   fs.writeFile('html.json', sNew, function (err) {
                     if (err) throw err;
                     console.log('It\'s saved!'); //文件被保存
                   });
                   //console.log("The element contains the following text: "+result)
                 }
               , "html"
             )
            proxy.end(function () {
                console.log('done');
            });
        });
    });
});
