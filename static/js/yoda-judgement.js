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

function maintain_JM_FileList(returnJSON)
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
}

function generate_JM_FileList(obj)
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
	
	
	leftNav(obj);
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
}

/*function click_JM_FileList()
{
	p_JM_dir = document.getElementById("JD_resultDir_p");
	p_JM_dir.innerHTML = JM_root;
}*/

function click_JM_FileList(obj,list)
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

function click_JM_correctness(text)
{
	var correctness_text = document.getElementById("JD_correctness");
	correctness_text.innerText = "自动识别结果： " + text;
}
function startJudgement(obj){
   let url="html/查看及校验-结果列表";
   $.ajax({url:url,data:{},dataType:"text",success:function(response){
		element('left').innerHTML = response;
		loadValidatelist(obj);
		let menu = element('leftMenu');
		menu.rows[0].click();
   }})
}

function loadValidatelist(obj){
	var content={
		"action": "requestFileList",
		"data": {"column":["fileName","type","filesContain","size","dateModified","children","authRead","authWrite","usedByTask"],
		           "root": "/用户-zhangsan/2012巡检/",
		            "filterOfAnd": [],
		   			"orderBy":"fileName",
		   			"loadDepth": "1",
		   			"limits":[1,-1]
				}
		}
	
}
