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