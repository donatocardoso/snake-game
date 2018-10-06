// Declaration of letiables
let wallTop = [], wallRight = [], wallBottom = [], wallLeft = [], direction = ["RIGHT"], wallInsideField=[];
let arrayRank=[], countRow = 0, countColumn = 0;
let celulaTable=0, lastBodySnake=0, numberBody = 3, time=600, phase=1;
let snake, neck, follow, ate, RepeatWalk, city, state, country;
let name, point = 0, geoLocation, local;
let onStart = false, pause = false, rankOn = false;

// Event declaration
$(document).ready(function()
{
    // Receives the user"s GeoLocation
    $("body").ready(function()
    {
        navigator.geolocation.getCurrentPosition(function(posicao)
        {
            let url =   "http://nominatim.openstreetmap.org/reverse?lat=" + posicao.coords.latitude+
                        "&lon=" + posicao.coords.longitude + "&format=json&json_callback=fillInData";

            $("body").append($("<script></script>").attr("src", url));
        });
    });

    //Enable button to save user name
    $("input#name").keypress(function()
    {
        $("input#btnName").prop("disabled", $("input#name").val().length < 2);
    });

    // Reads the key that was pressed
    $("body").keypress(function(e)
    {
        e = e || window.event;
        let keyPress = e.key || e.code;

        let keys = [
            "w", "a", "s", "d", "KeyW", "KeyA", "KeyS", "KeyD",
            "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"
        ];
        
        if($("#C0").length && keys.includes(keyPress))
        {
            let goesBy = (
                (["a", "KeyA", "ArrowLeft"].includes(keyPress) && direction[0] != "RIGHT" )
                    ? "LEFT"
                    : (["w", "KeyW", "ArrowUp"].includes(keyPress) && direction[0] != "BOTTOM" )
                        ? "TOP"
                        : (["d", "KeyD", "ArrowRight"].includes(keyPress) && direction[0] != "LEFT" )
                            ? "RIGHT"
                            : (["s", "KeyS", "ArrowDown"].includes(keyPress) && direction[0] != "TOP" )
                                ? "BOTTOM"
                                : null
            );
    
            if(goesBy)
                direction.unshift(goesBy);
        }
        else if(keyPress == 8)
        {
            Info(keyPress);            
        }
        else if(keyPress == 113)
        {
            Rank(keyPress);
        }
    });
});

// Saves the user"s location
function fillInData(data) {
    city = data.address.city;
    state = data.address.state;
    country = data.address.country;
    local = city+" - "+state+" - "+country;
}

// Start the game
async function start()
{
    $("div#load").hide();
    $("#msgStart").html($("#name").val());
    $("#btnInfo").prop("disabled", false).text("PAUSE");
    
    await loadBackground();

    // Creates the snake
    for(i = 0; i < 3; i++)
    {
        lastBodySnake = 306 - i;

        $("td#" + (306 - i + (phase == 1 ? 0 : 1))).html(
            $("<div></div>").attr("id", "C" + i).attr("class", "corpo").css("background", color())
        );
    }
    
    await createFood();

    setRepeatWalk();
}

function setRepeatWalk()
{
    repeatWalk = setInterval(function ()
    {
        let toCell = nextCell();

        if(!hit(toCell))
        {
            console.log($("#food")[0].offsetParent.id == $(toCell)[0].id);

            if($("#food")[0].offsetParent.id == $(toCell)[0].id)
            {
                point++;
                $("#points").html(point);

                var snakeBody = $("<div></div>")
                                .attr("id", "C" + numberBody)
                                .attr("class", "corpo")
                                .css("background", $("#food").css("background"));

                numberBody++;
                $("#food").remove();

                if (time > 100)
                {
                    time -= 50;

                    clearInterval(repeatWalk);
                    setRepeatWalk();
                }

                ((point <= 29 && phase == 1) || 
                (point <= 69 && phase == 2) || 
                (phase == 3))
                    ? createFood()
                    : PassedPhase();
            } 

            for (let i = 0; i < numberBody; i++)
            {
                follow = $("#C" + i)[0].offsetParent;
                    
                if (snakeBody && (numberBody - 2) == i)
                {
                    $(toCell).html($("#C" + i));
                    $(follow).html(snakeBody);
                    snakeBody = null;
                }   
                else
                    $(toCell).html($("#C" + i));

                toCell = follow;
            }
        }
        else
            SaveCache();
    }, time);
}

// Get a random color
function color() {
    let r, g, b, validColor = false;

    while(!validColor) {
        r = Math.round(Math.random()*256);
        g = Math.round(Math.random()*256);
        b = Math.round(Math.random()*256);

        if((r!==221 && g!==221 && b!==221) && (r!==186 && g!==135 && b!==0)){
            validColor = true;
        }
    }
    
    return "rgb("+r+","+g+","+b+")";
}

// Start the game background
function loadBackground()
{
    // Creates the background
    let table = $("<table></table>").attr("id", "background");

    let createTable = "";

    let divGame = {
        width: $("div#game").css("width").replace("px", ""),
        height: $("div#game").css("height").replace("px", "")
    };

    countRow = Math.floor(divGame.height / 28);
    countColumn = Math.floor(divGame.width / 28);

    for (let u = 1; u <= countRow; u++)
    {
        //  Get the id"s from the first column and last column
        wallLeft.push((u * countColumn) - (countColumn - 1));
        wallRight.push(u * countColumn);

        createTable += "<tr>";

        for (let i = 1; i <= countColumn; i++)
        {
            if(u == 1)
            {
                wallTop.push(i);
                wallBottom.push((countColumn * countRow) - (i - 1));
            }

            createTable += "<td class='field' id='" + (((u - 1) * countColumn) + i) + "'></td>";
        }
        
        createTable += "</tr>";
    }

    $(table).html(createTable);
    $("#game").html($(table));
}

// Create food
function createFood()
{
    let validPosition = true;

    // Draw a position
    let positionFood = Math.round(Math.random() * parseInt($("td").length));

    for (let corpo in $(".corpo"))
        if (positionFood == $(corpo).offsetParent.id)
            validPosition = false;

    // Checks whether the position is valid
    if(phase == 2 || phase == 3)
    {
        validPosition = !wallTop.includes(positionFood) ||
                        !wallRight.includes(positionFood) ||
                        !wallBottom.includes(positionFood) ||
                        !wallLeft.includes(positionFood) ||
                        !wallInsideField.includes(positionFood); // Obstacles
    }

    if(validPosition)
    {
        let food = $("<div></div>").attr("id","food").css("background", color());
        $("td#" + positionFood).html(food);

        return;
    }

    return createFood();
}

// Get the next cell
function nextCell()
{
    let headSnake = parseInt($("#C0")[0].offsetParent.id);

    if(direction[2])
        direction.pop();

    if(direction[0] == "LEFT")
    {
        return $("td#" + (wallLeft.includes(headSnake)
                    ? parseInt(headSnake + (countColumn - 1))
                    : parseInt(headSnake - 1)));
    }
    else if(direction[0] == "TOP")
    {
        return $("td#" + (wallTop.includes(headSnake)
                    ? parseInt((countRow * countColumn) - (countColumn - headSnake))
                    : parseInt(headSnake - countColumn)));
    }
    else if(direction[0] == "RIGHT")
    {
        return $("td#" + (wallRight.includes(headSnake) 
                    ? parseInt((headSnake + 1) - countColumn)
                    : parseInt(headSnake + 1)));
    }
    else // if(direction[0] ==  "BOTTOM")
    {
        return $("td#" + (wallBottom.includes(headSnake)
                    ? parseInt((countColumn + headSnake) - (countRow * countColumn))
                    : parseInt(headSnake + countColumn)));
    }
}

// Verify if the snake hit the obstacles
function hit(toCell)
{
    if(phase == 2 || phase == 3)
    {
        return  wallTop.includes($(toCell)[0].id)          ||
                wallRight.includes($(toCell)[0].id)        ||
                wallBottom.includes($(toCell)[0].id)       ||
                wallLeft.includes($(toCell)[0].id)         ||
                wallInsideField.includes($(toCell)[0].id);
        
        for(let i = 1; i <= 36; i++)
            if($(toCell)[0].id == i || $(toCell)[0].id == (i + 570))
                return true;
    }
        
    if(numberBody > 3)
        for (let i = 3; i < numberBody; i++)
            if ($(toCell)[0].id == $("#C" + i)[0].offsetParent.id) 
                return true;
}

function SaveCache()
{
    clearInterval(RepeatWalk); 

    let dataJson = localStorage.getItem("Rank");
    arrayRank = JSON.parse(dataJson);

    if(arrayRank)
    {
        for(i=0; (i < 9 && i < arrayRank.length); i++)
        {
            if($("#points").innerHTML > arrayRank[i].Points)
            {
                CreateObjPunctuation(i);
                i = 10;
            }
            else
            {
                if(i<8)
                {
                    CreateObjPunctuation(i+1);
                    break;
                }
            }
        }
    }
    else
    {  
        arrayRank = [];
        let txtJson = JSON.stringify(arrayRank);
        localStorage.setItem("Rank", txtJson);
        CreateObjPunctuation(0);
    }
}

function CreateObjPunctuation(i){
    if(phase == 2 || phase == 3){
        let url = purl(window.location.href);
        geoLocation = url.param("Location");
    }else{
        geoLocation = local;
    }

    let objInformations = { 
        Name: name,
        Location: geoLocation,
        DayHour: new Date(),
        Points: $("#points").innerHTML
    };
    
    let dataJson = localStorage.getItem("Rank");
    arrayRank = JSON.parse(dataJson);
    if(i==0){
        arrayRank[i] = objInformations;
    }else{
        arrayRank.splice(i,0,objInformations);
        if(arrayRank.length == 9 ){
           arrayRank.splice((arrayRank.length-1),1);
        }
    }
    let txtJson = JSON.stringify(arrayRank);
    localStorage.setItem("Rank", txtJson);

    let winner = document.createElement("div");
    winner.setAttribute("id","loser");

    let createText = "<h1>LOSER !!!</h1>";
    createText += "<p>How annoying, you lost ...<br/>";
    createText += "<button id='btnLoser' onclick='Reset();'>BACK</button></p>";

    winner.innerHTML = createText;
    $("#body").html(winner);
}

function Info(keyPress){
    if(keyPress == 8 && $("#btnInfo").disabled == false){
        if(onStart == true){
            clearInterval(RepeatWalk);
            $("#btnInfo").innerHTML = "CONTINUE";
        }
        let information = document.createElement("div");
        information.setAttribute("id","information");

        let createInformation = "<label id='close' onclick='CloseInfo();'>X</label>";
        createInformation += "<h1>INFORMATIONS</h1>";
        createInformation += "<span>1. <img src='img/setas.jpg'/> The arrows control the snake.<br/></span>";
        createInformation += "<span>2. <img src='img/wasd.png'/> The keys W A S and D also control the snake.<br/></span>";
        createInformation += "<span>3. To pass the stage you need to make 30 points.<br/></span>";
        createInformation += "<span>4. You can see the ranking of the best games with the F2 key.<br/></span>";
        createInformation += "<span>5. You can see the informatons about the game with the BACKSPACE key.<br/></span></p>";

        information.innerHTML = createInformation;
        $("#body").html(information);
        
        $("#btnInfo").setAttribute("disabled", "disable");
    }
}

function CloseInfo(){
    $("#information").hide();

    if(onStart == true && $("#rank") == undefined){
        $("#btnInfo").text("PAUSE");
        $("#btnInfo").prop("disabled", false);
        RepeatWalk();
    }
}

function PassedPhase(){
    clearInterval(RepeatWalk);
    
    let winner = document.createElement("div");
    winner.setAttribute("id","winner");

    let createText = "<h1>WINNER !!!</h1>";
    createText += "<p>Congratulations,<br/>you passed the stage...<br/>";
    createText += "<button id='btnWinner' onclick='NextPhase();'>CONTINUE</button></p>";
    
    winner.innerHTML = createText;
    $("#body").html(winner);
}

function NextPhase(){
    point = $("#points").innerHTML;
    if(phase == 2){
        let url = purl(window.location.href);
        local = url.param("Location");
        window.location.replace("phaseThree.html"+"?Points="+point+"&&Location="+local);
    }else{
        window.location.replace("phaseTwo.html"+"?Points="+point+"&&Location="+local);
    }
}

function Reset(){
    window.location.href = "index.html";
}

function Rank(keyPress){
    if(keyPress == 113 && rankOn == false){
        rankOn = true;
        
        if(onStart == true && $("#C0") != undefined){
            clearInterval(RepeatWalk);
            $("#btnInfo").setAttribute("disabled", "disable");
            $("#btnInfo").innerHTML = "CONTINUE";
        }
        let dataJson = localStorage.getItem("Rank");
        let arrayRank = JSON.parse(dataJson);

        let div = document.createElement("div");
        div.setAttribute("id", "rank");
        div.innerHTML = "<label id='close' onclick='CloseRank();'>X</label>";

        $("#body").html(div);
        
        if(arrayRank !== null){
            div.innerHTML += "<h1>BEST SCORES !!!</h1>";

            let table = document.createElement("table");
            table.setAttribute("id", "bestScore");
            let createTable = "<tr>";
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
            $("#rank").html(table);
        }else{
            div.innerHTML += "<h2>There are no scoring records...</h2>";
        }
    }
}

function CloseRank(){
    $("#rank").remove();
    if(onStart == true && $("#C0") != undefined && $("#information") == undefined){
        $("#btnInfo").innerHTML = "PAUSE";
        $("#btnInfo").removeAttribute("disabled");
        RepeatWalk();
    }
    rankOn = false;
}
