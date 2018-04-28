function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

jQuery.getJSON = function(url, args, callback) {
	args._xsrf = getCookie("_xsrf");
    $.ajax({url: url, data: $.param(args), dataType: "text", type: "GET", success: callback});
};

jQuery.postJSON = function(url, args, callback) {
	args._xsrf = getCookie("_xsrf");
    $.ajax({url: url, data: $.param(args), dataType: "text", type: "POST", success: callback});
};

let subject = null;
let item = null;

function setNav(response) {
	element('left').innerHTML = response;
	let menu = element('leftMenu');
	menu.rows[0].click();
}

function setContent(response) {
	element('content').innerHTML = response;
}

function navigate(obj) {
	subject = obj.text();
	let url = 'html/' + subject + '.html';
	$.getJSON(url, {}, setNav);
}

function leftNav(obj) {
	item = $("td.dMcol1").first().text();
	let url = 'html/' + subject + '-' + item + '.html';
	$.getJSON(url, {}, setContent);
}

function element(id) {
	return document.getElementById(id);
}
