$(infoFn);

var iNowPage = 1,
    oNewData,
    $add = $('#add'),
    bClick = false;

function infoFn () {

  //加载更多
  $add.click(function(){
    if (!bClick) {
      return;
    }
    if(iNowPage<oNewData.length){
      loadDataIngFn();
      //getDateFn(++iNowPage);
      arcFn(oNewData,++iNowPage);
    }else{
      loadDataNoFn();
    }
  });

  getDateFn();

}

function getDateFn(){
  $.ajax({
   type:"GET",
   url:'./public/knowledge.json?t='+ (new Date()).getTime(),
   dataType: "json",
   success: function (data) {

     oNewData = data;
     arcFn(oNewData,iNowPage);
     bClick = true;
   }
  });

}
function arcFn(d,iNow) {
  loadDataEndFn();
  var reg3 = /\/0\?wx_fmt\=jpeg/g;
  var sHtml = '';
  var data = d[iNow];

  for (var i = 0; i < data.items.length; i++) {

    if(i%2 === 0){
      sHtml += '<div class="border-bottom">'+
        '<div class="first-left">';
    }else{
      sHtml += '<div class="first-right" style="width:550px;">';
    }
    console.log('http://weixin.sogou.com'+$($.parseXML(data.items[i])).find('url').text());
    //$($.parseXML(data.items[i])).find('url').text()
    sHtml += '<a style="display:block;width: 550px;height:140px;" href="'+ 'http://weixin.sogou.com'+d['link'][iNow][i] +'" target="_blank">'+
          '<span style="border: 1px solid #ddd;margin:20px 0 0 20px;vertical-align: middle;display:inline-block;width:100px;height:100px;overflow:hidden;"><img style="left: -25px;margin-top:0;height:100%" src="public/images/'+ $($.parseXML(data.items[i])).find('imglink').text().substring(27).toString().replace(reg3, "") +'.jpg" alt="" /></span>'+
          '<p style="vertical-align: middle;height:24px;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">'+ $($.parseXML(data.items[i])).find('title').text() +'</p>'+
        '</a>'+
     '</div>';

    if(i%2 != 0){
      sHtml += '</div>';
    }

  }
  $(sHtml).insertBefore($add);
}

function loadDataIngFn(){
  $add.text('正在加载...');
}
function loadDataEndFn(){
  $add.text('加载更多');
}
function loadDataNoFn(){
  $add.text('没有相关数据');
  setTimeout(function(){$add.hide()},1000);
}
