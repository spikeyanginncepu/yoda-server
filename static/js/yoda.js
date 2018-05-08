function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

jQuery.getJSON = function(url, args, callback) {
	args._xsrf = getCookie("_xsrf");
    $.ajax({url: url, data: $.param(args), dataType: "text", type: "GET", success: callback});
};

jQuery.postJSON = function(url, args, callback) {
    $.ajax({
		headers: {
			"X-XSRFToken":getCookie("_xsrf"),     // 如果tornado在数据中找不到xsrf就会到headers中找
		},
	    url: url,
		//data: {"_xsrf":getCookie("_xsrf")}, 
		dataType: "text", 
		type: "POST", 
		success: callback});
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

function setContent_EditPvl(response) {
	element('content').innerHTML = response;
	element('edit_users').innerHTML='修改用户'+selectuserToedit_copy+'的权限:';
}

function navigate(obj) {
	subject = obj.text();
	let url = 'html/' + subject + '.html';
	$.postJSON(url, {}, setNav);
	//$.getJSON(url, {}, setNav);
	/*$.getJSON("testjons/test.json",function(){alert("fdf")});*/
}

function leftNav(obj) {
	item = $("td.dMcol1").first().text();
	let url = 'html/' + subject + '-' + item + '.html';
	$.postJSON(url, {}, setContent);
}

function element(id) {
	return document.getElementById(id);
}

/*UM-gao */
/*todo: 请求用户列表：请求后台返回list,创建table，返回html*/
function request_userlist(){
	/*1.ajax request for the userlist and create userlist*/
	/*let usertable=new */
	$.ajax({url:"testjons/test.json",data:{},function(obj){
		if (obj.status == "ok") { 
			for (var i = 0; i < obj.data.length; i++) { 
				console.log(obj.bkdata[i]); 
			}; 
		}else{ 
			alert("返回失败"+obj.status); 
		};  
	}})
	/*页面跳转*/
	$.ajax({url:"html/用户管理-管理员权限.html",data:{},function(response){
		/*element('content').innerHTML = response;
	    element('table').innerHTML=usertable;*/
	}})
}
//类似于上
function search_userlist(){

}
/*跳转到添加用户页*/
function adduser(obj){
	let url='html/userAdding-console.html';
	$.getJSON(url,{},setContent);
}
/*todaytodo:实际添加用户*/
function adduser_do(obj){
	let username=$("input[name='username']").val();
	let passwd_1=$("input[name='passwd_1']").val();
	let passwd_2=$("input[name='passwd_2']").val();
	if(username==""){
		alert("用户名不能为空");
	}
	else if(CHK_repeatename_flag==false){
		alert("用户名已存在");
	}
	else if(passwd_1!=passwd_2){
		alert("密码不一致");
	}
	else{
		var flags=new Array(); 
		var index=0;
		$(".uAchkBox_class").each(function(){
		flags[index]=$(this).is(":checked");
		index++;
		});
		var submit_data={
		"Cookie":"username=$secret_username",
		"content": {"action": "addUser",
			          "data": {"username":username,"password":passwd_1,"authAdmin":flags[0],"authFileReadAll":flags[1],"authTaskManageAll":flags[2],"hasUserFolder":flags[3]}
					}
		}
		$.ajax({type:"get",url:"testjons/test.json",dataType:"json",data:submit_data,success:function(){
			alert(submit_data.content.action+submit_data.content.data.username+submit_data.content.data.password+submit_data.content.data.authAdmin);
		}});
	}
}
/*检测是否有重复的用户名---------------------需要与后台交互*/
let CHK_repeatename_flag=true;
function CHK_repeatename(){
	let username=$("input[name='username']").val();
	$.ajax({type:"get",url:"testjons/test.json",dataType:"json",data:{},success:function(obj){
		if (obj.status == "ok") { 
			for (var i = 0; i < obj.data.length; i++) { 
				if(obj.data[i].username==username) {
					$("#tip-1").show();
					CHK_username_flag=false;
					break;
				}
			} 
			if(i==obj.data.length){
				$("#tip-1").hide();
				CHK_username_flag=true;
			}
		}
	}});
}
/*检测密码是否合法**/
function CHK_illegalpasswd(){
	return true;
}
/*检测两次密码的输入是否相同*/
function CHK_passwd(){
	let passwd_1=$("input[name='passwd_1']").val();
	let passwd_2=$("input[name='passwd_2']").val();
	if(passwd_1!=passwd_2){
		$("#tip-2").show();
		return false;
	}
	else{
		$("#tip-2").hide();
		return true;
	}
}
/*跳转到修改用户页*/
function changepasswd(obj){
	let username=obj.parent().prev().html();
	let url='html/Change_passwd.html';
	$.getJSON(url,{},function(response) {
		element('content').innerHTML = response;
		element('change_user').innerHTML=username;
	});
}
/*todaytodo:实际修改用户*/
function changepasswd_do(obj){
	let username=$("#change_user").html();
	let passwd_1=$("input[name='passwd_1']").val();
	let passwd_2=$("input[name='passwd_2']").val();
	if(passwd_1!=passwd_2){
		alert("两次输入的密码不一致");
	}else{
		var content={
			"action": "changePassWord",
			"data": {"username":username, "oldPassword":"", "newPassword":passwd_1}
		}
		alert(username+passwd_1);
		/*$.ajax({type:"get",url:"",dataType:"json",data:submit_data,success:function(){
			
		}*/
	
	}
}
/*tocomplete:删除用户*/
function deleteuser(obj){
	var selectuserTodel=new Array();
	let num=0;
	$(".chkBox_0").each(function() {
		if($(this).is(":checked")){
			selectuserTodel[num]=$(this).parent().next().html();
			num++;
		}
	});
	/*$("input[type=checkbox][checked]").each(function(){ //由于复选框一般选中的是多个,所以可以循环输出 
		selectuserTodel[num]=$(this).val();
		num++; 
	}); 	*/
	if(selectuserTodel.length==0){
		alert("请至少选择一个需要删除的用户！")
	}
	else{
		var isconfirm=confirm("是否确认删除用户"+selectuserTodel+"的所有信息，该操作将不可恢复！");
	    if(isconfirm){
		/*to complete 发送ajax到后台，删除数据 response*/
		   alert(selectuserTodel+"用户已删除！")
		   /*to complete 跳转到用户列表*/
	    }
	}	
}
function Se_DE_Alluser(obj){
	let flag = obj.is(":checked");
    $(".chkBox_0").each(function(){ 
		  $(this).prop("checked",flag);
	});
}
/*$("#selectAll").click(function(){
	var flag = $(this).attr("checked"); 
	alert(flag);
    $("[name=chkBox_0]:checkbox").each(function() { 
    $(this).attr("checked", flag); 
	})
})
$("#CheckAll").click(function() { 
	let flag = obj.is(":checked");
    $(".chkBox_0").each(function(){ 
     $(this).attr("checked", flag); 
	})
})*/
let selectuserToedit_copy=new Array();
function edituser(obj){
	let selectuserToedit=new Array();
	let num=0;
	$(".chkBox_0").each(function() {
		if($(this).is(":checked")){
			selectuserToedit[num]=$(this).parent().next().html();
			selectuserToedit_copy[num]=$(this).parent().next().html();
			num++;
		}
	});
	if(selectuserToedit.length==0){
		alert("至少选择一个要修改的用户！")
	}
	else{
		let url='html/userEdit-console.html';
		/*下面三种方法均可实现 */
		$.ajax({url: url, data: {}, dataType: "text", type: "GET", success: function(response) {
			alert("ajax");
			element('content').innerHTML = response;
			element('edit_users').innerHTML='修改用户'+selectuserToedit+'的权限:';
		}});
		/*$.getJSON(url, {}, setContent_EditPvl);*/
		/*$.getJSON(url,{},function(response) {
			alert("fdf");
			element('content').innerHTML = response;
			element('edit_users').innerHTML='修改用户'+selectuserToedit+'的权限:';
		});*/
	}
}
/*todo*/
function edituser_do(){

}

function createCar(color, doors, mpg) {
    var tempcar = new Object;
    tempcar.color = color;
    tempcar.doors = doors;
    tempcar.mpg = mpg;
    tempcar.showColor = function () {
        alert(this.color)
    };
   return tempcar;
}
var car1;
function  init(){
	car1= createCar("red", 4, 23);
} 
function createuser(){
 
}
