//使用eventproxy 控制并发

const eventproxy = require('eventproxy');
const superagent = require('superagent');
const cheerio = require('cheerio');


const url = require('url')


const cnodeUrl = 'https://cnodejs.org/'


superagent.get(cnodeUrl).end((err,res)=>{
	var $ = cheerio.load(res.text);
	var topicUrls = [];
	
	$('#topic_list .topic_title').each((index,ele)=>{
		var $ele = $(ele);
		var href = url.resolve(cnodeUrl,$ele.attr('href'));
		topicUrls.push(href);
	})
	
	var eq = new eventproxy();

	eq.after('topic_html',topicUrls.length,function(topics){
		topics = topics.map(function(topicPair){
			var topicUrl = topicPair[0];
			var topicHtml = topicPair[1];
			var $ = cheerio.load(topichtml);
			
			return({
				title:$('.top_full_title').text().trim(),
				href:topicUrl,
				comment1:$('.reply_content').eq(0).text().trim()
			})
		});
		console.log(topics)
			
	})

})







