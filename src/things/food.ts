import { Thing, Transformable } from './things';
import { v1 as uuidv1 } from 'uuid';

export interface Food extends Thing {
  name: string;
  sprite: Phaser.GameObjects.GameObject & Transformable;
}

export const createFood = (scene: Phaser.Scene): Food => {
  const name = uuidv1();

  const x = Phaser.Math.Between(1, 1000);
  const y = Phaser.Math.Between(1, 1000);
  const sprite = scene.physics.add.sprite(x, y, 'food');
  sprite.setBounce(0.2, 0.2);
  sprite.setDamping(true);
  sprite.setDrag(0.95);
  sprite.setCollideWorldBounds(true);
  sprite.setName(name);

  return {
    name,
    sprite,
  };
};

export const updateFood = (food: Food, scene: Phaser.Scene, playerSprite: Phaser.Physics.Arcade.Sprite): void => {
  return;
};
