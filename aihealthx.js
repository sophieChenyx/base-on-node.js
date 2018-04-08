var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var app = express();

app.get('/',function(req,res,next){
	console.log('the first get outside bagin');
	
	superagent.get('www.pumch.cn/doctors.html').end(function(err,sres){
		if(err){ return next(err) }
		var $ = cheerio.load(sres.text);
//相当于 $(document).ready(function(){ //statements }) 或者 $(function(){ //statements })
		var items = [];
		console.log('in the first get beside')
		//嵌套两层循环，发出两次地址请求；
		$('.part2 .block').each(function(index,ele){
			//ele就是一个block里面的相关内容；现在一共是三个有关科室
			var $ele = $(ele);
			var departments = [];
			
			$ele.find('.box .item>.inner').each(function(index,element){
				var $element = $(element);
				var doctors = [];//加载进医生的相关的数组,要进入一个页面扒下来所有的医生，需要重新进入一个页面扒内容
			//进入该页面重新扒内容
				var href = 'www.pumch.cn'+ $element.find('.h2>a').attr('href');
								
				var partInner = []; //跳转到分页的子页的内容；

				//Promise对象函数
				new Promise(function(resolve,reject){
					superagent.get(href).end(function(err,sres){
						if(err){
							reject(err);	//获取数据失败执行的函数					
						}else{
							if(sres.status == 200){  resolve(sres); console.log('promise')}	//成功获取数据执行的函数				
						}
					});
				}).then(function(sres){
					//通过拿到的数据进行操作；
					var $ = cheerio.load(sres.text);//相当于jquery的入口函数
					var sres = sres.text;
					//able to get data ,but in here is SynacTax?????????wait to resolve
					console.log('2')
					partInner.push('sres.text'); 
					
				})
	
								
				departments.push({
					name:$element.find('.h2').text(),
					href:href,
					partInner:partInner,
					doctors:[]
				})
				
			})
			
			items.push({
				name:$ele.find('.caption').text(),
				departments:departments	
			});
			
		});
		res.send(items);
	});
	console.log('the first get outside end');
	
});

app.listen(3000,function(){
	console.log('app is running');
})
