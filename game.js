let player, cursors, obstacles;
let score = 0;
let scoreText, bestScoreText, pseudoText;
let gameWidth, gameHeight;
let gameStarted = false;
let pseudo = "";
let playButton;
let playTween; 

const maxWidth = 480;
const maxHeight = 640;

const config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth * 0.95, maxWidth),
    height: Math.min(window.innerHeight * 0.95, maxHeight),
    parent: 'game',
    backgroundColor: 0xFFFFFF, // fond blanc autour de la zone jouable
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// Demander pseudo au lancement
window.addEventListener('load', () => {
    pseudo = prompt("Entrez votre pseudo :") || "Joueur";
    gameStarted = false; // le jeu démarre après PLAY
});

function preload() {
    // PNG depuis le dossier assets/
    this.load.image('player', 'assets/player.png');   
    this.load.image('missile', 'assets/missile.png'); 
    this.load.image('bird', 'assets/bird.png');       
}

function create() {
    gameWidth = this.sys.game.config.width;
    gameHeight = this.sys.game.config.height;

    // Joueur
    player = this.physics.add.sprite(gameWidth / 2, gameHeight - 100, 'player');
    player.setScale(0.6);
    player.setCollideWorldBounds(true);

    // Obstacles
    obstacles = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointermove', pointer => {
        if(!gameStarted) return;
        player.x = Phaser.Math.Clamp(pointer.x, player.width/2, gameWidth - player.width/2);
        player.y = Phaser.Math.Clamp(pointer.y, player.height/2, gameHeight - player.height/2);
    });

    // Score automatique toutes les 2 secondes
    this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
            if(gameStarted) {
                score += 1;
                scoreText.setText(`Score: ${score}`);
            }
        }
    });

    // Obstacles
    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if(!gameStarted) return;
            const x = Phaser.Math.Between(50, gameWidth - 50);
            const type = Phaser.Math.Between(0,1);
            const obs = obstacles.create(x, 0, type === 0 ? 'missile' : 'bird');
            obs.setVelocityY(100 + score / 5);
            obs.setScale(0.5);
            obs.setSize(obs.width, obs.height);
        }
    });

    // HUD
    const styleLeft = { font: "28px Arial Black", fill: "#000" };
    const styleRight = { font: "28px Arial Black", fill: "#000" };

    scoreText = this.add.text(10, 10, `Score: 0`, styleLeft);
    bestScoreText = this.add.text(10, 50, `Best: ${localStorage.getItem(`bestScore_${pseudo}`) || 0}`, styleLeft);
    pseudoText = this.add.text(gameWidth - 10, 10, pseudo, styleRight);
    pseudoText.setOrigin(1, 0);

    // Bouton PLAY
    playButton = this.add.text(gameWidth/2, gameHeight/2, "PLAY", {
        font: "36px Arial Black",
        fill: "#fff",
        backgroundColor: "#000",
        padding: { x: 20, y: 10 }
    });
    playButton.setOrigin(0.5);
    playButton.setInteractive();

    playButton.on('pointerdown', () => {
        startGame();
    });

    // Collision
    this.physics.add.overlap(player, obstacles, () => {
        if(!gameStarted) return;

        gameStarted = false;

        obstacles.children.iterate(obs => obs.body.enable = false);

        // Meilleur score
        const best = localStorage.getItem(`bestScore_${pseudo}`) || 0;
        if(score > best) {
            localStorage.setItem(`bestScore_${pseudo}`, score);
            bestScoreText.setText(`Best: ${score}`);

            // Animation pseudo pulse
            this.tweens.add({
                targets: pseudoText,
                scale: 1.5,
                yoyo: true,
                duration: 500,
                repeat: 3
            });
        }

        // Bouton PLAY clignotant
        playButton.visible = true;
        playButton.alpha = 1;
        if(playTween) playTween.stop();
        playTween = this.tweens.add({
            targets: playButton,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            duration: 500
        });

        // Repositionner joueur
        player.setPosition(gameWidth / 2, gameHeight - 100);

        // Supprimer obstacles après 100ms
        setTimeout(() => obstacles.clear(true, true), 100);
    });

    // Redimensionnement dynamique
    window.addEventListener('resize', () => {
        const newWidth = Math.min(window.innerWidth * 0.95, maxWidth);
        const newHeight = Math.min(window.innerHeight * 0.95, maxHeight);
        game.scale.resize(newWidth, newHeight);

        gameWidth = newWidth;
        gameHeight = newHeight;

        pseudoText.setPosition(gameWidth - 10, 10);
        scoreText.setPosition(10, 10);
        bestScoreText.setPosition(10, 50);
        playButton.setPosition(gameWidth/2, gameHeight/2);
    });
}

function startGame() {
    score = 0;
    scoreText.setText(`Score: ${score}`);
    gameStarted = true;
    playButton.visible = false;
    playButton.alpha = 1;
    if(playTween) {
        playTween.stop();
        playTween = null;
    }

    // Réactiver obstacles
    obstacles.children.iterate(obs => obs.body.enable = true);
}

function update() {
    if(!gameStarted) return;

    if(cursors.left.isDown) player.x -= 5;
    if(cursors.right.isDown) player.x += 5;
    if(cursors.up.isDown) player.y -= 5;
    if(cursors.down.isDown) player.y += 5;

    player.x = Phaser.Math.Clamp(player.x, player.width/2, gameWidth - player.width/2);
    player.y = Phaser.Math.Clamp(player.y, player.height/2, gameHeight - player.height/2);

    obstacles.getChildren().forEach(obs => {
        if(obs.y > gameHeight + 50) obs.destroy();
    });
}
