    var question;


    //number of players in the room.
    var noOfPlayers;
    var noOfPlayersText;


    var smallPlatform, bigPlatform;
    var platform1, platform2, platform3;
    var cursors;


    var player1, player2, player3;
    //To be changed to true if they are connected to server.
    player1 = false;
    player2 = false;
    player3 = false;


    ///////////////////////////////////////////////////////////////////////////////
    //////////////Should probably be in a different file///////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    function qandA(question, answer) {
        this.question = question;
        this.answersList = [answer];

        function getQuestion(){
            return this.question;
        }
        /**
        Adds a dummy answer card to the original array.
        Goes through a while loop, and pushes a random index 
        from the original array into the temp array,
        Removes that index that is pushed into the temp array.
        Object pushed into the array is removed from the original array.
        While loop repeats until all objects are randomly selected and
        pushed into the new array. 
        Then the original Array is reassigned to temp array.
        **/
       function addDummy(dummy) {
            answersList.push(dummy);
            let tempArray = [];
            while(this.answersList.length != 0){
                let randIndex = Math.floor(Math.random() * this.answersList.length);
                tempArray.push(answersList[randIndex]);
                answersList.splice(randomIndex, 1);
            }
            this.answersList = tempArray;
        }
    }
    ////////////////////////////////////////////////
    function answers(text, correct){
        this.answer = text;
        this.correct = correct;
    }
    /**
     player object skeleton:
     
        this.name = name;
        this.active = active;
        this.score = 0;
        this.platform;
        this.spriter;
        this.   
    }
    **/

    function startGame(){
         p1 = player("rose", true);
         p2 = player("jessica", true);
         p2 = player("hannah", true);
         p4 = player("stella", true); 
         playerList = {p1, p2, p3, p4};
         let card1 = answers("1", false);
         let card2 = answers("2", false);
         let card3 = answers("3", false);
         let card4 = answers("4", true);
         questionAnswer = new qandA("What is 2 + 2", card4);
         questionAnswer.addDummy(card1);
         questionAnswer.addDummy(card2);
         questionAnswer.addDummy(card3);
         
         
         
    }


    ////////////////////////////////

    var config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale,
            parent: 'phaser-example',
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    var game = new Phaser.Game(config);


    function preload() {
        // this.load.setBaseURL("http://labs.phaser.io");
        this.load.image("sky", "../assets/backgrounds/sky.png");
        this.load.image("cake", "../assets/character/cake.png");
        this.load.image('otherPlayer', 'assets/character/cake.png');
        this.load.image("platform", "../assets/character/platform.png");
        this.load.image("scroll", "../assets/character/scroll.png");
        this.load.image("card", "../assets/character/empty_card.png");


    };

    function create() {
        /// connected A901
        this.socket = io();
        this.otherPlayers = this.physics.add.group();
        cursors = this.input.keyboard.createCursorKeys();
        var self = this;
        // setting the backgroubnd image
        this.add.image(000, 00, "sky").setOrigin(0).setDisplaySize(800, 600);
        //invisible platforms for players to stand on.
        this.add.image(400, 100, 'scroll').setScale(.15);    // p1 = this.add.image (300,300,'cake').setScale(0.25);
        ///A9 receives an arry of the game, loops through each player
        ///if its the same player, call addplayer function. 
        ///if other player add other player. 
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function(id) {
                console.log(id);
                if (players[id].playerId === self.socket.id) {
                    addPlayer(self, players[id]);
                } else {
                    console.log("inside currentPlayers");
                    addOtherPlayers(self, players[id]);
                }
            });
        });

        ///A6 receives player object in a call back function and calls at other players. to show it. 
        this.socket.on('newPlayer', function(playerInfo) {
            console.log("inside newplayer"); //never ran
            addOtherPlayers(self, playerInfo);
        });

        this.socket.on('disconnect', function(playerId) {
            self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });
        this.socket.on('playerMoved', function(playerInfo) {
            self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    // otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        var card1 = this.add.image(165, 550, 'card').setScale(.45);
        card1.setInteractive().on('clicked', clickHandler, this);

        var card2 = this.add.image(415, 550, 'card').setScale(.45);
        card2.setInteractive().on('clicked', clickHandler, this);

        var card3 = this.add.image(670, 550, 'card').setScale(.45);
        card3.setInteractive().on('clicked', clickHandler, this);

        //  If a Game Object is clicked on, this event is fired.
        //  We can use it to emit the 'clicked' event on the game object itself.
        this.input.on('gameobjectup', function(pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

    }

    function scoreAndPlayer() {
        scoreText = this.add.text(16, 16, 'score: 0', {
            fontSize: '32px',
            fill: '#000'
        });

    }

    function addPlayer(self, playerInfo) {
        self.cake = self.physics.add.image(playerInfo.x, playerInfo.y, 'cake').setScale(0.25);
    }
    ///A7 just adds new sprites , 
    function addOtherPlayers(self, playerInfo) {
        console.log("addOtherPlayers called");
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setScale(0.25);
        // if (playerInfo.team === 'blue') {
        //   otherPlayer.setTint(0x0000ff);
        // } else {
        //   otherPlayer.setTint(0xff0000);
        // }
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }



    ////////////////////////click handler////////////////////
    function clickHandler(box) {
        console.log("card clicked");
        // player.y += 32;
        if (this.cake) {
            this.cake.y += 32;
        }
    }
    ////////////////////////////////////////////////////////
    ///A12 it emits new X and Y coordinates 
    function update() {
        if (this.cake) {
            if (this.input.keyboard.checkDown(cursors.left, 250)) {
                this.cake.x -= 32;
            } else if (this.input.keyboard.checkDown(cursors.right, 250)) {
                this.cake.x += 32;
            }

            //  Vertical movement every 150ms
            if (this.input.keyboard.checkDown(cursors.up, 150)) {
                this.cake.y -= 32;
            } else if (this.input.keyboard.checkDown(cursors.down, 150)) {
                this.cake.y += 32;
            }
            this.socket.emit('playerMovement', {
                x: this.cake.x,
                y: this.cake.y
            });
        }

    }

    function createPlayer(sprite){
        
    }
