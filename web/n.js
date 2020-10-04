var end_point_url = "https://zizi.rnp.app/api";
var token = window.location.hash ? null : window.location.hash.substr(1);

let common_request = obj => {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(obj.method || "GET", obj.url);
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				let respStr = xhr.responseText;
				console.log("xhr resp ", respStr);
				resolve(JSON.parse(respStr));
			} else {
				reject(xhr.statusText);
			}
		}
		xhr.onerror = () => reject(xhr.statusText);
		console.log("api was sent out: " + obj.url);
		// compose body
		var body = null;
		if(obj.body){
			console.log("urlEncodedDataPairs");
			const formData = new FormData();
			Object.entries(obj.body).forEach(([key, value]) => {
				formData.append(key, value);
			});
			body = formData;
		}
		xhr.send(body);
	});
}

function renderLisit(resp, template, list_continer) {
	var listData = resp.data.list;
	// clear all
	list_continer.innerHTML = '';
	listData.forEach(ele => {
		console.log(ele);
		var url = ele.url;
		var title = ele.title;
		var viewCnt = ele.view_cnt;
		var credate = ele.create_time;
		var c = template.content.cloneNode(true);
		// update value
		var title_dom = c.querySelector("#q_title_temp");
		title_dom.innerHTML = title;
		title_dom.setAttribute("href", url);
		console.log("url is " + url);
		c.querySelector("#q_view_cnt_temp").innerHTML = viewCnt;
		c.querySelector("#q_cre_date_temp").innerHTML = credate;
		c.querySelector("#rm_question_btn").onclick = () => rm_question(url);
		c.querySelector("#chart_btn").onclick = () => fetch_chart_api(url);
		list_continer.appendChild(c);
	});
}

function init_listener () {
	document.querySelector("#add_question").onclick = () => {
		var question_url = prompt("请输入问题的url", "https://www.zhihu.com/question/21350123");
		if (question_url != null) {
			console.log("try to add question: question_url");
		}
		var add_url = end_point_url + "/q/add";
		common_request({
			method: "post", 
			url: add_url, 
			body: {
				token: token,
				url:question_url,
				ninja:"chen"}})
		.then(resp => {
			if(resp.code !== null && resp.code === 0) {
				alert("创建成功");
				refresh_list_api();
			} else {
				if(resp && resp.msg) {
					alert(resp.msg);
				}else {
					alert("创建失败");
				}
			}
		})
	};
}

function refresh_list_api() {
	if(!token) {
		alert("没有登陆");
	}
	// list api
	var list_url = end_point_url + "/q/list?token=" + token;
	common_request({url: list_url})
	.then(resp => {
		console.log("promise finished, resp is ", resp)
		if(resp.code !== null && resp.code === 0) {
			renderLisit(resp, document.querySelector("#table_row_temp"), document.querySelector("#table_body"))
		} else {
			if(resp && resp.msg) {
				alert(resp.msg);
			}else {
				alert("请求列表接口失败");
			}
		}
	});
}

/**
 * 删除问题
 * @param {a} url 
 */
function rm_question(url) {
	console.log("rm_question..");
	if(!token) {
		alert("没有登陆");
	}
	// list api
	var url = end_point_url + "/q/rm?token=" + token + "&url=" + url;
	common_request({url: url})
	.then(resp => {
		console.log("promise finished, resp is ", resp)
		if(resp.code !== null && resp.code === 0) {
			alert("删除问题成功");
			renderLisit(resp, document.querySelector("#table_row_temp"), document.querySelector("#table_body"))
		} else {
			if(resp && resp.msg) {
				alert(resp.msg);
			}else {
				alert("删除问题失败");
			}
		}
	});
}

function fetch_chart_api(question_url) {
	console.log("fetch_chart_api..");
	if(!token) {
		alert("没有登陆");
	}
	// list api
	question_url = encodeURIComponent(question_url);
	var url = end_point_url + "/q/question_trend?token=" + token + "&url=" + question_url;
	common_request({url: url})
	.then(resp => {
		console.log("promise finished, resp is ", resp)
		if(resp.code !== null && resp.code === 0) {
			// alert("获取图标接口成功");
			renderChart(resp.data, document.querySelector("#chart_container"));
		} else {
			if(resp && resp.msg) {
				alert(resp.msg);
			}else {
				alert("请求列表接口失败");
			}
		}
	});
}

function renderChart(chartData, dom) {
	// var xList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	var xList = chartData.x_list;
	// var dataList = [820, 932, 901, 934, 1290, 1330, 1320];
	var dataList = chartData.data_list;

	var mychart  = echarts.init(dom);
	var option = {
		tooltip: {
			triger: "axis",
			axisPointer: {
				type: "cross",
				crossStyle: {
					color: "#999"
				}
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: xList
		},
		yAxis: {
			type: 'value',
			name: "浏览量"
		},
		series: [{
			data: dataList,
			type: 'line',
			areaStyle: {}
		}]
	};
	mychart.setOption(option, true);
}


function main() {
	token = (!window.location.hash ? null : window.location.hash.substr(1));
	console.log(token);
	console.log(window.location.hash);
	if(window.location.hash) {
		console.log("has hash");
	}
	if(!token) {
		console.log("ninjas没有登陆");
	}
	// init listener
	init_listener();
	refresh_list_api();
}

main();
