var end_point_url = "http://localhost:8000";

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
		var url = ele.question_url;
		var title = ele.title;
		var viewCnt = ele.view_cnt;
		var credate = ele.create_time;
		var c = template.content.cloneNode(true);
		// update value
		var title_dom = c.querySelector("#q_title_temp");
		title_dom.innerHTML = title;
		title_dom.setAttribute("href", url);
		c.querySelector("#q_view_cnt_temp").innerHTML = viewCnt;
		c.querySelector("#q_cre_date_temp").innerHTML = credate;
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
				token: "674b514b0fe47c51ce416044bad2423a",
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
	// list api
	var list_url = end_point_url + "/q/list?token=674b514b0fe47c51ce416044bad2423a";
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

function main() {
	// init listener
	init_listener();
	refresh_list_api();
}

main();
