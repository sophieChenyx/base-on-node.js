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
		//基本的逻辑就是 每个请求循环中的结果必须完成，才能进行到下一步的then 中
		const getResData = (href) =>{
			return new Promise((resolve,reject)=>{
				//await 函数返回了一个对象,好了现在可以了因为我已经拿到单个的href了。
				var doctors = [];
				superagent.get(href).end((err,sres)=>{
					if(err){reject(err)}
					var $ = cheerio.load(sres.text);
					//根据医生总数确定有几个分页
					var totalDocs = parseInt($('.body_box.dorctorlist .part1 .s2').text()),//医生总数
					page = Math.ceil(totalDocs/10),//一共有page个页面
					hrefStr = href.split('.html')[0] + '/p/',
					hrefs =[];
					//将分页放入组里
					for(let i = 1;i<= page;i++){
						hrefs.push(hrefStr + i + '.html')
					}
					//对整页医生的独立信息的链接进行保存；然后再对每一页进行serach
					//当前需要遍历循环的有Page页面的医生，对每个页面遍历然后保存到doctors里面
					
					//===========================????????????????????bug?????=========================
					const hrefsAwait = (link)=>{
						//对单页面进行访问，然后添加到doctors 对象中
						return new Promise((resolve,reject)=>{
							superagent.get(link).end((err,sres)=>{
								var $ = cheerio.load(sres.text);
								console.log('end')
							//录入每一个医生的相关信息
								//$('.body_box.dorctorlist  .datalist').find('.item').each((index,ele)=>{
								//	var $ele = $(ele),
								//	docHref = 'www.pumch' + $ele.find('a').attr('href'),
								//	docName = $ele.find('.info>.inline>.h2').text();
								//	doctors.push({ docHref:docHref,docName:docName})
								//})					
							})

						})
						
				
					}

					async function hrefsFun(hrefs){
						try{
							for(let j = 0;j < hrefs.length;){
								console.log(j);
								var link = hrefs[j];
								//对其中的每一个单页面进行访问，await函数中循环添加到doctors对象下
								var val =  await hrefsAwait(link);
								j++;
							}

						}catch(err){console.log('Error is',err)}
						
					} 
					
					
					
					//doctors.push({ hrefs:hrefs })
					hrefsFun(hrefs);
					resolve(doctors);
					return doctors;
					
				});
				
			})
			//.then((doctors)=>{
				
			//});
		}
		

		async function asyncFun(items){
			try{				
				for(let i in items){
					var item = items[i];
					//item.departments.forEach(async (item)=>{
					//	try{
					//		console.log('2')
					//		var doctors=[],href=item.href;console.log('item.href begin');
					//		var val = await test();

					//	}catch(err){console.error('Error:',err)}
					//	
					//});//***************所以说大bug是不能用foreach********
					//==用for循环尝试
					var obj = item.departments;
					for(let i in obj){
						//这里面现在是单个小对象，需要将这些每一个下面挂入doctors
						var href = obj[i].href;
						var doctors = await getResData(href);
						obj[i].doctors = doctors;
						
					}	
				}
				
				
		
			return items
	
			}catch(err){console.log(err)}
		}

		
		//return 给then函数中的值，async函数返回的其实就是一个promise对象
	 	return asyncFun(items)
		
		
	},function(err){ console.error('Error',err )})
		.then(function(items){
			
			res.send(items);
		})
	

})

app.listen(3000,function(){
	console.log('3000 port is running')
})
