//  當前的代碼的重構 

//---------------以下部分爲demo part ----------------------------
//var superagent = require('superagent');
//var p1 = function(a,b){
//	console.log(a + b);
//	return new Promise(function(resolve,reject){
//		superagent.get('https://baidu.com').end(function(err,res){
//			if(err){
//				reject(err);
//			}else{
//				if(res.status == 200){ console.log('now is in promise');resolve(1)}
//			}		
//		})	
//	})
//
//}
//p1(1,2).then(function(val){ console.log(val) },function(error){  })

var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');


var app = express();

app.get('/',function(req,res,next){

	//第一个被处理的Promise,这里的顺序是按照promise的语法顺序执行的，之外的函数和方法是按照node 的异步处理的；
	new Promise(function(resolve,reject){
		superagent.get('www.pumch.cn/doctors.html').end(function(err,sres){
			if(err){
				reject(new Error(err));
			}else{
				//第一步传给then函数的是href,其他的步骤都在这个函数里面执行完毕
				var items = [];
				var $ = cheerio.load(sres.text);
				$('.part2 .block').each(function(index,ele){
					var $ele = $(ele);
					var departments = [];
					$ele.find('.box .item>.inner').each(function(index,element){
						var $element = $(element);
						var href = 'www.pumch.cn' + $element.find('.h2>a').attr('href');
						departments.push({						
							name:$element.find('.h2').text(),
							href:href
						})
					});
					items.push({
						name:$ele.find('.caption').text(),
						departments:departments
					})
									
				});
				resolve(items);
				
			}
		});
		
	
	}).then(function(items){
		//现在所获得的参数值是Promise中所生成的Items内容包括 name 和 departments,departments 下有name ,href,现在对所有的href 发出新的请求； 
		//执行一个Promise函数  返还的就是一个Promise对象

		for(let i in items){
			var item = items[i];
			item.departments.forEach(function(item){
				console.log('i =>' + i)
				var doctors = [];
				var href = item.href;
				//href为我们要进行对医生的遍历搜索的一项,对这个页面发送请求得到我们想要的消息
				//要在当前的数组中一次添加 doctors数组，数组中包括doctorName 和 doctorHref
				console.log('1');//要让1,2,3，循环输出,但是现在是1不断的执行完了才执行2,3
				//在这里我们需要将  awite 以下return 的结果，大的循环做完以后再传回items 的值；
				new Promise(function(resolve,reject){
					superagent.get(href).end(function(err,sres){
						var $ = cheerio.load(sres.text);
						doctors.push({
							name:1,
							others:2
						});
						console.log('2');
						resolve(doctors)
					})
				}).then(function(doctors){
					item.doctors = doctors;
					console.log(item);
					console.log('3')
				})				
			
				//superagent.get(href).end(function(err,sres){
				//	//第一个page中得到的信息，第二个page中得到的信息，and so on,这就又是异步的了
				//	var $ = cheerio.load(sres.text);
					
				//	doctors.push({
				//		name:1,
				//		other:2		
				//	});
				//	item.doctors = doctors;	
				//					
				//})			
			})
			
		}
		
		return items;
		//开始用promise包裹这些想要的数据的吧；
		
		
	},function(err){ console.error('Error',err )}).then(function(items){
		
		res.send(items);
	})
	

})

app.listen(3000,function(){
	console.log('3000 port is running')
})
