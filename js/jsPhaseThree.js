/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
KeyPress();
DirectionSnake();
Hit();

function StartPhaseThree(){
    phase = 3;
    Start();
    var url = purl(window.location.href);
    var points = url.param('Points');
    if(points === undefined){
        points = 0;
    }
    document.getElementById('points').innerHTML = points;
    
    for(i=1; i<=(columnLeft.length-2); i++){
        document.getElementById(columnLeft[i]).className = "wallLeft";
        document.getElementById(columnRight[i]).className= "wallRight";   
    }
    for(i=1; i<=36; i++){
        document.getElementById(i).className= "wallTop";
        document.getElementById(i+570).className= "wallBot";
    }
    
    var x=0;
    for(i=0; i<=4; i++){
        if(i==0){
            document.getElementById(158).className= "wallFirst";
            document.getElementById(180).className= "wallFirst";
            document.getElementById(285).className= "wallMiddleTop";
            document.getElementById(323).className= "wallMiddleBot";
            document.getElementById(424).className= "wallFirst";
            document.getElementById(446).className= "wallFirst";
            wallInsideField[0] = 158;
            wallInsideField[1] = 180;
            wallInsideField[2] = 285;
            wallInsideField[3] = 323;
            wallInsideField[4] = 424;
            wallInsideField[5] = 446;
        }else if(i==4){
            document.getElementById(162).className= "wallLast";
            document.getElementById(184).className= "wallLast";
            document.getElementById(428).className= "wallLast";
            document.getElementById(450).className= "wallLast";
            
            x=wallInsideField.length;
            wallInsideField[x] = 162;
            wallInsideField[x+1] = 184;
            wallInsideField[x+2] = 428;
            wallInsideField[x+3] = 450;
        }else{
            document.getElementById(158+i).className= "wall";
            document.getElementById(180+i).className= "wall";
            document.getElementById(424+i).className= "wall";
            document.getElementById(446+i).className= "wall";
            
            wallInsideField[5+i+x] = 158+i;
            wallInsideField[6+i+x] = 180+i;
            wallInsideField[7+i+x] = 424+i;
            wallInsideField[8+i+x] = 446+i;
            x += 3;
        }
    }
    
    document.getElementById(0).style.background = "#000000";
    document.getElementById(37).style.background = "#000000";
    document.getElementById(570).style.background = "#000000";
    document.getElementById(607).style.background = "#000000";
}