import { Food } from './food';
import { v1 as uuidv1 } from 'uuid';

export interface Thing {}

export interface Turtle extends Thing {
  sprite: Phaser.GameObjects.GameObject & Transformable;
  name: string;
  speed: number;
  maxSpeed: number;
  target: TurtleTarget | null;
  phase: 'RESTING' | 'HUNTING';
  targetGraphic: Transformable & Visible;
  size: number;
  ui: TurtleLocalUIPart[];
}

interface LocalUIPart<BaseType, ObjectType> {
  obj: ObjectType;
  updateFn: (BaseType, ObjectType) => void;
}

export type Transformable = Phaser.GameObjects.Components.Transform;
export type Visible = Phaser.GameObjects.Components.Visible;
type TurtleLocalUIPart = LocalUIPart<Turtle, Transformable>;

type TurtleTarget = Phaser.GameObjects.GameObject & Transformable;

export const createTurtle = (scene: Phaser.Scene): Turtle => {
  const name = uuidv1();
  const x = Phaser.Math.Between(1, 1000);
  const y = Phaser.Math.Between(1, 1000);
  const sprite = scene.physics.add.sprite(x, y, 'turt');
  sprite.setBounce(0.2, 0.2);
  sprite.setCollideWorldBounds(true);
  sprite.setName(name);
  const speed = 170;
  const maxSpeed = 170;
  sprite.setDamping(true);
  sprite.setDrag(0.95);

  const targetSize = 50;
  const targetGraphic = scene.add.ellipse(200, 200, targetSize, targetSize);
  targetGraphic.setStrokeStyle(3, 0xff0000, 1);
  targetGraphic.setFillStyle();

  const ui: TurtleLocalUIPart[] = [];
  const textPhase = scene.add.text(0, 0, 'DEBUG_PHASE');
  textPhase.setBackgroundColor('white');
  textPhase.setColor('black');
  textPhase.setFontSize(12);

  const phaseIndicator: TurtleLocalUIPart = {
    obj: textPhase,
    updateFn: (turtle: Turtle, text: Phaser.GameObjects.Text) => {
      text.setPosition(turtle.sprite.x, turtle.sprite.y);
      text.setText(turtle.phase);
      return;
    },
  };

  ui.push(phaseIndicator);

  const textSize = scene.add.text(0, 0, 'DEBUG_SIZE');
  textSize.setBackgroundColor('white');
  textSize.setColor('black');
  textSize.setFontSize(12);

  const sizeUI: TurtleLocalUIPart = {
    obj: textSize,
    updateFn: (turtle: Turtle, text: Phaser.GameObjects.Text) => {
      text.setPosition(turtle.sprite.x, turtle.sprite.y + 20);
      text.setText(`Size: ${turtle.size}`);
      return;
    },
  };

  ui.push(sizeUI);

  return {
    name,
    target: null,
    sprite,
    targetGraphic,
    speed,
    maxSpeed,
    phase: 'HUNTING',
    size: 1,
    ui,
  };
};

export const updateTurtle = (
  turt: Turtle,
  scene: Phaser.Scene,
  playerSprite: Phaser.Physics.Arcade.Sprite,
  foods: Food[],
  otherTurtles: Turtle[],
): void => {
  const body = turt.sprite.body as Phaser.Physics.Arcade.Body;

  turt.sprite.setScale(turt.size * 0.25);
  turt.speed = Math.max(10, 170 - turt.size * 5);

  const closestFood = scene.physics.closest(
    turt.sprite,
    foods.map((f) => f.sprite),
  ) as Transformable & Phaser.GameObjects.GameObject;

  turt.target = closestFood;

  if (turt.phase === 'HUNTING' && !!turt.target) {
    turt.targetGraphic.setVisible(true);
    turt.targetGraphic.setPosition(turt.target.x, turt.target.y);
    // scene.physics.accelerateToObject(turt.sprite, turt.target, turt.speed, turt.maxSpeed, turt.maxSpeed);
    scene.physics.moveToObject(turt.sprite, turt.target, turt.speed);
  } else {
    turt.targetGraphic.setVisible(false);
    body.setAcceleration(0, 0);
    body.setVelocity(0, 0);
  }

  turt.ui.forEach((uiPart) => uiPart.updateFn(turt, uiPart.obj));
};

export const onTurtleEatFood = (scene: Phaser.Scene, turt: Turtle): void => {
  turt.phase = 'RESTING';
  turt.size++;

  scene.time.addEvent({
    delay: Phaser.Math.Between(1000, 3000),
    callback: () => {
      turt.phase = 'HUNTING';
    },
  });
};
