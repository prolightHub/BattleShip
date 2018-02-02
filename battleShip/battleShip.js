var canvas = document.getElementById("canvas");
var processing = new Processing(canvas, function(processing) {
    processing.size(400, 400);
    processing.background(0xFFF);

    var mouseIsPressed = false;
    processing.mousePressed = function () { mouseIsPressed = true; };
    processing.mouseReleased = function () { mouseIsPressed = false; };

    var keyIsPressed = false;
    processing.keyPressed = function () { keyIsPressed = true; };
    processing.keyReleased = function () { keyIsPressed = false; };

    function getImage(s) {
        var url = "https://www.kasandbox.org/programming-images/" + s + ".png";
        processing.externals.sketch.imageCache.add(url);
        return processing.loadImage(url);
    }

    function getLocalImage(url) {
        processing.externals.sketch.imageCache.add(url);
        return processing.loadImage(url);
    }

    // use degrees rather than radians in rotate function
    var rotateFn = processing.rotate;
    processing.rotate = function (angle) {
        rotateFn(processing.radians(angle));
    };

    with (processing) {
        
       var game = {};  
      
       var pointInRect = function(point1, rect1)
       {
           return ((point1.xPos > rect1.xPos && point1.xPos < rect1.xPos + rect1.width) && 
                  (point1.yPos > rect1.yPos && point1.yPos < rect1.yPos + rect1.height));
       };
       var getPlaceInGrid = function(xPos, yPos, grid)
       {
           return {
               col : constrain(round(((xPos - grid.xPos) - grid.unitWidth / 2) / grid.unitWidth), 0, grid.length - 1),
               row : constrain(round(((yPos - grid.yPos) - grid.unitHeight / 2) / grid.unitHeight), 0, grid[0].length - 1),
           };
       };
       var getRandomDirection = function()
       {
           var number = random(0, 100);
           switch(true)
           {
              case number > 75 :
                     return "left";
                 break;
                 
              case number > 50 && number <= 75 :
                     return "right";
                 break;
                 
              case number > 25 && number <= 50 :
                     return "up";
                 break;
                 
              case number <= 25 :
                     return "down";
                 break;
           }
       };
       
       var grid = [];
       grid.ships = {};
       grid.setup = function(xPos, yPos, cols, rows, unitWidth, unitHeight)
       {
           this.xPos = xPos;
           this.yPos = yPos;
           this.unitWidth = unitWidth;
           this.unitHeight = unitHeight;
           this.cols = cols;
           this.rows = rows;
           this.width = cols * unitWidth;
           this.height = rows * unitHeight;
       };
       grid.create = function()
       {
           this.splice(0, this.length);
           for(var col = 0; col < this.cols; col++)
           {
               var input = [];
               for(var row = 0; row < this.rows; row++)
               {
                  input.push('w'); 
               }
               this.push(input);
           }
       };  
       grid.setShip = function(length)
       {
            var ship = {
                startCol : floor(random(0, this.length)),
                startRow : floor(random(0, this[0].length)),
                direction : getRandomDirection(),
            };
            ship.endCol = ship.startCol;
            ship.endRow = ship.startRow;
            var setLength = (length - 1);
            this.cellsTakenByShips += length;
            switch(ship.direction)
            { 
                case "left" : 
                       ship.startCol = max(ship.startCol, setLength);
                       ship.endCol = ship.startCol - setLength; 
                       for(var col = ship.endCol; col <= ship.startCol; col++)
                       {
                           this[col][ship.startRow] = "s";
                       }
                   break;
                   
                case "right" :
                        ship.startCol = min(ship.startCol, (this[0].length - 1) - setLength);
                        ship.endCol = ship.startCol + setLength;
                        for(var col = ship.startCol; col <= ship.endCol; col++)
                        {
                            this[col][ship.endRow] = "s";
                        }
                   break;
                  
                case "up" :
                        ship.startRow = max(ship.startRow, setLength);
                        ship.endRow = ship.startRow - setLength;
                        for(var row = ship.endRow; row <= ship.startRow; row++)
                        {
                            this[ship.startCol][row] = "s";
                        }
                    break;
                
                case "down" :
                        ship.startRow = min(ship.startRow, (this.length - 1) - setLength);
                        ship.endRow = ship.startRow + setLength;
                        for(var row = ship.startRow; row <= ship.endRow; row++)
                        {
                            this[ship.endCol][row] = "s";
                        }
                    break;
            }
       };
       grid.checkForNoShips = function()
       {
           for(var col = 0; col < this.length; col++)
           {
               for(var row = 0; row < this[col].length; row++)
               {
                    if(this[col][row] === 's')
                    {
                        return false;
                    }
               }
           }
           return true;
       };
       grid.checkForIntersectingShips = function()
       {
           var countedCells = 0;
           var waterCount = 0;
           var last = "w";
           for(var col = 0; col < this.length; col++)
           {
               for(var row = 0; row < this[col].length; row++)
               {
                    if(this[col][row] === 'w')
                    {
                         waterCount++;
                    }
                    else if(this[col][row] === 's')
                    {
                        countedCells++;
                    }
               }
           }
           
           return (countedCells < this.cellsTakenByShips) || (waterCount >= this.length * this[0].length);
       };
       grid.setShips = function(smallest, largest)
       {
           this.cellsTakenByShips = 0;
           this.ships = {};
           for(var i = smallest; i <= largest; i++)
           {
                this.setShip(i);
           }
       };
       grid.draw = function()
       {
           for(var col = 0; col < this.length; col++)
           {
               for(var row = 0; row < this[col].length; row++)
               {
                   switch(this[col][row])
                   {
                       case 'x' :
                           fill(45, 45, 45);  
                         break;
                       
                       case '!' :
                           fill(200, 0, 0);
                          break;
                          
                       case 's' :
                           fill(50, 50, 200);
                           if(game.done)
                           {
                               fill(200, 0, 0);
                           }
                           break;
                           
                       case 'w':
                           fill(50, 50, 200);
                         break;
                   }
                   rect(this.xPos + col * this.unitWidth, this.yPos + row * this.unitHeight, this.unitWidth, this.unitHeight);      
               }
           }
       };
       
       grid.setup(45, 45, 10, 10, 30, 30);
       grid.create();
       game.setup = function(bombs, smallest, largest)
       {
           this.bombs = bombs;
           grid.create();
           grid.setShips(smallest, largest);
           
           while(grid.checkForIntersectingShips())
           {  
               grid.create();
               grid.setShips(smallest, largest);  
           }
       };
       
       game.setup(35, 2, 5);
       
       var draw = function()
       {
           background(50, 150, 50); 
           grid.draw();
           
           textSize(18);
           fill(0, 0, 0, 150);
           text(game.bombs + " Bombs", 40, 25);
           
           textAlign(CENTER);
           textSize(30);
           fill(0, 0, 0, 150);
           if(grid.checkForNoShips())
           {
               text("All ships are sunk!", 190, 190);  
               game.done = true;
           }
           else if(game.bombs === 0)
           {
               text("Out of bombs", 190, 190); 
               game.done = true;
           }
           textAlign(NORMAL);
       };
       
       var lastMouseReleased = mouseReleased;
       var mouseReleased = function()
       {
           lastMouseReleased();
           if(game.bombs > 0 && pointInRect({
               xPos : mouseX,
               yPos : mouseY,
           }, grid))
           {
               var place = getPlaceInGrid(mouseX, mouseY, grid);
               if(grid[place.col][place.row] !== 'x' && grid[place.col][place.row] !== '!')
               {
                   if(grid[place.col][place.row] === 'w')
                   {
                       grid[place.col][place.row] = 'x';
                   }
                   else if(grid[place.col][place.row] === 's')
                   {
                       grid[place.col][place.row] = '!';
                   }
                   game.bombs--;
               }
           }
       };
    }
    if (typeof draw !== 'undefined') processing.draw = draw;
});