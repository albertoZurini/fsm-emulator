$(document).ready(function(){
    $("#code").linedtextarea();
    $(".lineno").click(function(){
        $(this).toggleClass("selected");
    });
});

var events = new Array([]);
var actions = new Array([]);
var debugOk;

var executing = null;
var nowState;
var nowRead;
var errore = "";
var outputs = [];

if(!(!localStorage.getItem("code"))) {
    $('#code').val(decodeURI(localStorage.getItem("code")));
}

$("#code").keyup(function(){
    var code = $("#code").val();
    localStorage.setItem("code", encodeURI(code));
});

$("#comeSiUsa").click(function(){
    $(".tutorial").fadeIn(1000);
});

$(".close").click(function(){
    $(this).parent().fadeOut(1000);
});

$("#stop").click(function(){
    if($(this).hasClass("active")){
        $(this).toggleClass("active");
        clearInterval(executing);
    }
});

$(document).on("click", ".nastro div", function(){
    let nv = prompt("Che cosa ci devo mettere? (lascia vuoto per rimuovere)");
    if(!nv) return;
    if(nv === ''){
        $(this).fadeOut(600, function() {
            $(this).remove();
        });
    }
    else{
        $(this).text(nv);
    }
    
});

$("#aggiungi").click(function(){
    var rand = Math.floor(Math.random() * 2);
    $(".nastro").append($("<div>"+rand+"</div>").hide().fadeIn(600));
});

$("#parse").click(function(){
    if(!$("#stop").hasClass("active")){
        var code = $("#code").val();
        var line = code.split("\n");
        var old;
        debugOk = true;
        $("#logicOutput").text('(none)');
        
        events.length = 0;
        actions.length = 0;
        
        $(".nastro").find("div").each(function(){
            $(this).removeClass("active");
        });
        
        errore = "";

        $.when(line.forEach(debug)).done(function(){
            if(debugOk){
               execute();
            } else {
                alert(errore);
            }
        });
    }
});

function debug(item, index) {
    //old = $(".parsed").html();
    //$(".parsed").html(old+index+": "+item+"<br/>");
    item = item.replace(/ /g, "");
    if(item.indexOf("//")>-1){
        item = item.substring(0, item.indexOf("//"));
    }
    
    if(item.split(">").length == 2 &
        item.split(",").length == 3 &
        item.split("(").length == 3 &
        item.split(")").length == 3){
        if(debugOk){
            item = item.replace(/["'()]/g, "");
            
            var even = item.split(">")[0];
            var then = item.split(">")[1];
            
            var checkStatus = even.split(",")[0];
            var checkSymbol = even.split(",")[1];
            
            var thenStatus = then.split(",")[0];
            var thenOutput  = then.split(",")[1];
            // var thenPrint   = then.split(",")[2];
            
            //alert(thenMove);
            
            var eventsTmp = [checkStatus, checkSymbol];
            var actionTmp = [thenStatus, thenOutput];
            
            events.push(eventsTmp);
            actions.push(actionTmp);
        }
        //alert(checkStatus);
        $(".lineno").eq(index).removeClass("error");
        
    } else {
        $(".lineno").eq(index).addClass("error");
        
        errore += "Syntax error on line "+(index+1)+" ("+item+")\nList of errors:\n";
        var info = [[]];
        info[0] = [" greater than sign (>)", 2 - item.split(">").length];
        info[1] = [" commas ", 3 - item.split(",").length];
        info[2] = [" open brackets", 3 - item.split("(").length];
        info[3] = [" closed brackets", 3 -item.split(")").length];

        for(var i=0;i<info.length;i++){
            if(info[i][1]!=0){
                errore += "- Missing "
                errore += info[i][1];
                errore += info[i][0];
                errore += "\n"
            }
        }

        debugOk = false;
    }
}

function execute(){
    console.log("Debug ok, now executing...");
    
    nowState = events[0][0];
    if(nowState=="*"){
        nowState = actions[0][0];
    }
    nowRead = $(".nastro").find("div").eq(0).text();
    $("#stop").toggleClass("active");
    
    var indexRead = 0;
    $(".nastro").find("div").eq(indexRead).toggleClass("active");
    $(".testina").css("left", $(".nastro").find(".active").offset().left+"px");
        
    executing = setInterval(function(){
        for(var i=0;i<events.length;i++){
            //console.log(nowState);
            //console.log(nowState==events[i][0]);
            //console.log(nowRead.length+" e "+events[i][1].length);
            //console.log('"'+events[i][1]+'"');
            $(".statoControllato").text("("+events[i][0]+","+events[i][1]+")");
            $(".istruzione").text("("+actions[i][0]+","+actions[i][1]+")");
            $(".statoAttuale").text(nowState);
            
            if((nowState===events[i][0]||events[i][0]==="*")&&(nowRead===events[i][1]||events[i][1]==="*")){
                console.log("aggiorno");
                //cambia stato
                nowState = actions[i][0];
                
                //scrive nella cella
                // $(".nastro").find("div").eq(indexRead).text(actions[i][1]);
                
                //cambia elemento
                $(".nastro").find("div").eq(indexRead).toggleClass("active");
                // indexRead += actions[i][2];
                ++indexRead;
                $(".nastro").find("div").eq(indexRead).toggleClass("active");

                $("#logicOutput").text(actions[i][1]);
                
                //aggiorna la lettura del nastro
                nowRead = $(".nastro").find("div").eq(indexRead).text();
                
                i=events.length; //termina le iterazioni
            }

            try{
                $(".testina").css("left", $(".nastro").find(".active").offset().left+"px");
            } catch(e) {
                alert("Reached end of the strip");
                clearInterval(executing);
            }
        }
    }, parseInt($("#time").val()));
    
    //clearInterval(executing); (c,c) > (c,c,c)
    
    //alert(events[0][0]);
    //alert(actions);
}

$( ".debugInfo, .tutorial" ).draggable();
