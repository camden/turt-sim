import { Food } from './food';
import { v1 as uuidv1 } from 'uuid';

export interface Thing {}

export interface Turtle extends Thing {
  sprite: Phaser.GameObjects.GameObject & Transformable;
  name: string;
  speed: number;
  maxSpeed: number;
  target: TurtleTarget | null;
  phase: 'IDLE' | 'HUNTING';
  targetGraphic: Transformable & Visible;
  ui: TurtleLocalUIPart[];
}

interface LocalUIPart<BaseType, ObjectType> {
  obj: ObjectType;
  updateFn: (BaseType, ObjectType) => void;
}

type Transformable = Phaser.GameObjects.Components.Transform;
type Visible = Phaser.GameObjects.Components.Visible;
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
  const speed = 70;
  const maxSpeed = 70;
  sprite.setDamping(true);
  sprite.setDrag(0.95);

  const targetSize = 50;
  const targetGraphic = scene.add.ellipse(200, 200, targetSize, targetSize);
  targetGraphic.setStrokeStyle(3, 0xff0000, 1);
  targetGraphic.setFillStyle();

  const ui: TurtleLocalUIPart[] = [];
  const textStatus = scene.add.text(0, 0, 'DEBUG_PHASE');
  textStatus.setBackgroundColor('white');
  textStatus.setColor('black');
  textStatus.setFontSize(12);

  const phaseIndicator: TurtleLocalUIPart = {
    obj: textStatus,
    updateFn: (turtle: Turtle, text: Phaser.GameObjects.Text) => {
      text.setPosition(turtle.sprite.x, turtle.sprite.y);
      text.setText(turtle.phase);
      return;
    },
  };
  ui.push(phaseIndicator);

  return {
    name,
    target: null,
    sprite,
    targetGraphic,
    speed,
    maxSpeed,
    phase: 'HUNTING',
    ui,
  };
};

export const updateTurtle = (
  turt: Turtle,
  scene: Phaser.Scene,
  playerSprite: Phaser.Physics.Arcade.Sprite,
  foods: Food[],
): void => {
  const body = turt.sprite.body as Phaser.Physics.Arcade.Body;

  turt.target = foods[0] ? foods[0].sprite : null;

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
