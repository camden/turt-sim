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
  targetGraphic: Transformable;
  ui: TurtleLocalUIPart[];
}

interface LocalUIPart<BaseType, ObjectType> {
  obj: ObjectType;
  updateFn: (BaseType, ObjectType) => void;
}

type Transformable = Phaser.GameObjects.Components.Transform;
type TurtleLocalUIPart = LocalUIPart<Turtle, Transformable>;

type TurtleTarget = Phaser.GameObjects.GameObject & Transformable;

export const createTurtle = (scene: Phaser.Scene): Turtle => {
  const name = uuidv1();
  const x = Phaser.Math.Between(1, 1000);
  const y = Phaser.Math.Between(1, 1000);
  const sprite = scene.physics.add.sprite(x, y, 'turt');
  sprite.setBounce(1, 1);
  sprite.setCollideWorldBounds(true);
  sprite.setDrag(200);
  sprite.setName(name);

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
    speed: Phaser.Math.Between(20, 150),
    maxSpeed: Phaser.Math.Between(100, 150),
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

  if (!turt.target) {
    turt.target = foods[0] ? foods[0].sprite : null;
  }

  if (turt.phase === 'HUNTING') {
    scene.physics.accelerateToObject(turt.sprite, turt.target, turt.speed, turt.maxSpeed);
  } else {
    scene.physics.accelerateToObject(turt.sprite, null, turt.speed, turt.maxSpeed);
  }

  turt.targetGraphic.setPosition(turt.target.x, turt.target.y);

  turt.ui.forEach((uiPart) => uiPart.updateFn(turt, uiPart.obj));
};
