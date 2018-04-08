
var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');

var app = express();

app.get('/',function(req,res,next){
	superagent.get('http://www.pumch.cn/doctors.html').end(function(err,sres){
		if(err){return next(err)}
		var $ = cheerio.load(sres.text);
		var items = [];
		$('#topic_list .topic_title').each(function(index,ele){
			var $element = $(ele);
			items.push({
				title:$element.attr('title'),
				href:$element.attr('href')
			});
		});
		
		res.send(items);
	})

});



app.listen(3000,function(){
	console.log('running');
})


