import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { Turtle, createTurtle, updateTurtle } from '../things/things';
import { Food, createFood } from '../things/food';

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
  private foods: Food[];
  private turtGroup: Phaser.Physics.Arcade.Group;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    this.playerSprite = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'man');
    this.playerSprite.setDamping(true);
    this.playerSprite.setDrag(0.85);
    this.playerSprite.setMaxVelocity(400);

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.foods = [createFood(this)];

    // this.turtles = [createTurtle(this), createTurtle(this), createTurtle(this), createTurtle(this)];
    this.turtles = [createTurtle(this)];
    this.turtGroup = this.physics.add.group(this.turtles.map((turtle) => turtle.sprite));
    this.physics.add.collider(this.turtGroup, this.turtGroup);
    this.physics.add.collider(this.turtGroup, this.playerSprite);
  }

  public update(): void {
    this.turtles.forEach((turt) => updateTurtle(turt, this, this.playerSprite, this.foods));

    this.physics.collide(
      this.playerSprite,
      this.foods.map((f) => f.sprite),
    );

    this.physics.collide(
      this.turtGroup,
      this.foods.map((f) => f.sprite),
      (food, turt) => {
        this.foods = this.foods.filter((f) => f.name !== food.name);
        food.destroy();

        this.time.addEvent({
          delay: 1000,
          callback: () => {
            this.foods.push(createFood(this));
          },
        });

        const turtle = this.turtles.find((t) => t.name === turt.name);
        if (turtle) {
          // turtle.phase = 'IDLE';
        }
      },
    );

    // OLD CODE
    // V V V V V

    // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    const accel = new Phaser.Math.Vector2(0, 0);
    const speed = 4000;

    if (this.input.keyboard.addKey('A').isDown || this.cursorKeys.left.isDown) {
      accel.x = -speed;
    }
    if (this.input.keyboard.addKey('D').isDown || this.cursorKeys.right.isDown) {
      accel.x = speed;
    }
    if (this.input.keyboard.addKey('W').isDown || this.cursorKeys.up.isDown) {
      accel.y = -speed;
    }
    if (this.input.keyboard.addKey('S').isDown || this.cursorKeys.down.isDown) {
      accel.y = speed;
    }

    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    // const normalizedVelocity = velocity.normalize();

    // this.playerSprite.setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
    const normalizedAccel = accel.normalize();
    this.playerSprite.setAcceleration(normalizedAccel.x * speed, normalizedAccel.y * speed);
  }
}
