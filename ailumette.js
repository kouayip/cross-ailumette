const chalk = require("chalk");
const prompt = require("prompt-sync")();

const TYPE_COMPONENT = {
  UNKNOWN: "Unknown",
  DRAWABLE: "Drawable",
  IA: "Ia",
  INPUT: "Input",
  VISITOR: "Visitor",
};

const ENTITY_TYPE = {
  PLAYER: "Player",
  COMPUTER: "Computer",
  GRAPHICS: "Graphics",
};

/*** START COMPONENT ****/
class Component {
  constructor() {}
  type() {
    return TYPE_COMPONENT.UNKNOWN;
  }
  init() {
    console.log("=> Init Component");
  }
  update() {
    console.log("=> Update Component");
  }
}

class DrawableComponent extends Component {
  type() {
    return TYPE_COMPONENT.DRAWABLE;
  }
  init() {
    console.log("=> Init Drawable Component");
  }
  update() {}
  draw() {
    console.log(
      chalk.gray(`*********
*   |   *
*  |||  *
* ||||| *
*|||||||*
*********
`)
    );
  }
}

class VisitorComponent extends Component {
  type() {
    return TYPE_COMPONENT.VISITOR;
  }
  constructor() {
    super();
    this.line = 0;
    this.matches = 0;
  }

  _reset() {
    this.line = 0;
    this.matches = 0;
  }

  init() {
    console.log("=> Init Input Component");
  }
  update() {
    console.log("Update Visitor");
  }
}

class InputComponent extends Component {
  constructor() {
    super();
    this.line = 0;
    this.matches = 0;
  }
  type() {
    return TYPE_COMPONENT.INPUT;
  }
  init() {
    console.log("=> Init Input Component");
  }
  update() {
    console.log("Your turn:");
    this.line = Number(prompt("Line: "));
    this.matches = Number(prompt("Matches: "));
  }
}

class IAComponent extends Component {
  type() {
    return TYPE_COMPONENT.IA;
  }
  init() {
    console.log("=> Init IA Component");
  }
  update() {
    console.log("AI’s turn...");
  }
}

/*** END COMPONENT ****/

// CLI console use to print output message
class CLI {}

class Entity {
  /**
   * @param {ENTITY_TYPE} type
   */
  constructor(type) {
    this._components = {};
    this._word = null;
    this._type = type || ENTITY_TYPE.UNKNOWN;
  }

  type() {
    return this._type;
  }

  /**
   * @param {World} word
   */
  setWord(word) {
    this._word = word;
  }

  /**
   * @param {Component} component
   */
  attach(component) {
    this._components[component.type()] = component;
  }

  init() {
    console.log(chalk.green(`+> Init ${this.type()} Entity Component`));
    for (const key in this._components) {
      if (Object.hasOwnProperty.call(this._components, key)) {
        const component = this._components[key];
        if (component !== null && component.type() !== TYPE_COMPONENT.UNKNOWN) {
          component.init();
        }
      }
    }
  }
  update() {
    for (const key in this._components) {
      if (Object.hasOwnProperty.call(this._components, key)) {
        const component = this._components[key];
        if (component !== null && component.type() !== TYPE_COMPONENT.UNKNOWN) {
          component.update();
        }
      }
    }
  }
  draw() {
    for (const key in this._components) {
      if (Object.hasOwnProperty.call(this._components, key)) {
        const component = this._components[key];
        if (
          component !== null &&
          component.type() === TYPE_COMPONENT.DRAWABLE
        ) {
          component.draw();
        }
      }
    }
  }
}

// Matrix is class use to create a location for ailumette
class Matrix {
  constructor(rows, cols) {
    this._rows = rows;
    this._cols = cols;
  }
}

class World {
  constructor() {
    this._entities = {};
    this._graphicsSystem = {};
  }

  /**
   * @param {ENTITY_TYPE} type
   * @param {Entity} entity
   */
  registerEntity(entity) {
    entity.setWord(this);
    this._entities[entity.type()] = entity;
    if (entity.type() === ENTITY_TYPE.GRAPHICS)
      this._graphicsSystem[entity.type()] = entity;
  }

  /**
   * @param {ENTITY_TYPE} type
   */
  getEntity(type) {
    return this._entities[type];
  }

  init() {
    Object.values(this._entities).forEach((entity) => entity.init());
  }

  update() {
    Object.values(this._entities).forEach((entity) => {
      switch (entity.type()) {
        case ENTITY_TYPE.PLAYER:
          entity.update();
          this.draw();
          break;
        case ENTITY_TYPE.COMPUTER:
          entity.update();
          this.draw();
          break;
        default:
          entity.update();
          break;
      }
    });
  }

  draw() {
    Object.values(this._graphicsSystem).forEach((entity) => entity.draw());
  }
}

// Entry class to init all component and start game
class GameEngine {
  constructor() {
    this._word = new World();
  }
  start() {
    this._word.update();
  }
}

const game = new GameEngine();

game.start();

const word = new World();

/** PLAYER */
const player = new Entity(ENTITY_TYPE.PLAYER);
player.attach(new InputComponent());
player.attach(new VisitorComponent());

/** COMPUTER */
const computer = new Entity(ENTITY_TYPE.COMPUTER);
computer.attach(new IAComponent());
computer.attach(new VisitorComponent());

/** GRAPHICS */
const graphics = new Entity(ENTITY_TYPE.GRAPHICS);
graphics.attach(new DrawableComponent());

word.registerEntity(player);
word.registerEntity(computer);
word.registerEntity(graphics);

//? Test
word.init();
word.draw();
for (let index = 0; index < 2; index++) {
  word.update();
}