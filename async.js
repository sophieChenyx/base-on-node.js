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
						
					//===========================????????????????????bug?????=========================
					//const hrefsAwait = (link)=>{
						//对单页面进行访问，然后添加到doctors 对象中
						
					//	return new Promise((resolve,reject)=>{
					//		superagent.get(link).end((err,sres)=>{
					//			var $ = cheerio.load(sres.text);
							//录入每一个医生的相关信息:出现了一个两个小时都没有解决掉的Bug 就是
					//			$('.part1 #datalist').find('.item').each(function(index,ele){
					//				var $ele = $(ele);
					//				var docHref = 'www.pumch' + $ele.find('a').attr('href');
					//				var docName = $ele.find('.info>.inline>.h2').text();
					//				doctors.push({ docHref:docHref,docName:docName})
					//			})	
					//					
					//		})
					//	})//.then(()=>{})
						
					//}

					//async function hrefsFun(hrefs){
					//	try{	
					//		let len = hrefs.length;
					//		for(let link of hrefs){
								//对其中的每一个单页面进行访问，await函数中循环添加到doctors对象下
					//			var val =  await hrefsAwait(link);

					//		}
							//let i = 0,len = hrefs.length;	
							//while(i<len){
							//	var link = hrefs[i];
							//	var val =  await hrefsAwait(link);
							//	console.log(i)
							//	i++;							
							//}
							
					//	}catch(err){console.log('Error is',err)}
						
					//} 
					
					//hrefsFun(hrefs)//.then(()=>{console.log('async fun has end')})
					resolve(hrefs);//不能直接return ，否则就只有单次循环
					
				});
				
			})
			.then((hrefs)=>{
				return hrefs
			});
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
						var hrefs = await getResData(href);
						obj[i].hrefs = hrefs;
					}	
					
				}
				
				
		
			return items
	
			}catch(err){console.log(err)}
		}

		
		//return 给then函数中的值，async函数返回的其实就是一个promise对象
	 	return asyncFun(items)
		
		
	},function(err){ console.error('Error',err )}).then(function(items){
			//拿到items对象,循环请求每一个href然后给doctors上绑定一个可以生成的对象,再吧items和images文件导出
			//const messageReq = (link) =>{
			//	return new Promise((resolve,reject)=>{
			//		console.log('显示正常')
			//		superagent.get(link).end((err,sres)=>{
			//			console.log('2')
						//var $ = cheerio.load(sres.text)
						//返回的是从link 中获取到相关的数据,同时导出
			//		})				
			//	})
			//}
			//const num = (link)=>{
			//	return new Promise((resolve,reject)=>{  })
			//	console.log(link)			
			//}
			//async function itemsFun(items){
			//	for(let item of items){
			//		let departments = item.departments
			//		for(let docs of departments){
			//			let doctors = docs.doctors;
			//			for(let doc of doctors){
			//				let link = doc.docHref;
			//				console.log('1')
			//				let docMessage = await messageReq(link);//只显示到2
			//				console.log('3')
			//				doc.docMessage = '4';
			//			}	
			//		}
			//	}

			//}
			
			//itemsFun(items).then(()=>{console.log('has finished')})


			//--------------------现在是遍历hrefs来获取返回的值；获取到href给department,当前可以获取到一个系中的所有医生的信息
			const hrefsAwait = (link)=>{
				//对单页面进行访问，然后添加到doctors 对象中		
				return new Promise((resolve,reject)=>{
					superagent.get(link).end((err,sres)=>{
						var $ = cheerio.load(sres.text);
						var simpleDocs = [];//单页面中的所有的docs信息
					//录入每一个医生的相关信息:出现了一个两个小时都没有解决掉的Bug 就是
						$('.part1 #datalist').find('.item').each(function(index,ele){
							var $ele = $(ele);
							var docHref = 'www.pumch' + $ele.find('a').attr('href');
							var docName = $ele.find('.info>.inline>.h2').text();
							simpleDocs.push({ docHref:docHref,docName:docName})			
						})
						resolve(simpleDocs)
					})
				}).then((simpleDocs)=>{ return simpleDocs })
						
			}

			async function link(items){
				for(let item of items){
					var departments = item.departments;
					for(let department of departments){
						var doctors = [];
						var hrefs = department.hrefs;
						var len = hrefs.length;
						
						for(let i=0;i<hrefs.length;i++){
							var link = hrefs[i];
							//得到一个doctors的对象，挂到 department 下；//此时返回的是一个单页面中的医生信息，累加就好了
							var simpleDocs = await hrefsAwait(link);
							doctors = doctors.concat(simpleDocs);
						}
						department.doctors = doctors;
					}
				}
				return items
			}

			return link(items)//.then((item)=>{ return items })
			
		}).then((items)=>{	
			//最后显示的items的输出	此时已经有了所有医生的详情信息；我觉得总是这样循环是不是不太好

			async function message(items){
				for(let item of items){
					var departments = item.departments;
					for(let department of departments){
						var doctors = [];
						var hrefs = department.hrefs;
						var len = hrefs.length;
						
						for(let i=0;i<hrefs.length;i++){
							var link = hrefs[i];
							//得到一个doctors的对象，挂到 department 下；//此时返回的是一个单页面中的医生信息，累加就好了
							var simpleDocs = await hrefsAwait(link);
							doctors = doctors.concat(simpleDocs);
						}
						department.doctors = doctors;
					}
				}
				return items
			}

			//messaage(items)

			//return items;
			res.send(items);
				
		})//.then((items)=>{ res.send(items); })
	

})

app.listen(8000,function(){
	console.log('port is running')
})
