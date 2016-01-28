# node_crawl_sogouWX #
node抓取搜狗微信公众账号文章列表

## 依赖环境 ##
1. node
2. python

## 使用方法 ##

1. 第一步就是在当前路径打开cmd
2. 输入如下代码
<pre>npm install</pre>
3. 输入如下代码
<pre>node getInfo</pre>
4. 注意里面的路径需要改成用户形式

## 功能 ##
1. getInfo_over_bak 一种实现方式，接口爬到本地
2. getInfo 主程序(调去搜狗接口) 存在的问题是，getInfoFn方法中的接口还是有问题
3. timeDownload 带有定时任务的
4. getInfoWX 主程序(调去微信接口) 存在的问题是，key不好生成
