/*************** Game Object ***************/
var Game = function() {
    this.board = {
        "width": 505,       // Width of Canvas
        "height": 606,      // Height of Canvas
        "rows": 6,          // Total number of rows in the game
        "cols": 5,          // Total number of cols in the game
        "box_width": 101,   // Width of images
        "box_height": 83,   // Height of images
        "blocks": 3,        // Number of available rows for bugs
        "enemies": 3,       // Number of bugs
        "min_speed": 200,   // Min speed for bugs
        "max_speed": 500    // Max speed for bugs
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
}

Game.prototype.update_lives = function( lives ) {
    // lives can be either positive or negative
    this.statistics.lives += lives;
}

Game.prototype.update = function() {
    if( ! this.statistics.lives || this.statistics.score >= 5 ) {
        this.state.finished = true;

        game.state.msg = "GAME OVER";
        if(  this.statistics.score >= 5 )
            game.state.msg = "CONGRATULATIONS";   
    }
};

Game.prototype.render = function() {
    ctx.fillStyle = "yellow";
    ctx.font = "38px serif";
    ctx.textAlign="left";
    ctx.fillText("Score: " + (this.statistics.score).toString(), 10, this.board.box_height+20);

    ctx.fillStyle = "red";
    ctx.font = "28px serif";
    ctx.textAlign="left";
    ctx.drawImage(Resources.get(this.statistics.lives_img), this.board.width-60 , this.board.height-70);  
    ctx.fillText((this.statistics.lives).toString(), this.board.width-20, this.board.height-30);

    if( this.state.finished ) {           

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, game.board.height / 2 - 100, game.board.width, 200);


            ctx.font = "40px serif";
            ctx.textAlign="center";

            ctx.strokeStyle = "white";
            ctx.lineWidth = 4;
            ctx.strokeText(game.state.msg, this.board.width / 2, this.board.height / 2);
            
            ctx.fillStyle = "red"; 
            ctx.fillText(game.state.msg, this.board.width / 2, this.board.height / 2);
            
            
            game.state.count++;
            if( game.state.count > 30) {   
                game.state.count = 0;
                if(game.state.toggle =="white")
                    game.state.toggle = 'black';
                else
                    game.state.toggle = "white";
            }

            ctx.font = "28px serif";
            ctx.textAlign="center";

            ctx.fillStyle = game.state.toggle;
            ctx.fillText("Press enter to restart", this.board.width / 2, this.board.height / 2 + 40);
    }
};

Game.prototype.reset = function() {
    this.statistics.score = 0;
    this.statistics.lives = 3;
    game.state.finished = false;
    game.state.restarted = false;
};



/*************** Enemy Object ***************/
var Enemy = function() {
    this.initialize();
};

Enemy.prototype.initialize = function() {
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    this.y = 1 + Math.floor( game.board.blocks * Math.random() );
    this.speed = game.board.min_speed + Math.floor( (game.board.max_speed - game.board.min_speed) * Math.random() );
};

Enemy.prototype.update = function(dt) {
    this.x = Math.floor( this.x + dt * this.speed );

    if( this.x >= game.board.width ) {
        this.initialize();
    }
};

Enemy.prototype.render = function() {
    ctx.drawImage( Resources.get( this.sprite), this.x, this.y * game.board.box_height );
};



/*************** Player Object ***************/
var Player = function() {
    this.initialize();
};

Player.prototype.initialize = function() {
    this.sprite = "images/char-boy.png";
    this.x = 2;
    this.y = game.board.rows - 1;
    this.dx = 0;
    this.dy = 0;
};

Player.prototype.update = function(dt) {
    this.x = Math.min( Math.max( Math.floor( this.x + this.dx) , 0), game.board.cols - 1 );
    this.y = Math.min( Math.max( Math.floor( this.y + this.dy) , 0), game.board.rows - 1 );

    this.dx = 0;
    this.dy = 0;

    //Collision
    for(var i = 0; i < allEnemies.length ; i++) {
        if( Math.abs(this.x * game.board.box_width - allEnemies[i].x ) < 50 && (this.y == allEnemies[i].y) ) {
            game.update_lives( -1 );
            player.initialize();
            break;
        }
    }

    //Water
    if( this.y == 0) {
        game.update_score( 1 );
        player.initialize();
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x * game.board.box_width , this.y * game.board.box_height );  
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
                player.initialize();
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

allEnemies = []
for(var i =0; i < game.board.enemies; i++) {
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