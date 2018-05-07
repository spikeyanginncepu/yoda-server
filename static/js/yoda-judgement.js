const request1 = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"/home/siyan/yoda-server/data/","orderBy":"fileName","loadDepth":"2"}}';
const answer1 = '{"status":"ok","dataLength":"3","canModify":"false","data":[{"fileName":"未校验","type":"folder","children":[{"fileName":"1.jpg","type":"image","children":""},{"fileName":"2.jpg","type":"image","children":""},{"fileName":"3.jpg","type":"image","children":""}]},{"fileName":"已校验-正确","type":"folder","children":[]},{"fileName":"已校验-错误","type":"folder","children":[]}]}';
const request2 = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"全部文件/张三/春季巡检/上嘉一线/","orderBy":"fileName","loadDepth":"2"}}';
const answer2 = '{"status":"ok","dataLength":"0","canModify":"false","data":[]}';
const request3 = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"WTF","orderBy":"fileName","loadDepth":"2"}}';
const answer3 = '{"status":"notExist"}';
const requestFileList = new Map([[request1,answer1],[request2,answer2],[request3,answer3]])
var JM_FileList_Unchecked = [];
var JM_FileList_Correct = [];
var JM_FileList_Wrong = [];
var JM_root;

function startJudgement(obj)
{
	var tr = event.srcElement.parentNode.parentNode;
	var path = tr.getElementsByClassName("TM_tasktablelist_path")[0].innerText;
	var request = '{"action":"requestFileList","data":{"column":["fileName","type","children"],"root":"' + path + '","orderBy":"fileName","loadDepth":"2"}}';
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
		maintain_JM_FileList(answer,path);
		navigate(obj);
	}

}

function maintain_JM_FileList(returnJSON,path)
{	
	JM_FileList_Unchecked = [];
	JM_FileList_Correct = [];
	JM_FileList_Wrong = [];
	JM_root = path;
	console.log(JM_FileList_Unchecked);
	for (var i in returnJSON.data)
	{
		if (returnJSON.data[i].fileName == '未校验')
		{
			for (var j in returnJSON.data[i].children)
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
	for (var i in JM_FileList_Unchecked)
	{
		var tr_unchecked = document.createElement("tr");
		var td_unchecked = document.createElement("td");
		td_unchecked.innerText = JM_FileList_Unchecked[i];
		td_unchecked.setAttribute('onclick','click_JM_FileList()');
		tr_unchecked.appendChild(td_unchecked);
		table_unchecked.appendChild(tr_unchecked);
	}

	var table_correct= document.getElementById("JM_FileList_Correct");
	table_correct.innerHTML = "";
	var tr_correct_head = document.createElement("tr");
	var th_correct = document.createElement("th");
	th_correct.innerText = '已校验-正确';
	tr_correct_head.appendChild(th_correct);
	table_correct.appendChild(tr_correct_head);
	for (var i in JM_FileList_Correct)
	{
		var tr_correct = document.createElement("tr");
		var td_correct = document.createElement("td");
		td_correct.innerText = JM_FileList_Correct[i];
		td_correct.setAttribute('onclick','click_JM_FileList()');
		tr_correct.appendChild(td_correct);
		table_correct.appendChild(tr_correct);
	}
	
	var table_wrong = document.getElementById("JM_FileList_Wrong");
	table_wrong.innerHTML = "";
	var tr_wrong_head = document.createElement("tr");
	var th_wrong = document.createElement("th");
	th_wrong.innerText = '已校验-错误';
	tr_wrong_head.appendChild(th_wrong);
	table_wrong.appendChild(tr_wrong_head);
	for (var i in JM_FileList_Wrong)
	{
		var tr_wrong = document.createElement("tr");
		var td_wrong = document.createElement("td");
		td_wrong.innerText = JM_FileList_wrong[i];
		td_wrong.setAttribute('onclick','click_JM_FileList()');
		tr_wrong.appendChild(td_wrong);
		table_wrong.appendChild(tr_wrong);
	}
	leftNav(obj);
}

function click_JM_FileList()
{
	p_JM_dir = document.getElementById("JD_resultDir_p");
	p_JM_dir.innerHTML = JM_root;
}
