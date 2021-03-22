import Phaser from 'phaser';
import Player from '../entity/Player';
import Enemy from '../entity/Enemy';
import Projectile from '../entity/Projectile';
import createAnimations from '../animations/createAnimations';

export default class FgScene extends Phaser.Scene {
  constructor() {
    super('FgScene');
    this.damageEnemy = this.damageEnemy.bind(this);
  }

  openUpgrade() {}

  preload() {
    this.load.image('apocalypse', 'assets/backgrounds/apocalypse.png');
    this.load.image('forest', 'assets/backgrounds/forest.png');
    this.load.image('bigBlast', 'assets/sprites/bigBlast.png');
    this.load.tilemapTiledJSON('map', 'assets/backgrounds/robot-test-map.json');
    this.load.spritesheet('player', 'assets/sprites/cyborg.png', {
      frameWidth: 47,
      frameHeight: 50,
    });
    this.load.spritesheet('enemy', 'assets/sprites/Walk.png', {
      frameWidth: 46,
      frameHeight: 48,
    });
    this.load.spritesheet('enemyPunch', 'assets/sprites/Punch_RightHand.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.audio('gg', 'assets/audio/SadTrombone.mp3');
    this.load.image('textBox', 'assets/sprites/PngItem_5053532.png');
  }

  create(data) {
    this.gg = this.sound.add('gg');
    //map stuff
    this.map = this.make.tilemap({ key: 'map' });

    this.darkGrass = this.map.addTilesetImage('forest', 'forest');

    // const earthyTiles = this.map.addTilesetImage('sci-fi', 'earthy-tiles');

    this.grassAndBuildings = this.map.addTilesetImage(
      'apocalypse',
      'apocalypse'
    );

    // const extraBuildings = this.map.addTilesetImage(
    //   'apocalypse-extra',
    //   'extra-buildings'
    // );

    this.belowLayer1 = this.map.createLayer('ground', this.darkGrass, 0, 0);

    // const belowLayer2 = this.map.createStaticLayer('ground', earthyTiles, 0, 0);

    // const belowLayer3 = this.map.createStaticLayer(
    //   'ground',
    //   grassAndBuildings,
    //   0,
    //   0
    // );

    this.worldLayer1 = this.map.createLayer(
      'above-ground',
      this.grassAndBuildings,
      0,
      0
    );

    // const worldLayer2 = this.map.createStaticLayer(
    //   'above-ground',
    //   extraBuildings,
    //   0,
    //   0
    // );

    this.worldLayer1.setCollisionByProperty({ collides: true });

    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.worldLayer1.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    });

    // worldLayer2.setCollisionByProperty({ collides: true });

    // Spawning the player

    this.player = new Player(this, 20, 400, 'player').setScale(0.3);
    this.enemy = new Enemy(this, 170, 400, 'enemy').setScale(0.4);
    // Groups
    this.playerProjectiles = this.physics.add.group({
      classType: Projectile,
      runChildUpdate: true,
      maxSize: 30,
    });
    this.enemyProjectiles = this.physics.add.group({
      classType: Projectile,
      runChildUpdate: true,
      maxSize: 30,
    });

    // Collision logic
    this.physics.add.collider(this.player, this.worldLayer1);
    // this.physics.add.collider(this.player, this.enemy);
    this.physics.add.overlap(this.player, this.enemy, () => {
      this.player.takeDamage(10, this.gg);
    });

    this.physics.add.overlap(
      this.enemy,
      this.playerProjectiles,
      this.damageEnemy
    );

    this.physics.add.collider(this.enemy, this.worldLayer1);

    // Camera logic
    this.camera = this.cameras.main;
    this.camera.setZoom(4.5);
    this.camera.setBounds(0, 0, 1025, 768);
    this.camera.startFollow(this.player);

    // Keymapping
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      // TODO: Remove this
      hp: Phaser.Input.Keyboard.KeyCodes.H,
      speed: Phaser.Input.Keyboard.KeyCodes.I,
      upgrade: Phaser.Input.Keyboard.KeyCodes.U,
    });

    // Adding world boundaries
    // TODO: Fix world boundary when we finish tileset
    this.physics.world.setBounds(0, 0, 1024, 768);
    this.player.setCollideWorldBounds();
    this.enemy.setCollideWorldBounds();
    createAnimations.call(this);

    this.events.on('transitioncomplete', () => {
      this.scene.wake();
    });

    if (data.choice) {
      this.scene.restart({ choice: false });
      const main = this.scene.get('MainScene');
      main.scene.restart({ choice: false });
    }

    this.textBox = this.add.image(
      this.player.x + 70,
      this.player.y - 50,
      'textBox'
    );
    this.textBox.setScale(0.09);

    // this.tutorial = true;
    let i = 0;
    // let continueText = this.add.text(
    //   this.textBox.x + 20,
    //   this.textBox.y + 10,
    //   'Press here to continue'
    // );
    // continueText
    //   .setResolution(10)
    //   .setScale(0.23)
    //   .setOrigin(0.5)
    //   .setInteractive(
    //     new Phaser.Geom.Rectangle(0, 0, text.width, text.height),
    //     Phaser.Geom.Rectangle.Contains
    //   )
    //   .on('pointerdown', function addText() {
    //     i++;
    //     text.setText(textLines[i]);
    //     console.log(textLines[i]);

    //     console.log(i);
    //   });
    let textLines = [
      'Halt human, stop right there!',
      'Name...?',
      'ID..?',
      '...',
      '"Just looking for directions" is not a valid response....',
      'What is that you are wearing human....?',
      'Please stand still as you are being scanned.....',
      'Scan Complete....',
      'Illegal Activity Detected...',
      'Where did you get these parts human...?',
      'Come with me human you are being detained for questioning.....',
      'Please do not resist....',
    ];
    let text = this.add.text(this.textBox.x, this.textBox.y + 2, textLines[i], {
      fontSize: '.4',
      // fontFamily: 'Arial',
      align: 'left',
      wordWrap: { width: 199, useAdvancedWrap: true },
    });
    text.setResolution(10);
    text.setScale(0.4).setOrigin(0.5);

    text.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, text.width + 10, text.height + 10),
      Phaser.Geom.Rectangle.Contains
    );
    text.on('pointerdown', function addText() {
      if (i > textLines.length - 1) {
        console.log('FIGHT!!');
        this.tutorial = false;
      } else {
        this.tutorial = true;
        console.log('this.tutorial set to true on pointer down');
      }
      i++;
      text.setText(textLines[i]);
    });

    // var container = this.add.container(this.player.x + 70, this.player.y - 50, [
    //   this.textBox,
    //   text,
    // ]);
  }

  update(time, delta) {
    console.log(this.tutorial);

    if (time < 3000) {
      console.log('hello????');
      this.tutorial = true;
    }
    if (this.tutorial === true) {
      this.player.body.moves = false;
      this.enemy.body.moves = false;
      this.player.shooting = true;
    } else {
      this.player.body.moves = true;
      this.enemy.body.moves = true;
      this.player.shooting = false;
    }

    this.player.update(this.cursors);
    this.enemy.update(this.player);
    if (this.cursors.upgrade.isDown) {
      this.scene.transition({
        target: 'UpgradeUI',
        sleep: true,
        duration: 1000,
        data: { player: this.player },
      });
    }
  }

  damageEnemy(enemy, projectile) {
    if (enemy.active === true && projectile.active === true) {
      projectile.destroy();

      enemy.takeDamage(projectile.damage);
    }
  }
}
