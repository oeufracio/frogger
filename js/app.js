/*************** Game Object ***************/
var Game = function() {
    this.board = {
        "WIDTH": 505,       // Width of Canvas
        "HEIGHT": 606,      // Height of Canvas
        "ROWS": 6,          // Total number of rows in the game
        "COLS": 5,          // Total number of cols in the game
        "BOX_WIDTH": 101,   // Width of images
        "BOX_HEIGHT": 83,   // Height of images
        "BLOCKS": 3,        // Number of available rows for bugs
        "ENEMIES": 3,       // Number of bugs
        "MIN_SPEED": 200,   // Min speed for bugs
        "MAX_SPEED": 500,   // Max speed for bugs
        "POINTS_WIN": 7     // Points needed to win the game
    };

    this.gem = {
        "on_board": false,
        "sprite": "images/Gem-Orange.png",
        "x": 0,
        "y": 0
    };

    this.heart = {
        "on_board": false,
        "sprite": "images/Heart.png",
        "x": 0,
        "y": 0
    };

    this.statistics = {
        "score": 0,
        "lives": 3,
        "lives_img": "images/lives.png"
    };

    this.state = {
        "finished": false,
        "count": 0,
        "toggle": "white",
        "msg":"GAME OVER"
    };

};

Game.prototype.update_score = function( points ) {
    // points can be either positive or negative
    this.statistics.score += points;
};

Game.prototype.update_lives = function( lives ) {
    // lives can be either positive or negative
    this.statistics.lives += lives;
};

Game.prototype.update = function() {
    //With a relatively small probability a gem appears on on_board
    if( !this.state.finished && !this.gem.on_board && Math.random() < 0.001  ) {
        this.gem.on_board = true;
        this.gem.x = Math.floor( this.board.COLS * Math.random() );
        this.gem.y = 1 + Math.floor( this.board.BLOCKS * Math.random() );
    }
    //With a relatively small probability a heart appears on on_board
    if( !this.state.finished && !this.heart.on_board && Math.random() < 0.001  ) {
        this.heart.on_board = true;
        this.heart.x = Math.floor( this.board.COLS * Math.random() );
        this.heart.y = 1 + Math.floor( this.board.BLOCKS * Math.random() );
    }

    //The game finishes ff there is no lives or the player achieves the score
    if( ! this.statistics.lives || this.statistics.score >= this.board.POINTS_WIN ) {
        this.state.finished = true;

        this.state.msg = "GAME OVER";
        if(  this.statistics.score >= this.board.POINTS_WIN )
            this.state.msg = "CONGRATULATIONS";   
    }
};

Game.prototype.render = function() {
    //Score legend on screen
    ctx.fillStyle = "yellow";
    ctx.font = "38px serif";
    ctx.textAlign="left";
    ctx.fillText("Score: " + (this.statistics.score).toString(), 10, this.board.BOX_HEIGHT+20);

    //Lives legend on screen
    ctx.fillStyle = "red";
    ctx.font = "28px serif";
    ctx.textAlign="left";
    ctx.drawImage(Resources.get(this.statistics.lives_img), this.board.WIDTH-60 , this.board.HEIGHT-70);  
    ctx.fillText((this.statistics.lives).toString(), this.board.WIDTH-20, this.board.HEIGHT-30);

    //Display gem
    if( this.gem.on_board ) {
        ctx.drawImage(Resources.get(this.gem.sprite), this.gem.x * this.board.BOX_WIDTH , this.gem.y * this.board.BOX_HEIGHT );  
    }

    //Display heart
    if( this.heart.on_board ) {
        ctx.drawImage(Resources.get(this.heart.sprite), this.heart.x * this.board.BOX_WIDTH , this.heart.y * this.board.BOX_HEIGHT );  
    }

    //If the game has finished, GAME OVER / CONGRATULATIONS message.
    if( this.state.finished ) {           

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, this.board.HEIGHT / 2 - 100, this.board.WIDTH, 200);


            ctx.font = "40px serif";
            ctx.textAlign="center";

            ctx.strokeStyle = "white";
            ctx.lineWidth = 4;
            ctx.strokeText(this.state.msg, this.board.WIDTH / 2, this.board.HEIGHT / 2);
            
            ctx.fillStyle = "red"; 
            ctx.fillText(this.state.msg, this.board.WIDTH / 2, this.board.HEIGHT / 2);
            
            
            this.state.count++;
            if( this.state.count > 30) {   
                this.state.count = 0;
                if(this.state.toggle =="white")
                    this.state.toggle = 'black';
                else
                    this.state.toggle = "white";
            }

            ctx.font = "28px serif";
            ctx.textAlign="center";

            ctx.fillStyle = this.state.toggle;
            ctx.fillText("Press enter to restart", this.board.WIDTH / 2, this.board.HEIGHT / 2 + 40);
    }
};

Game.prototype.reset = function() {
    this.statistics.score = 0;
    this.statistics.lives = 3;
    this.state.finished = false;
    this.state.restarted = false;
    this.gem.on_board = false;
    this.heart.on_board = false;
};

/*************** Character Object ***************/
var Character = function( sprite, x, y ) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

/*************** Enemy Object ***************/
var Enemy = function() {
    Character.call(this,
                   'images/enemy-bug.png',
                   0,
                   1 + Math.floor( game.board.BLOCKS * Math.random() ) );
    this.speed = game.board.MIN_SPEED + Math.floor( (game.board.MAX_SPEED - game.board.MIN_SPEED) * Math.random() );
};

Enemy.prototype = Object.create( Character.prototype );

Enemy.prototype.constructor = Enemy;

Enemy.prototype.initialize = function() {
    this.x = 0;
    this.y = 1 + Math.floor( game.board.BLOCKS * Math.random() );
    this.speed = game.board.MIN_SPEED + Math.floor( (game.board.MAX_SPEED - game.board.MIN_SPEED) * Math.random() );
};

Enemy.prototype.update = function(dt) {
    this.x = Math.floor( this.x + dt * this.speed );

    if( this.x >= game.board.WIDTH ) {
        this.initialize();
    }
};

Enemy.prototype.render = function() {
    // This render method is slightly different for Player: the x coordinate does not need to be multiplied by BOX-WIDTH
    ctx.drawImage( Resources.get( this.sprite), this.x, this.y * game.board.BOX_HEIGHT );
};



/*************** Player Object ***************/
var Player = function() {
    Character.call(this,
                   "images/char-boy.png",
                   2,
                   game.board.ROWS - 1);
    this.dx = 0;
    this.dy = 0;
};

Player.prototype = Object.create(Character.prototype);

Player.prototype.constructor = Player;

Player.prototype.initialize = function() {
    this.x = 2;
    this.y = game.board.ROWS - 1;
    this.dx = 0;
    this.dy = 0;
};

Player.prototype.update = function(dt) {
    this.x = Math.min( Math.max( Math.floor( this.x + this.dx) , 0), game.board.COLS - 1 );
    this.y = Math.min( Math.max( Math.floor( this.y + this.dy) , 0), game.board.ROWS - 1 );

    this.dx = 0;
    this.dy = 0;

    //Collision
    for(var i = 0; i < allEnemies.length ; i++) {
        if( Math.abs(this.x * game.board.BOX_WIDTH - allEnemies[i].x ) < 50 && (this.y == allEnemies[i].y) ) {
            game.update_lives( -1 );
            this.initialize();
            break;
        }
    }

    //Water
    if( this.y === 0) {
        game.update_score( 1 );
        this.initialize();
    }

    //Gem
    if( game.gem.on_board && this.x == game.gem.x && this.y == game.gem.y ) {
        game.update_score( 2 );
        game.gem.on_board = false;
    }

    //Heart
    if( game.heart.on_board && this.x == game.heart.x && this.y == game.heart.y ) {
        game.update_lives( 1 );
        game.heart.on_board = false;
    }
};

Player.prototype.render = function() {
        // This render method is slightly different than the  Enemy.render method
    ctx.drawImage(Resources.get(this.sprite), this.x * game.board.BOX_WIDTH , this.y * game.board.BOX_HEIGHT );  
};

Player.prototype.handleInput = function( key ) {
    
    switch( key )
    {
        case 37:
            this.dx = -1;
            break;
        case 38:
            this.dy = -1;
            break;
        case 39:
            this.dx = 1;
            break;
        case 40:
            this.dy = 1;
            break;
        case 13:
            if( game.state.finished ) {
                game.reset();
                
                allEnemies.forEach(function(enemy) {
                    enemy.initialize();
                });
                this.initialize();
            }
            break;
    }

    if( game.state.finished ) {
        this.dx = 0;
        this.dy = 0;
    }
};

// Now instantiate your objects.
game = new Game();

allEnemies = [];
for(var i =0; i < game.board.ENEMIES; i++) {
    allEnemies.push( new Enemy() );
}

player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput( e.keyCode );
});