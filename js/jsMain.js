// Declaration of letiables
let wallTop = [], wallRight = [], wallBottom = [], wallLeft = [], direction = ["RIGHT"], wallInsideField = [];
let arrayRank = [], countRow = 0, countColumn = 0, numberBody = 3, time = 600, phase = 1, point = 0;
let snake, follow, city, state, country, name, geoLocation, local;

// Event declaration
$(document).ready(function()
{
    // Receives the user"s GeoLocation
    navigator.geolocation.getCurrentPosition(function(posicao)
    {
        let url =   "http://nominatim.openstreetmap.org/reverse?lat=" + posicao.coords.latitude+
                    "&lon=" + posicao.coords.longitude + "&format=json&json_callback=fillInData";

        $("body").append($("<script></script>").attr("src", url));
    });

    // Reads the key that was pressed
    $("body").keypress(function(e)
    {
        e = e || window.event;
        let keyPress = e.key.toString() || e.code.toString();

        let keys = [
            "w", "a", "s", "d", "KeyW", "KeyA", "KeyS", "KeyD",
            "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"
        ];
        console.log(keyPress);
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
        else if(keyPress == "p" || keyPress == "KeyP")
        {
            information();
        }
    });

    //Enable button to save user name
    $("input#name").keypress(function()
    {
        $("input#btnName").prop("disabled", $("input#name").val().length < 2);
    });

});

// Saves the user"s location
function fillInData(data)
{
    city = data.address.city;
    state = data.address.state;
    country = data.address.country;
    local = city+" - "+state+" - "+country;
}

// Start the game
async function start()
{
    $("div#game").empty();
    $("div#winner").hide();
    $("div#enterName").hide();
    $("div#background").hide();

    $("#msgStart").html($("#name").val());
    $("#btnInfo").prop("disabled", false).text("PAUSE");
    
    await loadBackground();

    if(phase == 2 || phase == 3)
    {
        for (let i = 0; i < wallTop.length; i++)
        {
            $("td#" + wallTop[i]).attr("class", "wall");
            $("td#" + wallBottom[i]).attr("class", "wall");
        }

        for (let i = 0; i < wallLeft.length; i++)
        {
            $("td#" + wallLeft[i]).attr("class", "wall");
            $("td#" + wallRight[i]).attr("class", "wall");
        }

        if(phase == 3)
            for(let i = 0; i < 15; i++)
                await createObstacles();
    }

    let startPosition = parseInt($("div#game table tr:nth(5) td:nth(4)")[0].id);
    // Creates the snake
    for(i = 0; i < 3; i++)
    {
        $("td#" + (startPosition - i + (phase == 1 ? 0 : 1))).html(
            $("<div></div>").attr("id", "C" + i).attr("class", "corpo").css("background", color())
        );
    }
    
    await createFood();

    setRepeatWalk();
}

// Set loop for snake walk
function setRepeatWalk()
{
    repeatWalk = setInterval(function ()
    {
        try
        {
            let toCell = nextCell();

            if(!hit(toCell))
            {
                if($("#food").length > 0)
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
                            : passedPhase();
                    } 

                for (let i = 0; i < numberBody; i++)
                {
                    follow = $("#C" + i)[0].offsetParent;
                        
                    if (snakeBody && (numberBody - 2) == i)
                    {
                        $(toCell).append($("#C" + i));
                        $(follow).append(snakeBody);
                        snakeBody = null;
                        i++;
                    }   
                    else
                        $(toCell).append($("#C" + i));

                    toCell = follow;
                }
            }
            else
            {
                clearInterval(repeatWalk);
                $("div#background").show();
                $("div#loser").slideDown("fast");
            }
        }
        catch(e)
        {
            clearInterval(repeatWalk);

            $("div#background").show();
            $("div#winner").slideDown("fast");
            alert("OPS! Ocorreu um erro inesperado, atualize a pagina e continue jogando...");
            
            console.log(e);         
        }
    }, time);
}

// Get a random color
function color()
{
    let r, g, b, validColor = false;

    while(!validColor)
    {
        r = Math.round(Math.random() * 256);
        g = Math.round(Math.random() * 256);
        b = Math.round(Math.random() * 256);

        validColor = (r != 221 && g != 221 && b != 221) && (r != 186 && g !=135 && b != 0);
    }
    
    return "rgb(" + r + "," + g + "," + b + ")";
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
    countColumn = Math.floor(divGame.width / 30);

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

// Create obstacles
function createObstacles()
{
    let positionWall = Math.round(Math.random() * parseInt($("td").length));

    if(wallTop.includes(positionWall)      || wallRight.includes(positionWall) ||
       wallBottom.includes(positionWall)   || wallLeft.includes(positionWall))
       return createObstacles();

    wallInsideField.push(positionWall);
    $("td#" + positionWall).attr("class", "wall");
    return;
}

// Create food
function createFood()
{
    let validPosition = true;

    // Draw a position
    let positionFood = Math.round(Math.random() * parseInt($("td").length));

    // Checks the position is the position snake's body
    for (let i = 0; i < (numberBody - 1); i++)
        if (positionFood == parseInt($("#C" + i)[0].offsetParent.id))
        {
            validPosition = false;
            continue;
        }

    // Checks whether the position is valid
    if(validPosition && (phase == 2 || phase == 3))
    {
        validPosition = !wallTop.includes(positionFood) &&
                        !wallRight.includes(positionFood) &&
                        !wallBottom.includes(positionFood) &&
                        !wallLeft.includes(positionFood) &&
                        !wallInsideField.includes(positionFood); // Obstacles
    }

    if(!validPosition)
        return createFood();

    let food = $("<div></div>").attr("id","food").css("background", color());
    $("td#" + positionFood).html(food);
    return;
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
    let toCellID = parseInt($(toCell)[0].id);

    if(phase == 2 || phase == 3)
    {
        if(wallTop.includes(toCellID) ||
            wallRight.includes(toCellID) ||
            wallBottom.includes(toCellID) ||
            wallLeft.includes(toCellID) ||
            wallInsideField.includes(toCellID))
            return true;
    }

    if(numberBody > 4)
    {
        for (let i = 0; i < numberBody; i++)
            if (toCellID == $("#C" + i)[0].offsetParent.id) 
                return true;
    }
    
    return toCellID == $("#C1")[0].offsetParent.id;
}

// Show mensage the player passed the stage
function passedPhase()
{
    clearInterval(repeatWalk);
    
    time = 600;
    numberBody = 3;
    wallTop = [];
    wallRight = [];
    wallBottom = [];
    wallLeft = [];
    direction = ["RIGHT"];
    wallInsideField = [];

    $("div#background").show();
    $("div#winner").slideDown("fast");
}

// Show informations about the game
function information()
{
    if(!$("button#btnInfo").prop("disabled"))
    {
        clearInterval(repeatWalk);

        $("div#background").show();
        $("div#information").slideDown("fast");
        $("button#btnInfo").text("CONTINUE").prop("disabled", true);
    }
}

// Close informations about the game
function closeInfo()
{
    $("div#background").hide();
    $("div#information").slideUp("fast");
    $("button#btnInfo").text("PAUSE").prop("disabled", false);

    setRepeatWalk();
}

// Reload page
function reset()
{
    window.location.href = "index.html";
}
