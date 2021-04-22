/*
  Purpose: To display a love triangle but it's now abstract. the purpose
  of the game is to click the screen when the three circles become concentric,
  and scoring is based off how close it was
  Author: Nicholas Liu
  Date: 12/15/19
*/

//some colors used
//pink,red,blue,yellow
var colorList = ["#ffc0cb", "#ff0000", "#add8e6", "#ffff00"];
//background song
songs = ["mir.mp3","meg.mp3","jojo.mp3","takeOnMe.mp3","Flamingo.mp3","cw.mp3","rick.mp3"];
randomSong = songs[0];
var bgSong = new Audio(randomSong);
bgSong.playbackRate = 10;
bgSong.volume=1;
//beep sound effect
//var beep = new Audio('coin.mp3');
//beep.playbackRate = 1;
//timer to keep track of length of game
var start = new Date();

function Goal (point, radius) {
  /*
  Every attribute needed for the goal circle
  Inputs:
    point in the form: (x,y)
    radius in the form: r
  */
  this.xVal = point[0];
  this.yVal = point[1];
  this.radius = radius;

  //the speed of the y movement of the goal is randomized
  this.travelDistance = randrange(0,canvas.height/370);
  //by default the goal won't move
  this.run = false;

  //initializizes intercept variables needed
  this.distanceToIntercept = 0;
  this.intercept = false;           //by default won't intercept
  this.interceptCounter = 0;

  //variable for how much the player misses the goal
  this.xMiss = 0;
  this.yMiss = 0;

  this.change = function () {
    //normal goal movement
    if (this.run) {
      //rebounds when it hits a horizontal boundary
      if (this.yVal >= canvas.height) {
        this.travelDistance = randrange(canvas.height/-370,0);
      } else if (this.yVal <= 0) {
        this.travelDistance = randrange(0,canvas.height/370);
      } else {
        //speeds up the goal as it travels
        this.travelDistance *= 1.005;
      }
      //moves the goal along y axis
      this.yVal += this.travelDistance;
    }
    //player movement when chasing the goal
    if (this.intercept) {
      //it uses the player's intercept speed to determine how many increments are needed
      if (this.interceptCounter < player.interceptSpeed) {
        //moves by how far it needs to intercept the player
        this.yVal += this.distanceToIntercept/player.interceptSpeed;
        this.interceptCounter ++;
      } else {
        //once the intercept is reached it switches back to normal run mode
        this.interceptCounter = 0;
        this.intercept = false;
        this.run = true;
      }
    }
  }
}

function Player(point, direction, radius, colorIndex) {
  /*
  Every attribute needed for the player circle
  Inputs:
    point in the form: (x,y)
    direction in the form: (x,y)
    radius in the form: r
    colorIndex: c
  */
  //point
  this.xVal = point[0];
  this.yVal = point[1];
  //direction
  this.dX = direction[0];
  this.dY = direction[1];
  //console.log(this.dX,this.dY);

  this.radius = radius;
  this.colorIndex = colorIndex;

  //to keep track of score
  this.score = 0;
  this.scoreAdd = 0;
  //by defaut won't run
  this.run = false;

  //initilizes an intercept point variable
  this.interceptPoint = [canvas.width/2, canvas.height/2];
  //keeps track of distance needed to reach intercept point with vectors
  this.XdistanceToIntercept = 0;
  this.YdistanceToIntercept = 0;
  //by default won't intercept
  this.intercept = false;
  this.interceptCounter = 0;
  //100 increments ot reach the intercept goal
  //higher the interceptSpeed, the lower the speed
  this.interceptSpeed = 100;

  //only allows the user to click once for each run across the screen
  this.pressed = false;
  //cheat that gives user all 5's for scores
  this.cheat = false;
  //pretend cheat that isn't as good as real cheat
  this.fakeCheat = false;
  //cheat inidicator color
  this.cic = 2;

  this.change = function () {
    //normal running
    if (this.run) {
      //if the player hits a vertical boundary, it will call the intercept protocol
      if (this.xVal<player.radius || this.xVal>canvas.width-player.radius) {
        this.interceptProtocol();
      } else if(this.yVal<player.radius || this.yVal>canvas.height-player.radius) {
        this.interceptProtocol();
      } else {
        //otherwise it runs normally
        //console.log(this.dY);
        this.xVal += this.dX;
        this.yVal += this.dY;
      }
    }

    if (this.intercept) {
      if (this.interceptCounter < this.interceptSpeed) {
        //moves the player to the goal with necessary increment
        this.xVal += this.XdistanceToIntercept/this.interceptSpeed;
        this.yVal += this.YdistanceToIntercept/this.interceptSpeed;
        this.interceptCounter ++;
        this.colorIndex = 0;
        //color of player changes to red when it's close to hitting the goal
        // if (this.interceptCounter > 90) {
        //   this.colorIndex = 1;
        //}
      } else {
        //resets to normal run mode once it intercepts
        this.interceptCounter = 0;
        this.intercept = false;
        this.run = true;
        this.colorIndex = 2;
      }
    }
  }

  this.interceptProtocol = function() {
    //creates a random intercept point
    while (true) {
      var newIntercept = randrange(goal.radius*2,canvas.height-goal.radius*2)
      if (Math.abs(this.interceptPoint[1]-newIntercept) > canvas.height/5) {
        this.interceptPoint = [canvas.width/2, newIntercept];
        break;
      }
    }
    //this.distanceToIntercept = Math.sqrt(Math.abs(this.interceptPoint[1]-player.yVal)**2+Math.abs(this.interceptPoint[0]-player.xVal)**2);
    //finds the distance that it needs to move
    this.XdistanceToIntercept = this.interceptPoint[0]-this.xVal;
    //creates the increment that it moves once it goes back into normal run mode
    this.dX = this.XdistanceToIntercept/100;
    this.YdistanceToIntercept = this.interceptPoint[1]-this.yVal;
    //divides by 1,000 because I want the ball to be moving horizontally and less vertically
    this.dY = this.YdistanceToIntercept/1000;
    //creates intercept distance of the goal
    goal.distanceToIntercept = this.interceptPoint[1]-goal.yVal;
    //puts the player into intercept mode
    this.run = false;
    this.intercept = true;
    goal.run = false;
    goal.intercept = true;
    //allows user to press space bar
    this.pressed = false;
  }
}

function randrange (min, max) {
  /*
  Purpose: Helper function to mimic some of python's random.randrange().
  Parameters: min, max of the range
  Returns: Random number n, min <= n < max.
  */
  return Math.floor(Math.random() * (max - min)) + min;
}

function drawAll() {
  /*
    Purpose: This is the main drawing loop.
    Inputs: None, but it is affected by what the other functions are doing
    Returns: None, but it calls itself to cycle to the next frame
  */
  context.clearRect(0, 0, canvas.width, canvas.height);

  //changes font size based off width and height
  fontSize = Math.sqrt((canvas.width*30/1400)*(canvas.height*30/750));
  context.font = fontSize + "px Comic Sans MS";
  context.textAlign = "center";

  //draws lines to connect everything
  context.beginPath();
  context.strokeStyle = "white";
  context.lineWidth = canvas.height/74;
  //player-goal
  context.moveTo(player.xVal,player.yVal);
  context.lineTo(goal.xVal,goal.yVal);
  //goal-target
  context.moveTo(goal.xVal,goal.yVal);
  context.lineTo(canvas.width/2,player.interceptPoint[1]);
  //target-player
  context.moveTo(canvas.width/2,player.interceptPoint[1]);
  context.lineTo(player.xVal,player.yVal);
  context.stroke();

  if (Math.abs(goal.xMiss) < canvas.width*0.1) {
    //draws lines to connect everything in the top corner
    context.beginPath();
    context.strokeStyle = "white";
    context.lineWidth = canvas.height/74;
    //player-goal
    context.moveTo(canvas.width*0.85+goal.xMiss,canvas.height*0.15+goal.yMiss);
    context.lineTo(canvas.width*0.85,canvas.height*0.15);
    //goal-target
    context.moveTo(canvas.width*0.85,canvas.height*0.15);
    context.lineTo(canvas.width*0.85,canvas.height*0.15+goal.targetMiss);
    //target-player
    context.moveTo(canvas.width*0.85,canvas.height*0.15+goal.targetMiss);
    context.lineTo(canvas.width*0.85+goal.xMiss,canvas.height*0.15+goal.yMiss);

    context.stroke();
  }

  //calculates time elapsed based off start time
  var elapsed = new Date() - start;
  //checks if the song is over based off elapsed time
  if (elapsed/1000 > bgSong.duration/bgSong.playbackRate) {
    //makes everything stop moving
    player.run = false;
    player.intercept = false;
    goal.run = false;
    goal.intercept = false;
  }

  //draws the target
  context.beginPath();
  context.lineWidth = canvas.height/740;
  context.strokeStyle = "white";
  context.fillStyle = colorList[0];
  context.arc(canvas.width/2,player.interceptPoint[1],goal.radius+canvas.height/74,0,Math.PI*2);
  context.fill();
  //PICTURE
  //context.drawImage(michaelPic, canvas.width/2-goal.radius, player.interceptPoint[1]-goal.radius, goal.radius*2, goal.radius*2);
  context.stroke();
  /*
  context.fillStyle = "white";
  context.fillText("a.f.", canvas.width/2,player.interceptPoint[1]+10);
  */

  //only displays where the target intercepted if the player was somewhere close
  if (Math.abs(goal.xMiss) < canvas.width*0.1) {
    context.beginPath();
    context.strokeStyle = colorList[player.cic];
    context.fillStyle = colorList[0];
    context.arc(canvas.width*0.85,canvas.height*0.15+goal.targetMiss,goal.radius+canvas.height/74,0,Math.PI*2);
    context.fill();
    //PICTURE
    //context.drawImage(rolanPic, canvas.width*0.85+goal.xMiss-player.radius,canvas.height*0.15+goal.yMiss-player.radius, player.radius*2, player.radius*2)
    context.stroke();
  }

  //displays previous intercept in the top right
  context.beginPath();
  context.strokeStyle = colorList[player.cic];
  context.fillStyle = colorList[2];
  context.arc(canvas.width*0.85,canvas.height*0.15,goal.radius,0,Math.PI*2);
  context.fill();
  //PICTURE
  //context.drawImage(ethanPic, canvas.width*0.85-goal.radius, canvas.height*0.15-goal.radius, goal.radius*2, goal.radius*2);
  context.stroke();

  //only displays where the player intercepted if they were somewhere close
  if (Math.abs(goal.xMiss) < canvas.width*0.1) {
    context.beginPath();
    context.strokeStyle = "white";
    context.fillStyle = colorList[0];
    context.arc(canvas.width*0.85+goal.xMiss,canvas.height*0.15+goal.yMiss,player.radius,0,Math.PI*2);
    context.fill();
    context.fillStyle = "white";
    context.fillText("+" + player.scoreAdd, canvas.width*0.85+goal.xMiss, canvas.height*0.15+goal.yMiss+player.radius/3);
    //PICTURE
    //context.drawImage(rolanPic, canvas.width*0.85+goal.xMiss-player.radius,canvas.height*0.15+goal.yMiss-player.radius, player.radius*2, player.radius*2)
    context.stroke();
  } else {
    context.fillStyle = "white";
    context.fillText("+" + player.scoreAdd, canvas.width*0.85, canvas.height*0.15+player.radius/3);
  }

  //creates goal circle
  context.beginPath();
  context.strokeStyle = colorList[2];
  context.fillStyle = colorList[2];
  context.arc(goal.xVal,goal.yVal,goal.radius,0,Math.PI*2);
  context.fill();
  //PICTURE
  //context.drawImage(ethanPic, goal.xVal-goal.radius,goal.yVal-goal.radius, goal.radius*2, goal.radius*2);
  context.stroke();

  //creates the player circle
  context.beginPath();
  //console.log(colorList[ball.colorIndex]);
  context.strokeStyle = colorList[player.colorIndex];
  context.fillStyle = colorList[player.colorIndex];
  //console.log(ball.yVal)
  context.arc(player.xVal,player.yVal,player.radius,0,Math.PI*2);
  context.fill();
  context.fillStyle = "white";
  //PICTURE
  //context.drawImage(rolanPic, player.xVal-player.radius,player.yVal-player.radius, player.radius*2, player.radius*2);
  //context.fillText("score: " + player.score, canvas.width/2+goal.radius+80, goal.yVal+10);
  context.fillText(player.score, canvas.width/2, goal.yVal+goal.radius/3);
  context.stroke();

  // Loop the animation to the next frame.
  window.requestAnimationFrame(drawAll);
}

function moveStuff() {
  /*
    Purpose: Modify the player and goal
    Parameters: None
    Returns: None
  */
  //calls the player and goal functions to move them
  player.change();
  goal.change();
}

function getRandomSong() {
  /*
    Purpose: get a random song
    Parameters: None
    Returns: random song in the form of a string
  */
  songIndex = randrange(0,songs.length-1);
  randomSong = songs[songIndex];
  return randomSong;
}

function myKeyDown(event) {
//   /*
//     Purpose: user presses space bar to play game and enter for a new game
//     Input: KeyPress event
//     Returns: None
//   */
//   //Find out which key has been pressed.
//   keyCode = event.which;
//   console.log(keyCode);
//   console.log(String.fromCharCode(keyCode));
//   //check distance for scoring (space)
//   if (keyCode == 32) {
//     //only counts the press if this is the first press and the song is playing
//     if (!player.pressed && bgSong.currentTime != 0) {
//       //won't let them press again
//       player.pressed = true;
//       //creates a fake intercept that gaurantees a score of 5
//       if (player.cheat) {
//         goal.yMiss = randrange(-5,5);
//         goal.xMiss = randrange(-5,5);
//         goal.targetMiss = randrange(-5,5);
//         player.scoreAdd = 5;
//       } else if (player.fakeCheat) {
//         var rand = randrange(1,4);
//         //sometimes gives a score of 1
//         if (rand == 1) {
//           goal.yMiss = randrange(-50,50);
//           goal.xMiss = randrange(-50,50);
//           goal.targetMiss = randrange(-50,50);
//           player.scoreAdd = 1;
//         } else {
//           //most times gives a score of 5
//           goal.yMiss = randrange(-5,5);
//           goal.xMiss = randrange(-5,5);
//           goal.targetMiss = randrange(-5,5);
//           player.scoreAdd = 5;
//         }
//       } else {
//         //normal non cheat gameplay
//         var distance = Math.sqrt(Math.abs(goal.yVal-player.yVal)**2+Math.abs(goal.xVal-player.xVal)**2);
//         //these keep track of the itercept to draw it later int he top right corner
//         goal.yMiss = player.yVal-goal.yVal;
//         goal.xMiss = player.xVal-goal.xVal;
//         goal.targetMiss = player.yVal-player.interceptPoint[1];
//         //decides score baed off distance
//         if (distance < 5) {
//           player.scoreAdd = 5;
//         } else if (distance < 40) {
//           player.scoreAdd = 3;
//         } else if (distance < 70) {
//           player.scoreAdd = 1;
//         } else {
//           player.scoreAdd = 0;
//         }
//       }
//       player.score += player.scoreAdd;
//     }
//     /*
//     var plays = 0;
//     var playBeeps = setInterval(function() {
//       if (plays < player.scoreAdd) {
//         beep.play();
//         plays++;
//       } else {
//         clearInterval(playBeeps);
//       }
//     }, beep.length/beep.playbackRate);
//     */
//     //changes volume of the beep based off score
//     //beep.volume = player.scoreAdd/5;
//     //plays sound
//     //beep.currentTime = 2;
//     //beep.play();
//   }
//   //press enter for new game
//   if (keyCode == 13) {
//     //resets all positions to the original spots
//     goal.xVal = canvas.width/2;
//     goal.yVal = canvas.height/2;
//     player.xVal = canvas.width/2;
//     player.yVal = canvas.height/2;
//     //starts normal run
//     goal.run = true;
//     player.run = true;
//     //resets score
//     player.score = 0;
//     //resets time
//     start = new Date();
//     //resets song
//     bgSong.currentTime = 0
//     bgSong.play();
//   }
//   //command button to toggle cheat button
//   if (keyCode == 93) {
//     if (player.cheat) {
//       player.cheat = false;
//       player.cic = 2;
//     } else {
//       player.cheat = true;
//       player.fakeCheat = false;
//       player.cic = 1;
//     }
//   }
//   //"c" to toggle fake cheat button
//   if (keyCode == 67) {
//     if (player.fakeCheat) {
//       player.fakeCheat = false;
//       player.cic = 2;
//     } else {
//       player.fakeCheat = true;
//       player.cheat = false;
//       player.cic = 3;
//     }
//   }
}

function mousedown(event) {
  /*
  purpose: uses the users mouse click to either score the game or to enter
  a cheat mode
  inputs: mousedown event
  returns: none but modifies many attributes of the player and goal object
  */
  xClick = event.screenX;
  yClick = event.screenY;
  //console.log(xClick, yClick);
  //real cheat is bottom left
  if (xClick<canvas.width*0.1 && yClick>canvas.height*0.95) {
    if (player.cheat) {
      player.cheat = false;
      player.cic = 2;
    } else {
      player.cheat = true;
      player.fakeCheat = false;
      player.cic = 1;
    }
  }
  //fake cheat is bottom right
  else if (xClick>canvas.width*0.95 && yClick>canvas.height*0.95) {
    if (player.fakeCheat) {
      player.fakeCheat = false;
      player.cic = 2;
    } else {
      player.fakeCheat = true;
      player.cheat = false;
      player.cic = 3;
    }
  }
  else if (player.run || player.intercept) {
    //only counts the press if this is the first press and the song is playing
    if (!player.pressed && bgSong.currentTime != 0) {
      //won't let them press again
      player.pressed = true;
      //creates a fake intercept that gaurantees a score of 5
      if (player.cheat) {
        goal.yMiss = randrange(canvas.width/-270,canvas.width/270);
        goal.xMiss = randrange(canvas.width/-270,canvas.width/270);
        goal.targetMiss = randrange(canvas.width/-270,canvas.width/270);
        player.scoreAdd = 5;
      } else if (player.fakeCheat) {
        var rand = randrange(1,4);
        //sometimes gives a score of 1
        if (rand == 1) {
          goal.yMiss = randrange(canvas.width/-27,canvas.width/27);
          goal.xMiss = randrange(canvas.width/-27,canvas.width/27);
          goal.targetMiss = randrange(canvas.width/-27,canvas.width/27);
          player.scoreAdd = 1;
        } else {
          //most times gives a score of 5
          goal.yMiss = randrange(canvas.width/-270,canvas.width/270);
          goal.xMiss = randrange(canvas.width/-270,canvas.width/270);
          goal.targetMiss = randrange(canvas.width/-270,canvas.width/270);
          player.scoreAdd = 5;
        }
      } else {
        //normal non cheat gameplay
        var distance = Math.sqrt(Math.abs(goal.yVal-player.yVal)**2+Math.abs(goal.xVal-player.xVal)**2);
        //these keep track of the itercept to draw it later int he top right corner
        goal.yMiss = player.yVal-goal.yVal;
        goal.xMiss = player.xVal-goal.xVal;
        goal.targetMiss = player.yVal-player.interceptPoint[1];
        //decides score baed off distance
        if (distance < canvas.width/270) {
          player.scoreAdd = 5;
        } else if (distance < canvas.width/33.75) {
          player.scoreAdd = 3;
        } else if (distance < canvas.width/19.2) {
          player.scoreAdd = 1;
        } else {
          player.scoreAdd = 0;
        }
      }
      player.score += player.scoreAdd;
      }
    } else {
      //resets the game for a new game
      resetGame();
}
  /*
  var plays = 0;
  var playBeeps = setInterval(function() {
    if (plays < player.scoreAdd) {
      beep.play();
      plays++;
    } else {
      clearInterval(playBeeps);
    }
  }, beep.length/beep.playbackRate);
  */
  //changes volume of the beep based off score
  //beep.volume = player.scoreAdd/5;
  //plays sound
  //beep.currentTime = 2;
  //beep.play();
}

function resetGame() {
  /*
  purpose: resets many attributes to be ready for a new game
  inputs: none
  returns: none but modifies many attributes
  */
  //resets x and y direction vectors
  player.dX = randrange(canvas.width/1000,canvas.width/900);
  player.dY = randrange(-canvas.height/1250,canvas.height/1250);
  //resets all positions to the original spots
  goal.xVal = canvas.width/2;
  goal.yVal = canvas.height/2;
  player.xVal = canvas.width/2;
  player.yVal = canvas.height/2;
  //resets intercept point
  player.interceptPoint[1] = canvas.height/2;
  //starts normal run
  goal.run = true;
  player.run = true;
  //resets score
  player.score = 0;
  //resets time
  start = new Date();
  //gets a new song resets song
  randomSong = getRandomSong();
  bgSong = new Audio(randomSong);
  bgSong.currentTime = 0;
  bgSong.playbackRate = 1;
  bgSong.play();
}

// Get width/height of the browser window
windowWidth = window.innerWidth;
windowHeight = window.innerHeight;
//console.log("Window is %d by %d", windowWidth, windowHeight);

// Get the canvas, set the width and height from the window
canvas = document.getElementById("mainCanvas");
canvas.width = windowWidth - windowWidth/67.5;
canvas.height = windowHeight - windowHeight/37;
// canvas.style.border = "1px solid black";

// Listen to see if a key is pressed, link to event handler.
document.addEventListener("keydown", myKeyDown);

//mouse down event listener
document.addEventListener("mousedown", mousedown);

// Set up the context for the animation
context = canvas.getContext("2d");

// Set up initial instance of the circles
goal = new Goal([canvas.width/2,canvas.height/2], canvas.height/19);
var randomVector = [randrange(canvas.width/2000,canvas.width/1800),randrange(-canvas.height/2500,canvas.height/2500)];
player = new Player([canvas.width/2,canvas.height/2], randomVector, canvas.height/25, 2);

// Update the coordinates of the line; second argument is how often in ms
window.setInterval(moveStuff, 0);

// //loads three images that are used in the game
//
// //counter to make sure both photos are loaded
// var imgLoaded = 0;
//
// //loads the two images needed
// var ethanPic = new Image();
// ethanPic.onload = function(){
//   imgLoaded ++;
// }
// ethanPic.src = "ethancircle.png";
//
// var michaelPic = new Image();
// michaelPic.onload = function(){
//   imgLoaded ++;
// }
// michaelPic.src = "michaelCircle.png";
//
// var rolanPic = new Image();
// rolanPic.onload = function(){
//   imgLoaded ++;
// }
// rolanPic.src = "rolancircle.png";
//
// //won't start program until both images are loaded
// var loadImg = setInterval(function() {
//   if (imgLoaded == 3) {
//     window.requestAnimationFrame(drawAll);
//     clearInterval(loadImg);
//   }
// }, 10);

//starts the animation
window.requestAnimationFrame(drawAll);
