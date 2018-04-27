function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

jQuery.postJSON = function(url, args, callback) {
	args._xsrf = getCookie("_xsrf");
    //$.ajax({url: url, data: $.param(args), dataType: "text", type: "POST", 
    $.ajax({url: url, data: $.param(args), dataType: "text", type: "GET", success: callback});
};

let subject = null;
let item = null;

function setNav(response) {
	element('left').innerHTML = response;
}

function navigate(obj) {
	subject = obj.text();
	let url = 'html/' + subject + '.html';
	$.postJSON(url, {}, setNav);
}

function element(id) {
	return document.getElementById(id);
}
