var img_array_bing = ["url(./images/bing/HollowRock.jpg)","url(./images/bing/Knuthojdsmossen.jpg)","url(./images/bing/Kolonihavehus.jpg)"
,"url(./images/bing/LulworthCoveDorset.jpg)","url(./images/bing/ManateeMom.jpg)","url(./images/bing/NOTricentennial.jpg)"];
var img_array_power = ["url(./images/power/UAV.jpg)","url(./images/power/Geiri.jpg)","url(./images/power/max.jpg)"
,"url(./images/power/Solar_energy.jpg)","url(./images/power/Wind_turbine.jpg)"];

// 点击切换背景图-1
$(document).ready(function(){
    $("#sw_btn_1").click(function(){
        $("#sw_box_tr").children().children().css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $(".ct_tr1_td1").children().children().css("color","rgb(0, 0, 0)");
        $("#ct_tr1_bg").css("background-color","rgba(233, 230, 230, 0.397)");
        $("#div_bg_img").fadeOut(300,function(){
            // $("#div_bg_img").css({"background-image":img_array_bing[1],"background-size":"cover","display":"none"});
            $("#div_bg_img").css({"background-image":img_array_power[0],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);

    });
});
$(document).ready(function(){
    $("#div_bg_img").css({"background-image":img_array_power[0],"background-size":"cover"});
    // $("#div_bg_img").css({"background-image":img_array_bing[1],"background-size":"cover"});
});
// 点击切换背景图-2
$(document).ready(function(){
    $("#sw_btn_2").click(function(){
        $("#sw_box_tr").children().children().css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $(".ct_tr1_td1").children().children().css("color","rgb(0, 0, 0)");
        $("#ct_tr1_bg").css("background-color","rgba(233, 230, 230, 0.397)");
        $("#div_bg_img").fadeOut(300,function(){
            // $("#div_bg_img").css({"background-image":img_array_bing[3],"background-size":"cover","display":"none"});
            $("#div_bg_img").css({"background-image":img_array_power[1],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);
    });
});
// 点击切换背景图-3
$(document).ready(function(){
    $("#sw_btn_3").click(function(){
        $("#sw_box_tr").children().children().css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $(".ct_tr1_td1").children().children().css("color","rgba(255, 255, 255, 0.952)");
        $("#ct_tr1_bg").css("background-color","rgba(146, 144, 144, 0.397)");
        $("#div_bg_img").fadeOut(300,function(){
            // $("#div_bg_img").css({"background-image":img_array_bing[5],"background-size":"cover","display":"none"});
            $("#div_bg_img").css({"background-image":img_array_power[2],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);
    });
});
// 点击切换背景图-4
$(document).ready(function(){
    $("#sw_btn_4").click(function(){
        $("#sw_box_tr").children().children().css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $(".ct_tr1_td1").children().children().css("color","rgba(255, 255, 255, 0.952)");
        $("#ct_tr1_bg").css("background-color","rgba(146, 144, 144, 0.397)");
        $("#div_bg_img").fadeOut(300,function(){
            // $("#div_bg_img").css({"background-image":img_array_bing[5],"background-size":"cover","display":"none"});
            $("#div_bg_img").css({"background-image":img_array_power[3],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);
    });
});
// 点击切换背景图-5
$(document).ready(function(){
    $("#sw_btn_5").click(function(){
        $("#sw_box_tr").children().children().css("background-color","rgba(146, 146, 146, 0.788)");
        $(this).css("background-color","rgba(231, 231, 231, 0.788)");
        $(".ct_tr1_td1").children().children().css("color","rgb(0, 0, 0)");
        $("#ct_tr1_bg").css("background-color","rgba(233, 230, 230, 0.397)");
        $("#div_bg_img").fadeOut(300,function(){
            // $("#div_bg_img").css({"background-image":img_array_bing[5],"background-size":"cover","display":"none"});
            $("#div_bg_img").css({"background-image":img_array_power[4],"background-size":"cover","display":"none"});
        });
		$("#div_bg_img").fadeIn(300);
    });
});

// 输入框效果
$(document).ready(function(){
    $("input").focus(function(){
      $(this).css({"border":"1px solid rgb(47, 183, 247)","box-shadow":"rgb(47, 183, 247) 0px 0px 1px"});
    // $(this).css({"border":"1px solid rgba(38, 172, 131, 0.808)","box-shadow":"rgba(38, 172, 131, 0.808) 0px 0px 1px"});
    });
    $("input").blur(function(){
      $(this).css({"border":"1px solid rgba(68, 163, 135, 0.13)","box-shadow":"none"});
    });
  });

// 适配窗口大小
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