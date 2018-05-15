var img_array_bing = ["url(./images/bing/HollowRock.jpg)","url(./images/bing/Knuthojdsmossen.jpg)",
"url(./images/bing/LulworthCoveDorset.jpg)","url(./images/bing/ManateeMom.jpg)",
"url(./images/bing/NOTricentennial.jpg)","url(./images/bing/Kolonihavehus.jpg)"];
var img_array_power = ["url(./images/power/Solar_energy.jpg)","url(./images/power/Wind_turbine_1.jpg)","url(./images/power/Wind_turbine_2.jpg)"]

// 点击切换背景图
$(document).ready(function(){
    $("#sw_btn_1").click(function(){
        $("td div").filter('#sw_btn_2').css("background-color","rgba(146, 146, 146, 0.788)");
        $("td div").filter('#sw_btn_3').css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $("#div_bg_img").fadeOut(300,function(){
            $("#div_bg_img").css({"background-image":img_array_bing[1],"background-size":"cover","display":"none"});
            // $("#div_bg_img").css({"background-image":img_array_power[0],"background-size":"cover","display":"none"});

        });
		$("#div_bg_img").fadeIn(300);

    });
});
$(document).ready(function(){
    // $("#div_bg_img").css({"background-image":img_array_power[0],"background-size":"cover"});
    $("#div_bg_img").css({"background-image":img_array_bing[1],"background-size":"cover"});
});

$(document).ready(function(){
    $("#sw_btn_2").click(function(){
        $("td div").filter('#sw_btn_1').css("background-color","rgba(146, 146, 146, 0.788)");
        $("td div").filter('#sw_btn_3').css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $("#div_bg_img").fadeOut(300,function(){
            $("#div_bg_img").css({"background-image":img_array_bing[3],"background-size":"cover","display":"none"});
            // $("#div_bg_img").css({"background-image":img_array_power[1],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);
    });
});
$(document).ready(function(){
    $("#sw_btn_3").click(function(){
        $("td div").filter('#sw_btn_1').css("background-color","rgba(146, 146, 146, 0.788)");
        $("td div").filter('#sw_btn_2').css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $("#div_bg_img").fadeOut(300,function(){
            $("#div_bg_img").css({"background-image":img_array_bing[5],"background-size":"cover","display":"none"});
            // $("#div_bg_img").css({"background-image":img_array_power[2],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);
    });
});



// 输入框效果
$(document).ready(function(){
    $("input").focus(function(){
      $(this).css({"border":"1px solid rgb(47, 183, 247)","box-shadow":"rgb(47, 183, 247) 0px 0px 1px"});
    });
    $("input").blur(function(){
      $(this).css({"border":"1px solid rgba(68, 163, 135, 0.13)","box-shadow":"none"});
    });
  });

// 适配窗口大小
// function set_screen(){
//     var w,h;
//     w = document.body.clientWidth; 
//     h = document.body.clientHeight; 
//     document.getElementById("mainBox").style.width = w + 'px'; 
//     document.getElementById("mainBox").style.height = h + 'px'; 
//     document.getElementById("div_bg_img").style.width = w + 'px'; 
//     document.getElementById("div_bg_img").style.height = h + 'px'; 
//     document.getElementById("container").style.width = w + 'px'; 
//     document.getElementById("container").style.height = h + 'px';
//  }

 $(document).ready(function(){
    console.log('窗口宽度:'+$(window).innerWidth()+' '+'窗口高度'+$(window).innerHeight());
    $("#mainBox").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#div_bg_img").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#container").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    console.log('窗口宽度:'+$(window).innerWidth()+' '+'窗口高度'+$(window).innerHeight());
    $("#mainBox").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#div_bg_img").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#container").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
});

$(window).resize(function() {
    console.log('窗口宽度:'+$(window).innerWidth()+' '+'窗口高度'+$(window).innerHeight());
    $("#mainBox").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#div_bg_img").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#container").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    console.log('窗口宽度:'+$(window).innerWidth()+' '+'窗口高度'+$(window).innerHeight());
    $("#mainBox").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#div_bg_img").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
    $("#container").css({"width":$(window).innerWidth(),"height":$(document.body)[0].clientHeight});
  });