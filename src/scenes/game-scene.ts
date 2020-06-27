import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { Turtle, createTurtle, updateTurtle } from '../things/things';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public speed = 400;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerSprite: Phaser.Physics.Arcade.Sprite;

  private turtles: Turtle[];

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    this.playerSprite = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'man');

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.turtles = [createTurtle(this), createTurtle(this), createTurtle(this), createTurtle(this)];

    const turtGroup = this.physics.add.group(this.turtles.map((turtle) => turtle.sprite));
    this.physics.add.collider(turtGroup, turtGroup);
    this.physics.add.collider(turtGroup, this.playerSprite);
  }

  public update(): void {
    this.turtles.forEach((turt) => updateTurtle(turt, this, this.playerSprite));

    // OLD CODE
    // V V V V V

    // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.input.keyboard.addKey('A').isDown || this.cursorKeys.left.isDown) {
      velocity.x -= 1;
    }
    if (this.input.keyboard.addKey('D').isDown || this.cursorKeys.right.isDown) {
      velocity.x += 1;
    }
    if (this.input.keyboard.addKey('W').isDown || this.cursorKeys.up.isDown) {
      velocity.y -= 1;
    }
    if (this.input.keyboard.addKey('S').isDown || this.cursorKeys.down.isDown) {
      velocity.y += 1;
    }

    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    const normalizedVelocity = velocity.normalize();
    this.playerSprite.setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
  }
}
