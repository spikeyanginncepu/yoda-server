const FileList_request1 = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"/home/siyan/yoda-server/data/","orderBy":"fileName","loadDepth":"2"}}';
const FileList_answer1 = '{"status":"ok","dataLength":"3","canModify":"false","data":[{"fileName":"未校验","type":"folder","children":[{"fileName":"1.jpg","type":"image","children":""},{"fileName":"2.jpg","type":"image","children":[]},{"fileName":"3.jpg","type":"image","children":[]}]},{"fileName":"已校验-正确","type":"folder","children":[]},{"fileName":"已校验-错误","type":"folder","children":[]}]}';
const FileList_request2 = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"全部文件/张三/春季巡检/上嘉一线/","orderBy":"fileName","loadDepth":"2"}}';
const FileList_answer2 = '{"status":"ok","dataLength":"0","canModify":"false","data":[]}';
const FileList_request3 = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"WTF","orderBy":"fileName","loadDepth":"2"}}';
const FileList_answer3 = '{"status":"notExist"}';
const requestFileList = new Map([[FileList_request1,FileList_answer1],[FileList_request2,FileList_answer2],[FileList_request3,FileList_answer3]])

const Judgement_request1 = '{"action":"requestValidateStatus","data":{"column":["fileName","status","descript"],"taskName":"春季巡检-上嘉一线","filterOfAnd":[{"filterName":"fileName","content":"1.jpg"}],"orderBy":"fileName","limits":"[0,-1]"}}';

var JM_FileList_Unchecked = [];
var JM_FileList_Correct = [];
var JM_FileList_Wrong = [];
var JM_root;
var JM_taskname = "";
var JM_file;
var JM_list = "";

/*function startJudgement(obj)
{
	var tr = event.srcElement.parentNode.parentNode;
	JM_root = tr.getElementsByClassName("TM_tasktablelist_path")[0].innerText;
	JM_taskname = tr.getElementsByClassName("TM_tasktablelist_taskname")[0].innerText;
	console.log(JM_root);
	console.log(JM_taskname);
	console.log(JSON.parse(Judgement_request1))
	var request = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"' + JM_root + '","orderBy":"fileName","loadDepth":"2"}}';
	
	//var answer = {"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"' + JM_root + '","orderBy":"fileName","loadDepth":"2"}};
	var answer = JSON.parse(requestFileList.get(request));
	
	if (answer.status != 'ok')
	{
		alert("Error!");
	}
	else if (answer.dataLength == '0')
	{
		alert("该任务未运行，不能进行查看及校验！");
	}
	else
	{
		maintain_JM_FileList(answer);
		navigate(obj);
	}

}*/

/*function maintain_JM_FileList(returnJSON)
{	
	JM_FileList_Unchecked = [];
	JM_FileList_Correct = [];
	JM_FileList_Wrong = [];
	
    var i=0;
	for (var i in returnJSON.data)
	//for(i=0;i<returnJSON.data.length;i++) 
	{
		if (returnJSON.data[i].fileName == '未校验')
		{
			for (var j in returnJSON.data[i].children)
			//for (j=0;j<returnJSON.data[i].children.length;j++)
			{
				if (returnJSON.data[i].children[j].type == 'image')
				{
					JM_FileList_Unchecked.push(returnJSON.data[i].children[j].fileName); 
				}
			}
		}
		else if (returnJSON.data[i].fileName == '已校验-正确')
		{
			for (var j in returnJSON.data[i].children)
			{
				if (returnJSON.data[i].children[j].type == 'image')
				{
					JM_FileList_Correct.push(returnJSON.data[i].children[j].fileName);
				}
			}
		}
		else if (returnJSON.data[i].fileName == '已校验-错误')
		{
			for (var j in returnJSON.data[i].children)
			{
				if (returnJSON.data[i].children[j].type == 'image')
				{
					JM_FileList_Wrong.push(returnJSON.data[i].children[j].fileName);
				}
			}
		}
	}
}*/

/*function generate_JM_FileList(obj)
{

	var table_unchecked = document.getElementById("JM_FileList_Unchecked");
	table_unchecked.innerHTML = "";
	var tr_unchecked_head = document.createElement("tr");
	var th_unchecked = document.createElement("th");
	th_unchecked.innerText = '未校验';
	tr_unchecked_head.appendChild(th_unchecked);
	table_unchecked.appendChild(tr_unchecked_head);

	//for (var i in JM_FileList_Unchecked) //修改了for语句写法
	for(var i=0;i<JM_FileList_Unchecked.length;i++)
	{
		var tr_unchecked = document.createElement("tr");
		var td_unchecked = document.createElement("td");
		td_unchecked.innerText = JM_FileList_Unchecked[i];
		//alert(JM_FileList_Unchecked[i]);
		td_unchecked.setAttribute('onclick','click_JM_FileList($(this),"未校验")'); 
		td_unchecked.setAttribute('class','content');
		tr_unchecked.appendChild(td_unchecked);
		table_unchecked.appendChild(tr_unchecked);
		console.log(tr_unchecked);
	}
	
	// Yang adding the number of Img-Unchecked
	var p_imgUnchecked_title = document.getElementById("JM_FileList_Unchecked");
	p_imgUnchecked_title.firstChild.firstChild.innerHTML += "(" + i + "张)";
	
	
	var table_correct= document.getElementById("JM_FileList_Correct");
	table_correct.innerHTML = "";
	var tr_correct_head = document.createElement("tr");
	var th_correct = document.createElement("th");
	th_correct.innerText = '已校验-正确';
	tr_correct_head.appendChild(th_correct);
	table_correct.appendChild(tr_correct_head);
	for(var i=0;i<JM_FileList_Correct.length;i++) //修改了for语句写法
	{
		var tr_correct = document.createElement("tr");
		var td_correct = document.createElement("td");
		td_correct.innerText = JM_FileList_Correct[i];
		td_correct.setAttribute('onclick','click_JM_FileList($(this),"已校验-正确")');
		td_correct.setAttribute('class','content');
		tr_correct.appendChild(td_correct);
		table_correct.appendChild(tr_correct);
	}
	
	// Yang adding the number of Img-Correct
	var p_imgCorrect_title = document.getElementById("JM_FileList_Correct");
	p_imgCorrect_title.firstChild.firstChild.innerHTML += "(" + i + "张)";
	
	
	var table_wrong = document.getElementById("JM_FileList_Wrong");
	table_wrong.innerHTML = "";
	var tr_wrong_head = document.createElement("tr");
	var th_wrong = document.createElement("th");
	th_wrong.innerText = '已校验-错误';
	tr_wrong_head.appendChild(th_wrong);
	table_wrong.appendChild(tr_wrong_head);
	for(var i=0;i<JM_FileList_Wrong.length;i++) //修改了for语句写法
	{
		var tr_wrong = document.createElement("tr");
		var td_wrong = document.createElement("td");
		td_wrong.innerText = JM_FileList_Wrong[i];
		td_wrong.setAttribute('onclick','click_JM_FileList($(this),"已校验-错误")');
		td_wrong.setAttribute('class','content');
		tr_wrong.appendChild(td_wrong);
		table_wrong.appendChild(tr_wrong);
	}
	
	// Yang adding the number of Img-Correct
	var p_imgWrong_title = document.getElementById("JM_FileList_Wrong");
	p_imgWrong_title.firstChild.firstChild.innerHTML += "(" + i + "张)";
	
	
	leftNav(obj);}*/
	/*
	if (JM_FileList_Unchecked.length>0)
	{
		console.log(table_unchecked.getElementsByClassName("content")[0]);
		table_unchecked.getElementsByClassName("content")[0].click(($(this),JM_FileList_Unchecked));
	}
	else if (JM_FileList_Correct.length>0)
	{
		table_correct.getElementsByClassName("content")[0].click(($(this),JM_FileList_Correct));
	}
	else
	{
		table_wrong.getElementsByClassName("content")[0].click(($(this),JM_FileList_Wrong));
	}*/


/*function click_JM_FileList()
{
	p_JM_dir = document.getElementById("JD_resultDir_p");
	p_JM_dir.innerHTML = JM_root;
}*/

/*function click_JM_FileList(obj,list)
{	
	JM_file = obj.text();	
	JM_list = list;
	var p_JM_dir = document.getElementById("JD_resultDir_p");
	console.log(p_JM_dir);
	var p_JM_state = document.getElementById("JD_state_p");
	p_JM_dir.innerHTML = '当前文件为:' + '&emsp;' + JM_taskname + '  ->  ' + JM_list + '  ->  ' + JM_file;
	p_JM_state.innerHTML = '状态：' + '&emsp;' + JM_list;
	var p_JM_Image = document.getElementById("JD_mainImage");
	p_JM_Image.src = JM_root + subject;
	p_JM_Image.alt = '我是图片——' + subject;
	
	var descript = document.getElementById("JD_descript").innerText = JM_file.split(".",1);
	var correctness = document.getElementById("JD_rightorwrong").getElementsByClassName("correctness_radio");
	correctness[0].checked=false;
	correctness[1].checked=false;
}
*/
function click_JM_correctness(text)
{
	var correctness_text = document.getElementById("JD_correctness");
	correctness_text.innerText = "自动识别结果： " + text;
}
var snp;//Save_Nxt_Pre类，维护save_next_pre的对象
function startJudgement(obj){
   let taskname=obj.parent().parent().children("td:eq(1)").text();
   tree_id_prefix="validateTree_";
   snp=new Save_Nxt_Pre(taskname,[],tree_id_prefix);
   //alert(snp.taskname);
   let url="html/查看及校验.html";
   $.ajax({url:url,data:{},dataType:"text",success:function(response){
		element('left').innerHTML = response;
		loadValidatelist(taskname,tree_id_prefix,"testjons/test-validatelist.json","testjons/test-validate_state.json",true);
		let menu = element('leftMenu');
		menu.rows[0].click();
		
   }})
}
function generate_JM_FileList(obj){
	let url="html/查看及校验-结果列表.html";
	$.ajax({url:url,data:{},dataType:"text",success:function(response){
		element('content').innerHTML = response;
   }})
}
/** url_flist是请求文件的url，url_state是请求状态的url*/
function loadValidatelist(taskname,tree_id_prefix,url_flist,url_state,open_all){
	var content={
		"action": "requestFileList",
		"data": {"column":["fileName","type","filesContain","size","dateModified","children","authRead","authWrite","usedByTask"],
		           "root": "/"+taskname+"/",
		            "filterOfAnd": [],
		   			"orderBy":"fileName",
		   			"loadDepth": "2",
		   			"limits":[1,-1]
				}
		}
	$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:url_flist,data:JSON.stringify(content),dataType:"json",type: "post",success:function(obj){
		if(obj.status=="ok"){
			let tree_id=[]
			let root_text=[];
			let tree_data=[];
			let moreparas={"taskname":taskname,"url_state":url_state};
			for(var i=0;i<3;i++){
				tree_id[i]=tree_id_prefix+i;
				root_text[i]=obj.data[i].fileName+"("+obj.data[i].filesContain+")";
				tree_data[i]=obj.data[i].children;
				initValidateTree(tree_id[i],root_text[i],tree_data[i],moreparas);
				if(open_all) $("#validateTree_"+i).jstree("open_all");
				//$("#validateTree_0root_8_anchor").trigger("click");
				//$("#"+pre_node).attr("aria-selected",false);
				//$("#validateTree_0root_8").attr("aria-selected","true");
			}
		}
		else{
			alert(obj.status);
		}

	}});
}
function initValidateTree(tree_id,root_text,tree_data,moreparas){
	$("#"+tree_id).jstree({
        'core' : {      
            'data' : [  { "id":tree_id+"root",
						  "text" : root_text, 
						  "state": {"opened" : true,"disabled":true},
                          "children" : [ { "id":tree_id+"root_0","text" : "","children":[] }],
                        }
                     ],
            'check_callback': true
        }
	});
	$("#"+tree_id).on("open_node.jstree", function (e, data) {
		var node_ch=data.node.children;
		if(node_ch.length==1&&$("#"+node_ch[0]).text()==""){
			deleteNode(tree_id,node_ch[0]);
			var par_id=data.node.id;
			for(var i=0;i<tree_data.length;i++){
				createNode(tree_id,par_id, par_id+"_"+i,tree_data[i].fileName, "last"); 
			}
		}
	});
	$("#"+tree_id).on("select_node.jstree",function(e,data){
		//alert(data.node.id);
		if(data.node.parent!="#"){
			let parentpath=$("#"+tree_id).jstree().get_node("#"+data.node.parent).text.split("(")[0];
			let JD_resultDir_p="识别结果/"+moreparas.taskname+"/"+parentpath+"/"+data.node.text;
			$("#JD_resultDir_p").text(JD_resultDir_p);
			$("#JD_state_p").text(parentpath);
			var content={
						"action": "requestValidateStatus",
						"data": {
								"column":["fileName","status","descript"],
								"taskName": moreparas.taskname,
								"filterOfAnd": [{"filterName":"fileName","content":data.node.text}],
								"orderBy":"fileName",
								"limits":[0,-1]
								}
						}
			$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:moreparas.url_state,data:JSON.stringify(content),dataType:"json",type: "post",success:function(obj){
				if(obj.status=="ok"){
					$("#JD_descript").text(obj.data[0].descript);
					//$("#JD_state_p").text(obj.data[0].status);
					/*$.ajax({url:"images/add.png",dataType:"text",data:{},success:function(obj_1){//+JD_resultDir_p
						$("#JD_mainImage").attr("src","data:image/png;base64,"+obj_1);
					}});*/
				}
			}});/**建议：图片和申请状态在一个post中，或description在请求文件列表的时候加字段。 */
		}
		
	});
}
class Save_Nxt_Pre {
	constructor(taskname,request,tree_id_prefix) {
		this.taskname = taskname;
		this.request=request;
		this.tree_id_prefix=tree_id_prefix;
	} 
	echo(){
		alert(this.taskname+this.request+this.tree_id_prefix);
	}
	next(){
		let fileName=$("")+get_selected()
	}
    save(){
		var content={
			"action": "setValidateStatus",
			 "taskName":"fdf",
			"data": [{"fileName":"1_2.jpg","status":"已校验-正确","descript":"张天线32号塔小号侧跳串U型挂环缺销子"},
					 {"fileName":"1_2.jpg","status":"已校验-正确","descript":"张天线32号塔小号侧跳串U型挂环缺销子"},
		]
			
	    }
		$.ajax({headers: {"X-XSRFToken":getCookie("_xsrf"), },url:"testjons/test-add.txt",data:JSON.stringify(content),dataType:"json",type: "post",success:function(response){
			if(response.status=="ok"){
				alert(taskname);
				for(var i=0;i<3;i++){
					$("#validateTree_"+i).jstree(true).destroy();
				}
				loadValidatelist(taskname,"testjons/test-validatelist_1.json","testjons/test-validate_state.json",true);
				$("#validateTree_0root_8_anchor").trigger("click");

			}
		}});
    }
}