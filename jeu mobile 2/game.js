const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game',
  backgroundColor: '#ffffff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

let player;
let obstacles;
let ground;
let score = 0;
let scoreText;
let gameOver = false;
let spawnTimer;

new Phaser.Game(config);

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('obstacle', 'assets/obstacle.png');
}

function create() {
  const w = this.sys.game.config.width;
  const h = this.sys.game.config.height;

  const solY = h - h / 4; // sol à 1/4 de l'écran depuis le bas

  // ---------------- SOL ----------------
  ground = this.physics.add.staticGroup();
  ground.create(w / 2, solY, null)
    .setDisplaySize(w, 80)
    .refreshBody();

  // ---------------- JOUEUR ----------------
  player = this.physics.add.sprite(80, solY - 140 / 2, 'player');
  player.displayWidth = 80;
  player.displayHeight = 140;

  // ajuster le corps pour que le bas corresponde au sprite
  player.body.setSize(player.displayWidth * 0.8, player.displayHeight);
  player.body.setOffset((player.displayWidth - player.body.width)/2, 0);

  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, ground);

  // ---------------- OBSTACLES ----------------
  obstacles = this.physics.add.group();
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, obstacles, hit, null, this);

  // ---------------- SCORE ----------------
  scoreText = this.add.text(10, 10, 'Score: 0', {
    font: '24px Arial Black',
    fill: '#000'
  });

  // ---------------- SPAWN OBSTACLES ----------------
  spawnTimer = this.time.addEvent({
    delay: 1500,
    loop: true,
    callback: spawnObstacle,
    callbackScope: this
  });

  // ---------------- SAUT (PC + MOBILE) ----------------
  this.input.on('pointerdown', jump);
  this.input.keyboard.on('keydown-SPACE', jump);
}

function jump() {
  if (gameOver) return;
  if (player.body.touching.down) {
    player.setVelocityY(-550);
  }
}

function spawnObstacle() {
  if (gameOver) return;

  const h = this.sys.game.config.height;
  const solY = h - h / 4;

  const obs = obstacles.create(400, solY - 100 / 2, 'obstacle'); // placer au sol
  obs.displayWidth = 50;
  obs.displayHeight = 100;

  // ajuster le corps pour que le bas corresponde au sprite
  obs.body.setSize(obs.displayWidth * 0.8, obs.displayHeight);
  obs.body.setOffset((obs.displayWidth - obs.body.width)/2, 0);

  obs.setVelocityX(-250);
  obs.setImmovable(true);
  obs.body.allowGravity = false;
}

function hit() {
  gameOver = true;
  player.setTint(0xff0000);
  spawnTimer.remove(false);

  this.add.text(180, 320, 'GAME OVER\nClique pour rejouer', {
    font: '28px Arial Black',
    fill: '#000',
    align: 'center'
  }).setOrigin(0.5);

  this.input.once('pointerdown', () => {
    this.scene.restart();
    score = 0;
    gameOver = false;
  });
}

function update() {
  if (gameOver) return;

  score++;
  scoreText.setText('Score: ' + Math.floor(score / 10));

  obstacles.getChildren().forEach(obs => {
    if (obs.x < -50) obs.destroy();
  });
}
