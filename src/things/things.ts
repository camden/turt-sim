import { curry } from 'ramda';

export interface Thing {}

export interface Turtle extends Thing {
  sprite: Phaser.GameObjects.GameObject;
  speed: number;
}

export const createTurtle = (scene: Phaser.Scene): Turtle => {
  const x = Phaser.Math.Between(1, 1000);
  const y = Phaser.Math.Between(1, 1000);
  const sprite = scene.physics.add.sprite(x, y, 'turt');
  sprite.setBounce(1, 1);

  return {
    sprite,
    speed: Phaser.Math.Between(40, 70),
  };
};

export const updateTurtle = (turt: Turtle, scene: Phaser.Scene, playerSprite: Phaser.Physics.Arcade.Sprite): void => {
  scene.physics.moveToObject(turt.sprite, playerSprite, turt.speed);
};
