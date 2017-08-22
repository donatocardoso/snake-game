/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
KeyPress();
DirectionSnake();
Hit();

function StartPhaseTwo(){
    phase = 2;
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
    
    document.getElementById(0).style.background = "#000000";
    document.getElementById(37).style.background = "#000000";
    document.getElementById(570).style.background = "#000000";
    document.getElementById(607).style.background = "#000000";
}