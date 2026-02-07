const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload,
        create,
        update
    }
};

let player;
let cursors;
let obstacles;
let score = 0;
let scoreText;
let gameWidth, gameHeight;

const game = new Phaser.Game(config);

function preload() {
    // ⚠️ Vérifie que ces fichiers existent exactement dans "assets/"
    this.load.image('player', 'assets/player.png');   // ton avion
    this.load.image('missile', 'assets/missile.png'); 
    this.load.image('bird', 'assets/bird.png');
}

function create() {
    gameWidth = this.sys.game.config.width;
    gameHeight = this.sys.game.config.height

    function create() {
    gameWidth = this.sys.game.config.width;
    gameHeight = this.sys.game.config.height;

    // Fond bleu ciel seulement pour la zone de jeu
    const graphics = this.add.graphics();
    graphics.fillStyle(0x87CEEB, 1); // bleu ciel
    graphics.fillRect(0, 0, gameWidth, gameHeight);

    // Joueur
    player = this.physics.add.sprite(gameWidth / 2, gameHeight - 100, 'player');
    player.setScale(0.6);
    player.setCollideWorldBounds(true);

    // … le reste du code reste inchangé
}


    // Joueur
    player = this.physics.add.sprite(gameWidth / 2, gameHeight - 100, 'player');
    player.setScale(0.6);
    player.setCollideWorldBounds(true);

    // Groupe d'obstacles
    obstacles = this.physics.add.group();

    // Score
    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });

    // Contrôles clavier
    cursors = this.input.keyboard.createCursorKeys();

    // Contrôles tactile
    this.input.on('pointermove', pointer => {
        player.x = Phaser.Math.Clamp(pointer.x, player.width / 2, gameWidth - player.width / 2);
        player.y = Phaser.Math.Clamp(pointer.y, player.height / 2, gameHeight - player.height / 2);
    });

    // Spawn obstacles
    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            const x = Phaser.Math.Between(50, gameWidth - 50);
            const type = Phaser.Math.Between(0, 1); // 0 = missile, 1 = bird
            const obs = obstacles.create(x, 0, type === 0 ? 'missile' : 'bird');
            
            obs.setVelocityY(200 + score / 2);
            obs.setScale(0.5);  // mise à l’échelle ici
            obs.setSize(obs.width, obs.height);
        }
    });

    // Collision
    this.physics.add.overlap(player, obstacles, () => {
        this.scene.restart();
        score = 0;
    });
}

function update() {
    // Déplacement clavier
    if (cursors.left.isDown) player.x -= 5;
    if (cursors.right.isDown) player.x += 5;
    if (cursors.up.isDown) player.y -= 5;
    if (cursors.down.isDown) player.y += 5;

    // Limite joueur à l'écran
    player.x = Phaser.Math.Clamp(player.x, player.width / 2, gameWidth - player.width / 2);
    player.y = Phaser.Math.Clamp(player.y, player.height / 2, gameHeight - player.height / 2);

    // Score
    score++;
    scoreText.setText('Score: ' + score);

    // Supprimer obstacles hors écran
    obstacles.getChildren().forEach(obs => {
        if (obs.y > gameHeight + 50) {
            obs.destroy();
        }
    });
}


