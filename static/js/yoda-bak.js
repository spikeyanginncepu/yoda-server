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
Element.prototype.addFirstChild = function(newFirst) {
	if(this.hasChildNodes()) {
		this.insertBefore(newFirst, this.childNodes[0]);
	}
	else{
		this.appendChild(newFirst);
	}
}
Element.prototype.replaceFirstBy = function(newFirst) {
	if(this.hasChildNodes()){
		this.insertBefore(newFirst, this.childNodes[0]);
		this.removeChild(this.childNodes[1]);
	}
	else{
		throw "Error using function replaceFirstChild. This element does not have any children."
	}
}
Array.prototype.min = function() {
	let min = this[0];
	let len = this.length;
	for (let i = 1; i < len; i++){ 
		if (this[i] < min){ 
			min = this[i]; 
		} 
	} 
	return min;
}
Array.prototype.max = function() { 
	let max = this[0];
	let len = this.length; 
	for (let i = 1; i < len; i++){ 
		if (this[i] > max) { 
		max = this[i]; 
		} 
	}
	return max;
}
Array.prototype.unique = function(){
	var res = [];
	var json = {};
	for(var i = 0; i < this.length; i++){
		if(!json[this[i]]) {
			res.push(this[i]);
			json[this[i]] = 1;
		}
	}
	return res;
}
function copyElement(obj) {
	let newObj = obj.cloneNode();
	newObj.innerHTML = obj.innerHTML
	return newObj;
}
function trOnMouse(obj) {
	$(obj).find("button").css({"visibility": ""});
}
function trOnMouseOut(obj) {
	$(obj).find("button").css({"visibility": "hidden"});
}

/* 	parentClass: 父节点Class. 
	headings: 表格标题，形式为["全选","任务名称","开始结束"]，每一项对应一列。
	objType: 表格列定义，形式为["checkbox","text","img"],可选值仅限于button\checkbox\text\img\colorboard.
	keys: 每一列从json取值时所需的key，形式为["", "taskname","taskstatus"]
	prefix: 相关元素class前缀。table的class为prefix+"table"，标题tr的class为prefix+"table"+"_trh"，内容tr的class为prefix+"table"+"_tr"，
	td的class为prefix+"table"+"_td".
*/
class List {
	constructor(parentClass, headings, objType, keys, prefix) {
		this.parent = document.getElementsByClassName(parentClass)[0];
		this.headings = headings;
		this.objType = objType;
		this.keys = keys;
		this.rowTemplate = this.objType2RowTemplate(objType);
		this.prefix = prefix;
		this.hiddenRows = new Set();
		this.table = document.createElement("table");
		this.table.setAttribute("class", this.prefix + "table");
		this.tableClass = this.table.className;
		this.trhClass = this.tableClass + "_trh";
		this.table.setAttribute("border",1);
		this.parent.appendChild(this.table);
		this.checkallColNum = null; 
		this.setHeadings(headings);
	}
	//设置表格标题，使用方法如List.setHeadings(["全选","name","size","dateModified"])
	setHeadings(headings) {
		this.headings = headings;
		this.checkallColNum = null;
		if(this.table.hasChildNodes()){
			if(this.table.firstChild.className == this.trhClass) {
				this.table.removeChild(this.table.firstChild);
			}
		}
		if (this.headings.length > 0) {
			let rowObj = document.createElement("tr");
			rowObj.setAttribute("class", this.trhClass);
			for (let i= 0; i < this.headings.length; i++) {
				let boxObj = document.createElement("th");
				let heading = this.headings[i];
				if(heading != "全选" && heading.toLowerCase() != "check all") {
					boxObj.innerHTML = "<label>" + heading + "</label>";
				}
				else {
					boxObj.innerHTML = "<input type='checkbox'/>" + "<label>" + heading + "</label>";
					boxObj.firstChild.addEventListener("mousedown",this.checkallClick.bind(this), false);
					this.checkallColNum = i;
				}
				rowObj.appendChild(boxObj);
			}
			this.table.addFirstChild(rowObj);
		}
	}
	//This is private.
	checkallClick() {
		if (this.checkallColNum != null) {
			let checkboxes = this.getColObjs(this.checkallColNum);
			console.log(checkboxes[0][0].checked);
			if (checkboxes[0][0].checked) {
				for (let i = 1; i < checkboxes.length; i++) {
					checkboxes[i][0].checked = false;
				}
			}
			else {
				for (let i = 1; i < checkboxes.length; i++) {
					checkboxes[i][0].checked = true;
				}
			}
		}
	}
	//objType is a string array. Each string tells what kind of element node to be created.
	setObjType(objType) {
		this.objType = objType;
		this.rowTemplate = this.objType2RowTemplate(objType);
	}
	//rowTemplate is a HTML DOM array. This template determines what DOMs to fill in the table.
	setRowTemplate(rowTemplate) {
		this.rowTemplate = rowTemplate;
		this.objType = this.rowTemplate2ObjType(rowTemplate);
	}
	//This is private
	objType2RowTemplate(objType) {
		let rowTemplate = [];
		for(let i = 0; i< objType.length; i++) {
			if (objType[i] == "button") {
				let obj = document.createElement("button");
				obj.style.visibility = "hidden";
				rowTemplate.push(obj);
			}
			else if (objType[i] == "checkbox"){
				let obj = document.createElement("input");
				obj.setAttribute("type","checkbox");
				rowTemplate.push(obj);
			}
			else if (objType[i] == "text"){
				let obj = document.createElement("label");
				rowTemplate.push(obj);
			}
			else if (objType[i] == "img"){
				let obj = document.createElement("img");
				rowTemplate.push(obj);
			}
			else if (objType[i] == "colorboard"){
				let obj = new ColorBoard();
				rowTemplate.push(obj);
			}
		}
		return rowTemplate;
	}
	//This is private
	rowTemplate2ObjType(rowTemplate) {
		let objType = [];
		rowTemplate.forEach(function(value, index, array){  //当前仅支持以下5类
			if (value.nodeName == "BUTTON") {
				objType.push("button");
			}
			else if (value.nodeName == "INPUT") {
				objType.push("checkbox");
			}
			else if (value.nodeName == "LABEL") {
				objType.push("text");
			}
			else if (value[0].nodeName == "IMG") {
				objType.push("img");
			}
			else {
				objType.push("colorboard");
			}
		})
		return objType;
	}
	//This is private.
	data2Row(rowData, trClass, tdClass, objType) {
		let rowObj = document.createElement("tr");
		rowObj.setAttribute("class", trClass);
		// 根据rowTemplate定义的列表内容格式，将rowData的每一项填入新建的行内
		for(let i = 0; i < this.rowTemplate.length; i++) {
			let boxObj = document.createElement("td");
			boxObj.setAttribute("class", tdClass);
			let tdChild = copyElement(this.rowTemplate[i]);
			if (objType[i] == "button") {
				tdChild.innerHTML = rowData[i];
			}
			else if (objType[i] == "checkbox") {
                tdChild.checked = rowData[i];
			}
			else if (objType[i] == "text") {
				tdChild.innerHTML = rowData[i];
			}
			else if (objType[i] == "img") {
				tdChild.src = rowData[i];
			}
			else if (objType[i] == "colorboard") {
				//TODO
			}
			boxObj.appendChild(tdChild);
			rowObj.appendChild(boxObj);
		}
		return rowObj;
	}
	//后端json字符串转化为json对象后直接传入
	addRowsByJson(jsonData) {
		let rowsData = [];
		for(let j = 0; j < jsonData.data.length; j++){
			let value = jsonData.data[j];
			let rowData = [];
			for(let i = 0; i < this.keys.length; i++) {
				if(this.keys[i] == "") {
					rowData.push("");
				}
				else{
                    rowData.push(value[this.keys[i]]);
				}
			}
			rowsData.push(rowData);
		}
		this.addRows(rowsData);
	}
	//添加行，rowData为json处理后的数据，形式如["","春季巡检","../images/start.jpg"]
	addRow(rowData) {
		if (this.rowTemplate != null) {
			if (rowData.length != this.rowTemplate.length) {
				throw "Different length of data row and template row."
			}
			let trClass = this.tableClass + "_tr";
			let tdClass = this.tableClass + "_td";
			let rowObj = this.data2Row(rowData, trClass, tdClass, this.objType);
			rowObj.setAttribute("onmouseover","trOnMouse($(this))");
			rowObj.setAttribute("onmouseout","trOnMouseOut($(this))");
			this.table.appendChild(rowObj);
		}
		else {
			throw "You should add row template by using List.setRowTemplate() before adding rows."
		}
	}
	//添加多行
	addRows(rowsData) {
		if (this.rowTemplate != null) {
			let rowData = rowsData[0];
			if (rowData.length != this.rowTemplate.length) {
				throw "Different length of data row and template row."
			}
			let trClass = this.tableClass + "_tr";
			let tdClass = this.tableClass + "_td";
			for (let i = 0; i < rowsData.length; i++) {
				let rowObj = this.data2Row(rowsData[i], trClass, tdClass, this.objType);
				rowObj.setAttribute("onmouseover","trOnMouse($(this))");
				rowObj.setAttribute("onmouseout","trOnMouseOut($(this))");
				this.table.appendChild(rowObj);
			}
		}
		else {
			throw "You should add row template by using List.setRowTemplate() before adding rows."
		}
	}

	//获取选中行编号
	getSelRowNums() {
		let selRowNums = [];
		for (let i = 0; i < this.table.childNodes.length; i++) {
			if(this.table.childNodes[i].childNodes[this.checkallColNum].firstChild.checked == true) {
				selRowNums.push(i);
			}
		}
		return selRowNums;
	}
	//获取选中行内容
	getSelRowContents() {
		let selRowContents = [];
		let selRowNums = this.getSelRowNums();
		for(let i = 0; i < selRowNums.length; i++) {
			let trObj = this.table.childNodes[selRowNums[i]];
			let objs = []
			for(let j=0; j< trObj.childNodes.length; j++) {
				objs.push(trObj.childNodes[j].childNodes);
			}
			selRowContents.push(objs);
		}
		return selRowContents;
	}
	//Totally delete the table.
	destroy() {
		this.parent.removeChild(this.table);
	}
	//Delete a row by row number.
	deleteRow(rowNum) {
		if(this.table.hasChildNodes){
			if(rowNum < this.table.childNodes.length){
				this.table.removeChild(this.table.childNodes[rowNum]);
			}
			else{
				throw "Invalid row number."
			}
		}
		else{
			throw "Table is empty, no row deleted."
		}
	}
	//Delete rows by row numbers.
	deleteRows(rowNums) {
		rowNums = rowNums.unique();
		if(rowNums.min() >= 0 && rowNums.max() < this.table.childNodes.length){
			let childNodes = [];
			for (let i = 0; i < rowNums.length; i++){
				childNodes.push(this.table.childNodes[rowNums[i]]);
			}
			for(let i = 0; i < rowNums.length; i++){
				this.table.removeChild(childNodes[i]);
			}
		}
		else{
			throw "Invalid rows number."
		}
	}
	//Delete a column by column number.
	deleteCol(colNum) {
		if(this.table.hasChildNodes){
			for(let i = 0; i < this.table.childNodes.length; i++) {
				let rowObj = this.table.childNodes[i];
				if (colNum < rowObj.childNodes.length) {
					rowObj.removeChild(rowObj.childNodes[colNum]);
				}
			}
		}
	}
	// Hide the whole table.
	hide() {
		this.table.style.display = "none";
	}
	// Hide a row
	hideRow(rowNum) {
		if(this.table.hasChildNodes) {
			if(rowNum < this.table.childNodes.length) {
				this.table.childNodes[rowNum].style.display = "none";
				this.hiddenRows.add(this.table.childNodes[rowNum]);
			}
		}
	}
	// Hide rows given array of rows numbers
	hideRows(rowNums) {
		if(this.table.hasChildNodes){
			if(rowNums.max() < this.table.childNodes.length){
				let objs = [];
				for(let i = 0; i < rowNums.length; i++){
					objs.push(this.table.childNodes[rowNums[i]]);
				}
				objs.forEach(function(value,index,Array){
					value.style.display = "none";
					this.hiddenRows.add(value);
				})
			}
		}
	}
	// get all hidden <tr> HTML DOMs.
	getHiddenRows() {
		return this.hiddenRows;
	}
	// get all hidden rows number.
	getHiddenRowNums() {
		let rowNums = [];
		this.hiddenRows.forEach(function(value, index, array) {
			rowNums.push($(value).rowIndex);
		})
		rowNums.sort(function sortNumber(a,b){
			return a - b
		});
		return rowNums;
	}
	// unhide a row
	unhideRow(rowNum) {
		if(this.table.hasChildNodes) {
			if(rowNum < this.table.childNodes.length) {
				this.table.childNodes[rowNum].style.display = "";
				if (this.hiddenRows.has(this.table.childNodes[rowNum])) {
					this.hiddenRows.delete(this.table.childNodes[rowNum])
				}
			}
		}
	}
	//Set table's class. The table's class is prefix+"table" by default.
	setTableClass(newClass) {
		this.table.setAttribute("class", newClass);
	}
	//set class for <tr> except the heading <tr>
	setCntRowClass(newClass) {
		if(this.table.hasChildNodes) {
			if(this.table.firstChild.className == this.trhClass) {
				if(this.table.childNodes.length > 1) {
					for (let i = 1; i< this.table.childNodes.length; i++) {
						this.table.childNodes[i].className = newClass;
					}
				}
			}
			else{
				if(this.table.childNodes.length > 1) {
					for (let i = 0; i< this.table.childNodes.length; i++) {
						this.table.childNodes[i].className = newClass;
					}
				}
			}
		}
	}
	//set class for heading <tr>
	setHeadRowClass(newClass) {
		if(this.table.hasChildNodes) {
			if(this.table.firstChild.className == this.trhClass) {
				this.table.firstChild.className = newClass;
				this.trhClass = newClass;
			}
		}
	}
	//set class for all <td> in a column
	setColClass(colNum, newClass) {
		if(this.table.hasChildNodes) {
			let tableWidth = this.table.childNodes[0].childNodes.length;
			let tableHeight = this.table.childNodes.length;
			if(colNum < tableWidth) {
				for(let i = 0; i < tableHeight; i++) {
					this.table.childNodes[i].childNodes[colNum].className = newClass;
				}
			}
		}
	}
	//get the HTML DOMs inside all <td> of this row
	getRowObjs(rowNum) {
		let rowObjs = [];
		if (rowNum < this.table.childNodes.length) {
			let rObj = this.table.rows[rowNum];
			let boxContainers = rObj.childNodes;
			for(let i=0; i<boxContainers.length; i++) {
				rowObjs.push(boxContainers[i].childNodes);
			}
		}
		else {
			throw "Invalid row number."
		}
		return rowObjs;
	}
	//get multiple rows' DOMs
	getRowsObjs(rowNums) {
		let rowsObjs = [];
		for(let i = 0; i < rowNums.length; i++) {
			rowsObjs.push(this.getRowObjs(rowNums[i]));
		}
		return rowsObjs;
	}
	//get items inside all <td> of this column
	getColObjs(colNum) {
		if(this.table.hasChildNodes) {
			let tableWidth = this.table.childNodes[0].childNodes.length;
			let tableHeight = this.table.childNodes.length;
			let colObjs = [];
			if(colNum < tableWidth) {
				for(let i = 0; i < tableHeight; i++) {
					colObjs.push(this.table.childNodes[i].childNodes[colNum].childNodes);					
				}
			}
			else{
				throw "Invalid column number."
			}
			return colObjs;
		}
	}
	//get the item inside a certain <td>
	getOneBox(rowNum, colNum) {
		let box = this.table.rows[rowNum].cells[colNum];
		return box.childNodes;
	}
	// table's html
	getHtml() {
		return this.table.outerHTML;
	}
}
/* 	parentClass: 父节点Class. 
	headings: 表格标题，形式为["全选","任务名称","开始结束"]，每一项对应一列。
	objType: 表格列定义，形式为["checkbox","text","img"],可选值仅限于button\checkbox\text\img\colorboard.
	keys: 每一列从json取值时所需的key，形式为["", "taskname","taskstatus"]
	prefix: 相关元素class前缀。table的class为prefix+"table"，标题tr的class为prefix+"table"+"_trh"，内容tr的class为prefix+"table"+"_tr"，
	td的class为prefix+"table"+"_td".
*/
/*UM-gao */
/*todo: 请求用户列表：请求后台返回list,创建table，返回html*/
function request_userlist(){
    $.ajax({url:"html/用户管理-管理员权限.html",data:{},dataType:"text",success:function(response){
        element('content').innerHTML = response;
        var parentClass="UM_userList";
        var heading_par=["全选","用户名","修改密码","管理员权限","所有文件读写权限","任务管理权限","创建个人目录"];
        var objType=["checkbox","text","button","checkbox","checkbox","checkbox","checkbox"];
        var keys=["","username","","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"];
        var prefix="UM_userlist";
	    $.ajax({url:"testjons/test-ulist.txt",dataType:"json",data:{},success:function(obj){
		    if (obj.status == "ok") { 
                var userlist=new List(parentClass,heading_par,objType,keys,prefix);
                userlist.addRowsByJson(obj);
               /// for (var i = 0; i < obj.data.length; i++) { }; 
               $("."+prefix+"table_td button").each(function(){
                   $(this).attr("class","UM_ulistbtn");
                   $(this).click(function(){ changepasswd($(this))});
                   $(this).html("修改密码");
               });
               $("."+prefix+"table_tr").each(function(){
                $(this).children("td:eq(0)").children("input").attr("class","chkBox_0");
                $(this).children("td:eq(3)").children("input").attr("disabled",true);
                $(this).children("td:eq(4)").children("input").attr("disabled",true);
                $(this).children("td:eq(5)").children("input").attr("disabled",true);
                $(this).children("td:eq(6)").children("input").attr("disabled",true);
                });
		    }else{ 
			    alert("返回失败"+obj.status); 
		    };  
	     }})
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
    else if(passwd_1==""){
        alert("密码不能为空");
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
		var content= {"action": "addUser",
			          "data": {"username":username,"password":passwd_1,"authAdmin":flags[0],"authFileReadAll":flags[1],"authTaskManageAll":flags[2],"hasUserFolder":flags[3]}
				 	 }
		$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-add.txt",dataType:"json",data:content,success:function(obj){
            if(obj.status=="ok"){
                alert("添加用户成功："+content.action+content.data.username+content.data.password+content.data.authAdmin);
                request_userlist();
            }else{
                alert(obj.status);
            }
		}});
	}
}
/*检测是否有重复的用户名---------------------需要与后台交互*/
let CHK_repeatename_flag=true;
function CHK_repeatename(){
	let username=$("input[name='username']").val();
	$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-ulist.txt",dataType:"json",data:{},success:function(obj){
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
	let username=$("#change_user").text();
	let passwd_1=$("input[name='passwd_1']").val();
    let passwd_2=$("input[name='passwd_2']").val();
    if(passwd_1==""){
        alert("密码不能为空");
    }
	else if(passwd_1!=passwd_2){
		alert("两次输入的密码不一致");
	}else{
		var content={
			"action": "changePassWord",
			"data": {"username":username, "oldPassword":"", "newPassword":passwd_1}
		}
		$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-changepwd.txt",dataType:"json",data:content,success:function(obj){
            if(obj.status=="ok"){
                alert("修改用户"+obj.username+"密码成功。新密码："+passwd_1);
            }else{
                alert(obj.status);
            }
		}});
    }
}
/*tocomplete:删除用户*/
function deleteuser(obj){
	var selectuserTodel=[];
    let num=0;
	$(".chkBox_0").each(function() {
		if($(this).is(":checked")){
			selectuserTodel[num]=$(this).parent().next().text();
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
           var content={"action": "deleteUser","data": {"username":selectuserTodel,"delUserFolder":"true"}};
           $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-del.txt",data:{},dataType:"json",success:function(obj){
               if(obj.status=="ok"){
                $(".chkBox_0").each(function() {
                    if($(this).is(":checked")){
                        $(this).parent().parent().remove(); /*to complete 跳转到用户列表*/
                    }
                });
                alert(selectuserTodel+"用户已删除！");
               }
               else{
                alert(obj.status);
               }  
           }});
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
			selectuserToedit[num]=$(this).parent().next().text();
			selectuserToedit_copy[num]=$(this).parent().next().text();
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
			element('content').innerHTML = response;
            element('edit_users').innerHTML='修改用户'+selectuserToedit+'的权限:';
            var parentClass="UE_fileList";
            var heading_par=["文件列表","读权限","写权限"];
            var objType=["text","checkbox","checkbox"];
            var keys=["fileName","",""];
            var prefix="UE_permission";
            $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"testjons/test-edit.txt",data:{},dataType:"json",type: "post",success:function(obj){
                    if (obj.status == "ok") { 
                        var filelist=new List(parentClass,heading_par,objType,keys,prefix);
                        filelist.addRowsByJson(obj);
                       /*$("."+prefix+"table_td button").each(function(){
                           $(this).attr("class","UM_ulistbtn");
                           $(this).click(function(){ changepasswd($(this))});
                           $(this).html("修改密码");
                       });
                       $("."+prefix+"table_tr").each(function(){
                        $(this).children("td:eq(0)").children("input").attr("class","chkBox_0");
                        });*/
                    }else{ 
                        alert("返回失败"+obj.status); 
                    };  
                }
            });
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
