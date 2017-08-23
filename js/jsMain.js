//Declaration of variables
//Declara��o de vari�veis
var columnLeft=[],columnRight=[], direction=["1"], wallInsideField=[], arrayRank=[];
var celulaTable=0, lastBodySnake=0, numberBody=2, snakeBody=2, time=600, phase=1;
var snake, neck, follow, ate, keyPress, RepeatWalk, city, state, country;
var name, point, geoLocation, local;
var onStart = false, pause = false, hit = false, rankOn = false;

//Event declaration - Declara��o de evento

//Receives the user's GeoLocation - Recebe a GeoLocaliza��o do usu�rio
function GeoLocation(){    
    navigator.geolocation.getCurrentPosition(function(posicao) {
        var url =   "http://nominatim.openstreetmap.org/reverse?lat="+posicao.coords.latitude+
                    "&lon="+posicao.coords.longitude+"&format=json&json_callback=FillInData";

        var script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);
    });
}

//Saves the user's location - Salva a localiza��o do usu�rio
function FillInData(data) {
    city = data.address.city;
    state = data.address.state;
    country = data.address.country;
    local = city+" - "+state+" - "+country;
}

//Reads the key that was pressed - L� a tecla que foi pressionada
function KeyPress(){
    document.addEventListener('keydown', function(e) {
        e = e || window.event;
        keyPress = e.which || e.keyCode;
         if(document.getElementById('C0') != undefined && (keyPress == 37 || keyPress == 38 || keyPress == 39 || keyPress == 40 || keyPress == 65 || keyPress == 68 || keyPress == 83 || keyPress == 87)){
            DirectionSnake(keyPress);
            
        }else if(keyPress == 8){
            Info(keyPress);
            
        }else if(keyPress == 113){
            Rank(keyPress);
        }
    });
}

//Saves the user name - Salva o nome do usu�rio
function SaveName() {
    if(onStart === false){
        document.getElementById('btnInfo').setAttribute('disabled', 'disable');
        
        var enterName = document.createElement('div');
        enterName.setAttribute('id','enterName');

        var createEnterName = "<p><h1>ENTER WITH YOUR NAME:</h1>";
        createEnterName += "<input type='text' id='name' placeholder='Name' maxlength='20' autofocus oninput='EnableBtn();'/><br/>";
        createEnterName += "<input type='submit' id='btnName' onclick='Start();' disabled='disable'/></p>";

        enterName.innerHTML = createEnterName;
        document.getElementById('body').appendChild(enterName);
        
        onStart = true;
    }
}

//Enable button to save user name - Habilita o bot�o para salvar o nome do usu�rio
function EnableBtn(){
    var letters = document.getElementById('name').value;
    if(letters.length >= 3){
        document.getElementById('btnName').removeAttribute('disabled');
    }else{
        document.getElementById('btnName').setAttribute('disabled', 'disable');
    }
}

//Start the game - Inicia o jogo
function Start(){  
    //Starts the header - Inicia o cabe�alho
    if(phase === 1){
        name = document.getElementById('name').value;
        document.getElementById('enterName').remove();
    }else{
        onStart = true;
    }
    document.getElementById('msgStart').innerHTML = name;
    document.getElementById('points').innerHTML = 0;
    document.getElementById('btnInfo').removeAttribute('disabled');
    document.getElementById('btnInfo').innerHTML = "PAUSE";
    
    LoadBackground();
    
    //Creates the snake - Cria a cobra
    for(i=0; i<3; i++){
        snake = document.createElement('div');
        snake.setAttribute('id','C'+i);
        snake.setAttribute('class', 'corpo');

        var color = Color();
        snake.setAttribute('style', 'background:'+color);
        
        var x=0;
        if(phase === 2 || phase === 3){
            x=1;
            lastBodySnake = '305';
        }else{
            lastBodySnake = '304';
        }
        document.getElementById(''+(306-i+x)).appendChild(snake);
    }
    
    CreateFood();
    ControlTime();
}

//Start the game background - Inicia o fundo do jogo
function LoadBackground() {
    //Creates the background - Cria o fundo
    var table = document.createElement('table');
    table.setAttribute('id', 'background');

    var createTable = "";
    for (u = 0; u <= 15; u++) {
        createTable += "<tr>";

        for (i = 0; i <= 37; i++) {
            createTable += "<td class='field' id=" + ((u * 38) + i) + "></td>";
        }
        createTable += "</tr>";
    }
    table.innerHTML = createTable;
    document.getElementById('game').appendChild(table);
    
    // Get the id's from the first column and last column - Pega as id's da primeira coluna e ultima coluna
    columnRight[0] = 37;
    for (i = 0; i <= 15; i++) {
        columnLeft[i] = i * 38;
        columnRight[i + 1] = columnRight[i] + 38;
    }
}

//Create food - Cria as comidas
function CreateFood() {
    var validPosition = false;
    while(validPosition === false){
        validPosition = true;
        var color = Color();
        
        //Draw a position - Sortear uma posi��o
        var positionFood = Math.round(Math.random()*608);
        for (i = 0; i <= numberBody; i++){
            if (positionFood == document.getElementById('C'+i).parentNode.id) {
                validPosition = false;
            }
        }
        
        //Checks whether the position is valid - Verifica se a posi��o � v�lida
        if(phase === 2 || phase === 3){
            //Wall left and right - Parede esquerda e direita
            for(i=1; i<=(columnLeft.length-2); i++){
                if(positionFood == columnLeft[i] || positionFood == columnRight[i]){
                    validPosition = false;
                    break;
                }
            }
            
            //Top and bottom wall - Parede de cima e debaixo
            for(i=1; i<=36; i++){
                if(positionFood == i || positionFood == (i+570)){
                    validPosition = false;
                    break;
                }
            }
            
            //obstacles - obst�culos
            if(phase === 3){
                for(i=0; i<=wallInsideField.length-1; i++){
                    if(positionFood == wallInsideField[i]){
                        validPosition = false;
                        break;
                    }
                }
            }
            
            //The corners of the field - Os cantos do campo
            if(positionFood == 1 || positionFood == 37 || positionFood == 570 || positionFood == 607){
                validPosition = false;
            }
        }
    }
    
    var food = document.createElement('div');
    food.setAttribute('id','food');
    food.style.background = color;
    document.getElementById(positionFood).appendChild(food);
}

//
function DirectionSnake(keyPress){
    var goesBy;
    if(onStart === true){
                        
        if(keyPress == 37 || keyPress == 65){
            if(direction[0] !== "1" && direction[1] !== "1"){    
                goesBy = "-1";
            }
        }else if(keyPress == 38 || keyPress == 87){
            if(direction[0] !== "38" && direction[1] !== "38"){
                goesBy = "-38";
            }
        }else if(keyPress == 39 || keyPress == 68){
            if(direction[0] !== "-1" && direction[1] !== "-1"){
                goesBy = "1";
            }
        }else if(keyPress == 40 || keyPress == 83){
            if(direction[0] !== "-38" && direction[1] !== "-38"){
                goesBy = "38";
            }
        }

        var x = direction.length;
        if(direction[x-1] !== goesBy && goesBy !== undefined && direction.length < 3){
            direction.push(goesBy);
        }
    }
}

function ControlTime(){
    RepeatWalk = setInterval(function (){
        var teleport = false; 
        snake = document.getElementById('C0');
        celulaTable = snake.parentNode.id;
        neck = celulaTable; 
        
        if(direction[1] != undefined && direction[1] != null && direction[1] != ""){
            direction.shift();
        }

        switch(direction[0]){
            case "-1":
                for(i=0; i<=columnLeft.length; i++){
                    if(columnLeft[i] == (celulaTable)){
                        celulaTable = parseInt(celulaTable)+37;
                        teleport = true;
                    }
                }
                if(teleport === false){
                    celulaTable--;
                }
                break;
            case "-38":
                celulaTable-= 38;
                if(celulaTable < 0){
                    celulaTable = 608 + parseInt(celulaTable);
                }
                break; 
            case "1":
                for(i=0; i<=columnRight.length; i++){
                    if(columnRight[i] == (celulaTable)){
                        celulaTable = parseInt(celulaTable)-37;
                        teleport = true;
                    }
                }
                if(teleport === false){
                    celulaTable++;
                }
                break;
            case "38":
                celulaTable = parseInt(celulaTable) + 38;

                if (celulaTable > 607) {
                    celulaTable = parseInt(celulaTable) - 608;
                }
                break;
            default:
                break;
        }
        
        Hit();
        var celulaFood = document.getElementById('food').parentNode.id;
        if(hit === false && celulaFood == celulaTable){
            point = document.getElementById('points').innerHTML;
            document.getElementById('points').innerHTML = (parseInt(point)+1);

            numberBody += 1;
            snakeBody = document.createElement('div');
            snakeBody.setAttribute('class', 'corpo');
            snakeBody.setAttribute('id', 'C' + numberBody);
            snakeBody.style.background = document.getElementById('food').style.background;

            document.getElementById('food').remove();

            if (numberBody > 1) {
                document.getElementById(follow).appendChild(snakeBody);
            }
            document.getElementById(celulaTable).appendChild(snake);
            FollowBody();

            if (time > 100) {
                time -= 50;
                clearInterval(RepeatWalk);
                ControlTime();
            }

            if((point < 29 && phase != 2) || (point < 69 && phase == 2)){
                CreateFood();
            }else{
                if(phase != 3){
                    PassedPhase();
                }else{
                    CreateFood();
                }
            }
        } else {
            if(hit === false){
                document.getElementById(celulaTable).appendChild(snake);
                FollowBody();
            }
        }  
    },time);
}

function Hit() {
    var finishGame = false;
    if(phase === 2 || phase === 3){
        for(i=1; i<=(columnLeft.length-2); i++){
            if(celulaTable == columnLeft[i] || celulaTable == columnRight[i]){
                finishGame = true;
            }
        }
        
        for(i=1; i<=36; i++){
            if(celulaTable == i || celulaTable == (i+570)){
                finishGame = true;
            }
        }
        if(phase === 3){
            for(i=0; i<=wallInsideField.length-1; i++){
                if(celulaTable == wallInsideField[i]){
                    finishGame = true;
                }
            }
        }
    }
        
    if(numberBody > 3){
        for (i=3; i<=numberBody; i++) {
            if (celulaTable == document.getElementById('C'+i).parentNode.id){
                finishGame = true;
            }
        }
    }
    
    if(finishGame === true){
        clearInterval(RepeatWalk); 
        hit = true;

        var dataJson = localStorage.getItem("Rank");
        arrayRank = JSON.parse(dataJson);

        if(arrayRank != null){
            for(i=0; (i<9 && i<arrayRank.length); i++){
                if(document.getElementById("points").innerHTML > arrayRank[i].Points){
                    CreateObjPunctuation(i);
                    i = 10;
                }else{
                    if(i<8){
                        CreateObjPunctuation(i+1);
                        break;
                    }
                }
            }
        }else{  
            arrayRank = [];
            var txtJson = JSON.stringify(arrayRank);
            localStorage.setItem("Rank", txtJson);
            CreateObjPunctuation(0);
        }
    }
}

function CreateObjPunctuation(i){
    if(phase == 2 || phase == 3){
        var url = purl(window.location.href);
        geoLocation = url.param('Location');
    }else{
        geoLocation = local;
    }

    var objInformations = { 
        Name: name,
        Location: geoLocation,
        DayHour: new Date(),
        Points: document.getElementById("points").innerHTML
    };
    
    var dataJson = localStorage.getItem("Rank");
    arrayRank = JSON.parse(dataJson);
    if(i==0){
        arrayRank[i] = objInformations;
    }else{
        arrayRank.splice(i,0,objInformations);
        if(arrayRank.length == 9 ){
           arrayRank.splice((arrayRank.length-1),1);
        }
    }
    var txtJson = JSON.stringify(arrayRank);
    localStorage.setItem("Rank", txtJson);

    var winner = document.createElement('div');
    winner.setAttribute('id','loser');

    var createText = "<h1>LOSER !!!</h1>";
    createText += "<p>How annoying, you lost ...<br/>";
    createText += "<button id='btnLoser' onclick='Reset();'>BACK</button></p>";

    winner.innerHTML = createText;
    document.getElementById('body').appendChild(winner);
}

function FollowBody() {
    for (i = 1; i <= numberBody; i++){
        follow = document.getElementById('C'+i).parentNode.id;
        document.getElementById(neck).appendChild(document.getElementById('C'+i));
        neck = follow;
    }
}

function Info(keyPress){
    if(keyPress == 8 && document.getElementById('btnInfo').disabled == false){
        if(onStart === true){
            clearInterval(RepeatWalk);
            document.getElementById('btnInfo').innerHTML = "CONTINUE";
        }
        var information = document.createElement('div');
        information.setAttribute('id','information');

        var createInformation = "<label id='close' onclick='CloseInfo();'>X</label>";
        createInformation += "<h1>INFORMATIONS</h1>";
        createInformation += "<span>1. <img src='img/setas.jpg'/> The arrows control the snake.<br/></span>";
        createInformation += "<span>2. <img src='img/wasd.png'/> The keys W A S and D also control the snake.<br/></span>";
        createInformation += "<span>3. To pass the stage you need to make 30 points.<br/></span>";
        createInformation += "<span>4. You can see the ranking of the best games with the F2 key.<br/></span>";
        createInformation += "<span>5. You can see the informatons about the game with the BACKSPACE key.<br/></span></p>";

        information.innerHTML = createInformation;
        document.getElementById('body').appendChild(information);
        
        document.getElementById('btnInfo').setAttribute('disabled', 'disable');
    }
}

function CloseInfo(){
    document.getElementById('information').remove();
    if(onStart === true && document.getElementById('rank') == undefined){
        document.getElementById('btnInfo').innerHTML = "PAUSE";
        document.getElementById('btnInfo').removeAttribute('disabled');
        ControlTime();
    }
}

function Color(){
    var validColor = false;
    while(validColor === false){
        var r = Math.round(Math.random()*256);
        var g = Math.round(Math.random()*256);
        var b = Math.round(Math.random()*256);

        if((r!==221 && g!==221 && b!==221) && (r!==186 && g!==135 && b!==0)){
            validColor = true;
        }
    }
    
    return "rgb("+r+","+g+","+b+")";
}

function PassedPhase(){
    clearInterval(RepeatWalk);
    
    var winner = document.createElement('div');
    winner.setAttribute('id','winner');

    var createText = "<h1>WINNER !!!</h1>";
    createText += "<p>Congratulations,<br/>you passed the stage...<br/>";
    createText += "<button id='btnWinner' onclick='NextPhase();'>CONTINUE</button></p>";
    
    winner.innerHTML = createText;
    document.getElementById('body').appendChild(winner);
}

function NextPhase(){
    point = document.getElementById('points').innerHTML;
    if(phase === 2){
        var url = purl(window.location.href);
        local = url.param('Location');
        window.location.replace('phaseThree.html'+"?Points="+point+"&&Location="+local);
    }else{
        window.location.replace('phaseTwo.html'+"?Points="+point+"&&Location="+local);
    }
}

function Reset(){
    window.location.href = "index.html";
}

function Rank(keyPress){
    if(keyPress == 113 && rankOn === false){
        rankOn = true;
        
        if(onStart === true && document.getElementById('C0') != undefined){
            clearInterval(RepeatWalk);
            document.getElementById('btnInfo').setAttribute('disabled', 'disable');
            document.getElementById('btnInfo').innerHTML = "CONTINUE";
        }
        var dataJson = localStorage.getItem("Rank");
        var arrayRank = JSON.parse(dataJson);

        var div = document.createElement('div');
        div.setAttribute('id', 'rank');
        div.innerHTML = "<label id='close' onclick='CloseRank();'>X</label>";

        document.getElementById('body').appendChild(div);
        
        if(arrayRank !== null){
            div.innerHTML += "<h1>BEST SCORES !!!</h1>";

            var table = document.createElement('table');
            table.setAttribute('id', 'bestScore');
            var createTable = "<tr>";
                    createTable += "<td class='title'>NAME</td>";
                    createTable += "<td class='title'>LOCATION</td>";
                    createTable += "<td class='title'>DAY/HOUR</td>";
                    createTable += "<td class='title'>POINTS</td>";
                createTable += "</tr>";
                
            for (i=0; i<arrayRank.length; i++) {
                createTable += "<tr>";
                    createTable += "<td class='name'>"+arrayRank[i].Name+"</td>";
                    createTable += "<td class='local'>"+arrayRank[i].Location+"</td>";
                    createTable += "<td class='date'>"+arrayRank[i].DayHour+"</td>";
                    createTable += "<td class='point'>"+arrayRank[i].Points+"</td>";
                createTable += "</tr>";
            }
            table.innerHTML = createTable;
            document.getElementById('rank').appendChild(table);
        }else{
            div.innerHTML += "<h2>There are no scoring records...</h2>";
        }
    }
}

function CloseRank(){
    document.getElementById('rank').remove();
    if(onStart === true && document.getElementById('C0') != undefined && document.getElementById('information') == undefined){
        document.getElementById('btnInfo').innerHTML = "PAUSE";
        document.getElementById('btnInfo').removeAttribute('disabled');
        ControlTime();
    }
    rankOn = false;
}