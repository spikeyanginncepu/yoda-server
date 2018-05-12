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
		dataType: "json", 
		type: "POST", 
		success: callback});
};

let subject = null;
let item = null;
let fileList = null;
function setNav(response) {
	element('left').innerHTML = response;
	let menu = element('leftMenu');
	menu.rows[0].click();
}

function setContent(response) {
	element('content').innerHTML = response;
	switch(subject) {
		case "数据管理":
			$(".dMfileList").empty();
			dmFileList();
			break;
		case "任务管理":
			break;
		case "用户管理":
			break;
	}
}

function setContent_EditPvl(response) {
	element('content').innerHTML = response;
	element('edit_users').innerHTML='修改用户'+selectuserToedit_copy+'的权限:';
}

function navigate(obj) {
	subject = obj.text();
	let url = 'html/' + subject + '.html';
	//$.postJSON(url, {}, setNav);
	$.getJSON(url, {}, setNav);
	/*$.getJSON("testjons/test.json",function(){alert("fdf")});*/
}

function leftNav(obj) {
	item = $("td.dMcol1").first().text();
	let url = 'html/' + subject + '-' + item + '.html';
	$.getJSON(url, {}, setContent);
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
	let res = [];
	let json = {};
	for(let i = 0; i < this.length; i++){
		if(!json[this[i]]) {
			res.push(this[i]);
			json[this[i]] = 1;
		}
	}
	return res;
}
function copyElement(obj) {
	let newObj = obj.cloneNode();
	newObj.innerHTML = obj.innerHTML;
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
		this.checkallColNum = null;  //全选所在列的序号
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
				// let truefalse = rowData[i];
				// if(typeof rowData[i] == "string") {
				// 	truefalse = eval(rowData[i].toLowerCase());
				// }
				// tdChild.checked = truefalse;
				if(rowData[i]=="mixed"){
					tdChild.indeterminate = true;
				}
				else if(rowData[i]=="true"){
					tdChild.checked = true;
				}
				else {
					tdChild.checked = false;
				}
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
/*let filter_content=$("#dMsrchPrintbox").val();
    //alert(filter_content);
    let filterOfAnd_content=[];
    if(filter_content!=""){
        filterOfAnd_content.push({"filterName":"username","content":filter_content});
    }
    var content={
        "action": "requestUserList",
        "data": {"column":["username","children","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"],
                "root": "/",
                "filterOfAnd":filterOfAnd_content,//"filterOfAnd": [{"filterName":"username","content":"zhang"}]
                "orderBy":"username",
                "loadDepth": "1",
                "limits":[1,-1]
                }
     }*/
    var content={
        "action": "requestUserList",
        "data": {"column":["username","children","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"],
                "root": "/",
                "filterOfAnd":[],
                "orderBy":"username",
                "loadDepth": "1",
                "limits":[1,-1]
                }
     }
    // alert(JSON.stringify(content));
    $.ajax({url:"html/用户管理-管理员权限.html",data:{},dataType:"text",success:function(response){
        element('content').innerHTML = response;
        var parentClass="UM_userList";
        var heading_par=["全选","用户名","修改密码","管理员权限","所有文件读写权限","任务管理权限","创建个人目录"];
        var objType=["checkbox","text","button","checkbox","checkbox","checkbox","checkbox"];
        var keys=["","username","","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"];
        var prefix="UM_userlist";
	    $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-ulist.txt",dataType:"json",data:JSON.stringify(content),success:function(obj){
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
function search_userlist(){
    let filter_content=$("#dMsrchPrintbox").val();
    //alert(filter_content);
    if(filter_content==""){
        request_userlist();
    }
    else{
        var content={
            "action": "requestUserList",
            "data": {"column":["username","children","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"],
                    "root": "/",
                    "filterOfAnd":[],//"filterOfAnd": [{"filterName":"username","content":"zhang"}]
                    "orderBy":"username",
                    "loadDepth": "1",
                    "limits":[1,-1]
                    }
         }
         $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-ulist.txt",dataType:"json",data:JSON.stringify(content),success:function(obj){
            if (obj.status == "ok") { 
                var parentClass="UM_userList";
                var heading_par=["全选","用户名","修改密码","管理员权限","所有文件读写权限","任务管理权限","创建个人目录"];
                var objType=["checkbox","text","button","checkbox","checkbox","checkbox","checkbox"];
                var keys=["","username","","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"];
                var prefix="UM_userlist";
                $("."+parentClass).children("table").html("");
                for(var i=0;i<obj.data.length;i++){
                    if(obj.data[i].username.indexOf(filter_content)==-1){
                            obj.data.splice(i,1);
                            i--;
                    }
                }
               // alert(JSON.stringify(obj));
                var userlist=new List(parentClass,heading_par,objType,keys,prefix);
                userlist.addRowsByJson(obj);
              // $("."+prefix+"table tr:not(:first)").addRowsByJson(obj);
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
    }
}
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
			          "data": {"username":username,"password":passwd_1,"authAdmin":""+flags[0],"authFileReadAll":""+flags[1],"authTaskManageAll":""+flags[2],"hasUserFolder":""+flags[3]}
                      };
        //alert(JSON.stringify(content));
		$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"/request",dataType:"json",data:JSON.stringify(content),success:function(obj){
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
		$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-changepwd.txt",dataType:"json",data:JSON.stringify(content),success:function(obj){
            if(obj.status=="ok"){
                alert("修改用户"+obj.username+"密码成功。新密码："+passwd_1);
            }else{
                alert(obj.status);
            }
		}});
    }
}
function user_setting(){
    let username=$("#userid").text();
    let oldpasswd=$("input[name='passwd_0']").val();
    let passwd_1=$("input[name='passwd_1']").val();
    let passwd_2=$("input[name='passwd_2']").val();
    if(oldpasswd==""||passwd_1==""){
        alert("原始密码或新密码为空！");
    }else if(passwd_1!=passwd_2){
        alert("两次输入的密码不一致");
    }else{
      var content={"action": "changePassWord","data": {"username": username, "oldPassword":oldpasswd, "newPassword":passwd_1}};
      $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-changepwd.txt",data:JSON.stringify(content),dataType:"json",success:function(obj){
          if(obj.status=="ok"){
            alert("修改用户"+username+"密码成功。新密码："+passwd_1);
         }else{
            alert(obj.status);
          }
      } });
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
           $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },type:"post",url:"testjons/test-del.txt",data:JSON.stringify(content),dataType:"json",success:function(obj){
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
function Se_DE_All(obj,classname){
	let flag = obj.is(":checked");
    $("."+classname).each(function(){ 
         // $(this).indeterminate=false;
         //$(this).checked=flag;
         $(this).prop("indeterminate",false);
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
		alert("至少选择一个要修改的用户！");
	}
	else{
		let url='html/userEdit-console.html';
		/*下面三种方法均可实现 */
		$.ajax({url: url, data: {}, dataType: "text", type: "GET", success: function(response) {
			element('content').innerHTML = response;
            element('edit_users').innerHTML='修改用户'+selectuserToedit+'的权限:';
            var content_1={
            "action": "requestFileList",
             "data": {"column":["fileName","authRead","authWrite"],
                      "asUser": selectuserToedit,
                      "root": "/",
                      "filterOfAnd":[],
                      "orderBy":"fileName",
                      "loadDepth": "1" ,
                      "limits":[1,-1]
                    }
            };
            $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"testjons/test-flist.txt",data:JSON.stringify(content_1),dataType:"json",type: "post",success:function(obj){
                var parentClass="UE_fileList";
                var heading_par=["文件列表","读权限","写权限"];
                var objType=["text","checkbox","checkbox"];
                var keys=["fileName","authRead","authWrite"];
                var prefix="UE_permission";
                if (obj.status == "ok") { 
                    var filelist=new List(parentClass,heading_par,objType,keys,prefix);
                    filelist.addRowsByJson(obj);
                   $("."+prefix+"table_tr").each(function(){
                    $(this).children("td:eq(1)").children("input").attr("class","AllRead_chk");
                    });
                }else{ 
                    alert("文件权限列表获取失败:"+obj.status); 
                }; 
            }});
            var content_2={
                    "action": "requestUserList",
                    "data": {"column":["username","children","authAdmin","authFileReadAll","authTaskManageAll","hasUserFolder"],
                            "root": "/",
                            "filterOfAnd":[],//"filterOfAnd": [{"filterName":"username","content":"zhang"}]
                            "orderBy":"username",
                            "loadDepth": "1",
                            "limits":[1,-1]
                 }
            }
            $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"testjons/test-ulist.txt",data:JSON.stringify(content_2),dataType:"json",type: "post",success:function(obj){
                var tf_flags=[0,0,0,0];
                if (obj.status == "ok") { 
                   for(var i=0;i<selectuserToedit.length;i++){
                    tf_flags[0]+=(obj.data[i].authAdmin=="true"?1:0);
                    tf_flags[1]+=(obj.data[i].authFileReadAll=="true"?1:0);
                    tf_flags[2]+=(obj.data[i].authTaskManageAll=="true"?1:0);
                    tf_flags[3]+=(obj.data[i].hasUserFolder=="true"?1:0);
                   }
                  // alert(tf_flags);
                   var j=0;
                   $(".uAchkBox_class").each(function(){
                       //alert(j);
                    if(tf_flags[j]==selectuserToedit.length) {
                        $(this).prop("indeterminate",false);
                        $(this).prop("checked",true);
                    }else if(tf_flags[j]==0){
                        $(this).prop("indeterminate",false);
                        $(this).prop("checked",false);
                    }else{
                        $(this).prop("indeterminate",true);
                    }
                    j++;
                   });
                }else{ 
                    alert("文件权限列表获取失败:"+obj.status); 
                }; 
            }});

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
function edituser_do1(){
    var files=[];
    var prefix="UE_permission";
    $("."+prefix+"table_tr").each(function(){
        var f0=$(this).children("td:eq(0)").text();
        var td1=$(this).children("td:eq(1)").children("input");
        var td2=$(this).children("td:eq(2)").children("input");
        var f1=(td1.is(":indeterminate")==true?"mixed":""+td1.is(":checked"));
        var f2=(td2.is(":indeterminate")==true?"mixed":""+td2.is(":checked"));
        files.push({"fileName":f0,"authRead":f1,"authWrite":f2});
    });
    var content={"action": "userFileAuthChange",
                  "data": {
                      "asUser": selectuserToedit_copy,
                       "files": files
                     }
    }
    alert(JSON.stringify(content));
    $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"/request",data:JSON.stringify(content),dataType:"json",type: "post",success:function(obj){
        if(obj.status=="ok"){
            alert("权限修改成功！");
        }else{
            alert("权限修改失败："+obj.status);
        }
    }});
}
/*todo*/
function edituser_do2(){
    var flag=[];
    $(".uAchkBox_class").each(function(){
        flag.push($(this).is(":indeterminate")==true?"mixed":""+$(this).is(":checked"));
    });
    var content={"action": "userManageAuthChange",
                 "data": {
                     "asUser":selectuserToedit_copy,
                     "authAdmin":flag[0],"authFileReadAll":flag[1],"authTaskManageAll":flag[2],"hasUserFolder":flag[3]}
    }
    alert(JSON.stringify(content));
    $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"/request",data:JSON.stringify(content),dataType:"json",type: "post",success:function(obj){
        if(obj.status=="ok"){
            alert("权限修改成功！");
        }else{
            alert("权限修改失败："+obj.status);
        }
    }});
}
/********************New_Task********************/
function addTask(){
 let url="html/taskCreateEdit-console.html"
 $.ajax({"url":url,"data":{},"dataType":"text",success:function(response){
     element("content").innerHTML=response;
     loadTree();
 }});
 //$.getJSON(url,{},setContent);
 //loadTree();
 request_modellist();
    
}
function addTask_do(){
   var content={
       "action": "taskEdit",
        "data": {"taskName":$taskName,"inputFolder":$inputFolder,"backup":"true", 
        "model":{"modelName":"细粒度缺陷识别模型", 
                 "objectList":[{"name":"鸟巢","color":"hsl(…,...,...)"},
                               {}]
        },
       "authTaskManageUserList": ["zhangsan","lisi"],
       "authTaskValidateUserList": ["shixisheng1","shixisheng2"] }
}
}
function request_modellist(){
   var content={
       "action": "requestModelList",
       "data": {
           "column":["modelName","objectList"],
            "filterOfAnd": [{"filterName":"modelname","content":[]}],
            "orderBy":"modelName",
            "limits":[1,-1]}
    }
    $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"testjons/test-mdefects.json",data:JSON.stringify(content),dataType:"json",type: "post",success:function(obj){
        if(obj.status=="ok"){
            for(var i=0;i<obj.data.length;i++){
                $("#taskmodel").append("<option>"+obj.data[i].modelName+"</option>");
            }
            $("#taskmodel").change(function(){
                let select_model=$("#taskmodel").val();
                var parentClass="TE_def";
                var heading_par=["全选","识别目标/缺陷","颜色"];
                var objType=["checkbox","text","text"];
                var keys=["","name","color"];
                var prefix="TE_def";
                if(select_model=="请选择"){
                    $("."+parentClass).html("");
                }
                else{
                    var obj_part={};
                    r = obj.data.filter(function(a) {
                        return a.modelName == select_model;
                    });
                    obj_part.data=r[0].objectList;
                    //alert(JSON.stringify(obj_part));
                    $("."+parentClass).html("");
                    var deflist=new List(parentClass,heading_par,objType,keys,prefix);
                    deflist.addRowsByJson(obj_part);
                }
            });
            
        }else{
            alert("权限修改失败："+obj.status);
        }
    }});
}
function setFilepath(obj){
    $("#inputdir_task").val(obj.val());
}
function loadTree() {
    $("#newtast_filetree").jstree({
        'core' : {      
            'data' : [  { "id":"root",
                          "text" : "请选择输入文件夹", 
                          "children" : [ { "id":"ch0_0","" : "dd","children":[] }]
                        }
                     ],//{ "id":"ch1_1","text" : "Child node 1_1","children":[] },{ "id":"ch1_2","text" : "Child node 1_1","children":[] }{ "id":"ch2_1","text" : "Child node 2_1","children":[] },{ "id":"ch2_2","text" : "Child node 2_2","children":[] }
            'check_callback': true
        }
    }).bind("open_node.jstree", function (e, data) {
        /*打开时通过判断response和data.node.chi的长度判断是否重新刷新*/
        /*var response={
            "status":"ok",
            "data":[{"filename":"lay_1","children":[]},
                        {"filename":"lay_2","children":[]}]
            }*/
        var dir_path=data.node.text;
        var content={};
        let url;
        if(data.node.parent=="#") url="testjons/test-edit_0.txt";
        else if(data.node.parent=="root") url="testjons/test-edit_1.txt";
        else url="testjons/test-edit_2.txt";
        $.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:url,data:JSON.stringify(content),dataType:"json",type: "post",success:function(response){
            if(response.status=="ok"){
                var node_ch=data.node.children;
                if(node_ch.length==1&&$("#"+node_ch[0]).text()==""){
                    deleteNode(node_ch[0]);
                    var par_id=data.node.id;
                    for(var i=0;i<response.data.length;i++){
                        createNode(par_id, par_id+"_"+i, response.data[i].filename, "last"); 
                        createNode(par_id+"_"+i, par_id+"_"+i+"_0", "", "last");  
                    }            
                }
            }
        }});
        
       // alert(data.node.parent);
        /*if(data.node.id=="root"){
            $("#ch1").attr("class","jstree-node jstree-closed"); 
            console.log($("#ch1_1").html());
            if($("#ch1_1").html()==""){
                createNode("ch1", "ch1_1", "add", "last");
            }
           
        }*/
       // alert(JSON.stringify(data.node));
      //  var id_new="ch1_1";
       // createNode(id_new, id_new+"_"+1, "add", "last");
        //$("#"+id_new+"_"+1).attr("class","jstree-node jstree-closed"); 
      // if(data.node.id!="root"&&data.node.id!=="ch1"&&data.node.id!=="ch2"){
            /*var response_1={
                "status":"ok",
                "data":[{"filename":"lay_1","children":[]},
                            {"filename":"lay_2","children":[]}]
                }
            var response={
                "status":"ok",
                "data":[{"filename":"lay_1","children":[{"filename":"lay_1_1","children":[]},{"filename":"lay_1_2","children":[]}]},
                        {"filename":"lay_2","children":[{"filename":"lay_2_1","children":[]},{"filename":"lay_2_2","children":[]}]}]
            }
            var id_new=data.node.id;  
            alert(id_new);
            for(var i=0;i<response_1.data.length;i++){
               // alert(i);
                createNode(id_new, id_new+"_"+i, response_1.data[i].filename, "last"); 
                $("#"+id_new+"_"+i).attr("class","jstree-node jstree-closed"); 

            }
            /*for(var i=0;i<data.node.children.length;i++){
                var id_new=data.node.children[i];
                console.log(id_new);
                var child_len=response.data[i].children.length;
                console.log(child_len);
                for(var j=0;j<child_len;j++){
                    console.log("cycle:"+j);
                    createNode(id_new, id_new+"_"+j, response.data[i].children[j].filename, "last"); 
                    $("#"+id_new+"_"+1).attr("class","jstree-node jstree-closed"); 
                }           
            }*/
        //}
        
    });
    $("#newtast_filetree").on('select_node.jstree', function (e, data) {// 节点选择事件  
       var selectNodeId = data.node.id;       //选择节点  
       $('#inputdir_task').val(selectNodeId);//赋值给araename选择框                      
     });
}
function createNode(parent_node, new_node_id, new_node_text, position) { 
        $('#newtast_filetree').jstree('create_node', $("#"+parent_node), { "text":new_node_text, "id":new_node_id}, position, false, false);   
}
function deleteNode(node_id) { 
    $('#newtast_filetree').jstree('delete_node', $("#"+node_id));   
}
function dmFileList() {
	fileList = new List("dMfileList",["全选","文件名或文件夹名","子文件数量","文件大小","修改日期","写权限"],["checkbox","text","text","text","text","checkbox"],["","fileName","filesContain","size","dateModified","authWrite"],"dM");
	let jsonData = {
		"status": "ok","dataLength": "3", "canModify":"true",
		"data": [
		{"fileName":"用户-贝克汉姆","type":"userFolder","filesContain":"1","size":"","dateModified":"1792553248","children":[{"fileName":"洛阳巡检","type":"folder","filesContain":"124","size":"","dateModified":"1792563248","children":[],"authRead":"true","authWrite":"mixed","usedByTask":"true"}],"authRead":"true","authWrite":"false", "usedByTask":"false"},
		{"fileName":"用户-罗纳尔多","type":"folder","filesContain":"0","size":"","dateModified":"1792563248","children":[],"authRead":"true","authWrite":"true","usedByTask":"true"},
		{"fileName":"用户-齐达内","type":"folder","filesContain":"1","size":"","dateModified":"1234563293","children":[{"fileName":"洛阳巡检","type":"folder","filesContain":"124","size":"","dateModified":"1792563248","children":[],"authRead":"true","authWrite":"mixed","usedByTask":"true"}],"authRead":"true","authWrite":"true","usedByTask":"true"},
		{"fileName":"用户-贝利","type":"folder","filesContain":"0","size":"","dateModified":"1792598257","children":[],"authRead":"true","authWrite":"mixed","usedByTask":"true"},
		{"fileName":"用户-梅西","type":"folder","filesContain":"0","size":"","dateModified":"1792523248","children":[],"authRead":"true","authWrite":"true","usedByTask":"true"},
		{"fileName":"用户-马拉多纳","type":"folder","filesContain":"0","size":"","dateModified":"1797863265","children":[],"authRead":"true","authWrite":"mixed","usedByTask":"true"},
		{"fileName":"1.jpg","type":"image","filesContain":"","size":"131225","dateModified":"1792573248","authRead":"true","authWrite":"false", "usedByTask":"false"},
		]
	};
	fileList.addRowsByJson(jsonData);
}
function dmBtnClick(obj) {
	let btName = obj.text();
	if(btName == "上传") {
		fileUpload();
	}
	else if(btName == "新建文件夹") {
		newFolder();
	}
	else if(btName == "下载") {
		fileDownLoad();
	}
	else if(btName == "重命名") {
		fileRename();
	}
	else if(btName == "删除") {
		fileDelete();
	}
	else if(btName == "复制到") {
		fileCopy();
	}
	else if(btName == "移动到") {
		fileMove();
	}
}

let msgBoxID=""; //重要
//弹出对话窗口(msgID-要显示的div的id)
function showAlert(msgID){
    //创建背景框，覆盖所有东西
    let bgObj=document.createElement("div");
    bgObj.setAttribute('id','bgID');
    document.body.appendChild(bgObj);
    showBigDiv();
    msgBoxID=msgID;
    showMsgDiv();
}
//关闭对话窗口
function closeAlert() {
	let msgObj=document.getElementById(msgBoxID);
    let bgObj=document.getElementById("bgID");
    msgObj.style.display="none";
    document.body.removeChild(bgObj);
    msgBoxID="";
}

//把要显示的div居中显示
function showMsgDiv() {
    let msgObj = document.getElementById(msgBoxID);
    msgObj.style.display = "block";
    let msgWidth = msgObj.scrollWidth;
    let msgHeight= msgObj.scrollHeight;
    let bgTop=myScrollTop();
    let bgLeft=myScrollLeft();
    let bgWidth=myClientWidth();
    let bgHeight=myClientHeight();
    let msgTop=bgTop+Math.round((bgHeight-msgHeight)/2);
    let msgLeft=bgLeft+Math.round((bgWidth-msgWidth)/2);
    msgObj.style.position = "absolute";
    msgObj.style.top      = msgTop+"px";
    msgObj.style.left     = msgLeft+"px";
    msgObj.style.zIndex   = "10001";
}
//背景框满窗口显示
function showBigDiv(){
    let bgObj=document.getElementById("bgID");
    let bgWidth=myClientWidth();
    let bgHeight=myClientHeight();
    let bgTop=myScrollTop();
    let bgLeft=myScrollLeft();
    bgObj.style.position   = "absolute";
    bgObj.style.top        = bgTop+"px";
    bgObj.style.left       = bgLeft+"px";
    bgObj.style.width      = bgWidth + "px";
    bgObj.style.height     = bgHeight + "px";
    bgObj.style.zIndex     = "10000";
    bgObj.style.background = "rgb(0,100,100)";
    bgObj.style.opacity    = "0.3";
}
//网页被卷去的上高度
function myScrollTop(){
    let n=window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    return n;
}
//网页被卷去的左宽度
function myScrollLeft(){
    let n=window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    return n;
}
//网页可见区域宽
function myClientWidth(){
    let n=document.documentElement.clientWidth || document.body.clientWidth || 0;
    return n;
}
//网页可见区域高
function myClientHeight(){
    let n=document.documentElement.clientHeight || document.body.clientHeight || 0;
    return n;
}
function newFolder() {
	$("#dMreminder").text("请输入新建文件夹名称：");
	$("#dMreminder").next().show();
	$("#dMConfirmBtn").click(confirmNewFolder);
	$("#dMCancelBtn").click(cancelNewFolder);
	showAlert('dMbox');
}
function confirmNewFolder() {
	let newFolderName = $("#newFolderName").val();
	let request = {"action":"mkdir","data": {"curdir":"$curdir","dirname":newFolderName}};
	let response = {"status": "ok"};
	if (response.status == "ok") {
		fileList.addRow(["",newFolderName,"0","",new Date().toString(),"false"]);
		closeAlert();
	}
	else if(response.status == "curdirNotExist"){
		$("#dMreminder").text("请输入新建文件夹名称： 当前所在目录不存在，请刷新！");
	}
	else if(response.status == "noAuthWrite") {
		$("#dMreminder").text("请输入新建文件夹名称： 当前目录不可写！");
	}
	else if(response.status == "otherReason") {
		$("#dMreminder").text("请输入新建文件夹名称： 未知原因导致创建失败！");
	}
	else if(response.status == "expired") {
		//log out
	}
	$("#dMConfirmBtn").unbind();
	$("#dMCancelBtn").unbind();
	$("#newFolderName").val("");
}
function cancelNewFolder() {
	$("#newFolderName").val("");
	cancelFileDelete();
}
function fileDelete() {
	let selRowNums = fileList.getSelRowNums();
	if(selRowNums[0] == 0) {selRowNums.shift();}
	if(selRowNums.length > 0) {
		let names = [];
		let colObjs = fileList.getColObjs(1);
		selRowNums.forEach(function(value,index,array){
			if(value!=0) {
				names.push(colObjs[value][0].innerHTML);
			}
		})
		names = names.join("、  ");
		$("#dMreminder").text("确认删除以下文件（夹）： " + names + "？");
		$("#dMreminder").next().hide();
		$("#dMConfirmBtn").click(confirmFileDelete);
		$("#dMCancelBtn").click(cancelFileDelete);
		showAlert('dMbox');
	}
	else{
		if($('#btnReminder')){
			$('#btnReminder').remove();
		}
		$redWords =$("<span id='btnReminder' style='color:red;margin-left:30px'>没有可删除文档</span>");
		$(".crumb").append($redWords);
		$redWords.fadeOut(1000,function(){$(this).remove()});
	}
}
function confirmFileDelete() {

	$("#dMConfirmBtn").unbind();
	$("#dMCancelBtn").unbind();
	closeAlert();
}
function cancelFileDelete() {
	$("#dMConfirmBtn").unbind();
	$("#dMCancelBtn").unbind();
	closeAlert();
}