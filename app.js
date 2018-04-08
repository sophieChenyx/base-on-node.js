	
var express = require('express');
var utility = require('utility');


var app = express();

app.get('/',function(req,res){	
	var q = req.query.q;
//get 方式的请求需要使用request.query来取得相关变量的值。而post请求方式则是通过request.From 来获取变量的值，get请求提交的数据是放置在url之后的，而post请求则是通过request.From来获取变量的值的。
	var md5Value = utility.md5(q);
//使用utility实现字符串加密；
	res.send(md5Value);
	//res.send('hello world');结束循环响应

})

app.listen(3000,function(){ console.log('app is listening at port 3000'); });

//http://localhost:3000/?q=20就可以看到包装后的结果



