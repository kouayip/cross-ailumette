const chalk = require("chalk");
const prompt = require("prompt-sync")();

const TYPE_COMPONENT = {
  UNKNOWN: "Unknown",
  MAP: "Map",
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

// Matrix is class use to create a location for ailumette
class Matrix {
  constructor(rows, cols) {
    this._rows = rows;
    this._cols = cols;
    this._values = [];
  }
  init() {
    // for (let i = 0; i < this._rows; i++) {
    //   this._values.push([]);
    //   for (let j = 0; j < this._cols; j++) {
    //     this._values[i].push(0);
    //   }
    // }
    // this._values.for;
    this._values = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
    ];
  }

  getRows() {
    return this._rows;
  }

  getCols() {
    return this._cols;
  }

  getValue(row, col) {
    return this._values[row][col];
  }

  setValue(row, col, value) {
    return (this._values[row][col] = value);
  }

  checkRowIsEmpty(row) {
    for (let j = 0; j < this._cols; j++) {
      if (this.getValue(row, j) === 1) return false;
    }
    return true;
  }

  countActiveCol(row) {
    let cpt = 0;
    for (let j = 0; j < this._cols; j++) {
      if (this.getValue(row, j) === 1) cpt++;
    }
    return cpt;
  }
}

/*** START COMPONENT ****/
class Component {
  constructor() {
    this._entity = null;
  }
  type() {
    return TYPE_COMPONENT.UNKNOWN;
  }
  /**
   * @param {Entity} entity
   */
  setEntity(entity) {
    this._entity = entity;
  }
  init() {}
  update() {}
}

class MapComponent extends Component {
  constructor() {
    super();
    this._map = new Matrix(4, 7);
  }

  getMap() {
    return this._map;
  }

  type() {
    return TYPE_COMPONENT.MAP;
  }
  init() {
    this._map.init();
  }
  update() {}
}

class DrawableComponent extends Component {
  type() {
    return TYPE_COMPONENT.DRAWABLE;
  }
  init() {}
  update() {}
  draw() {
    console.log("*********");

    const map = this._entity.getComponent(TYPE_COMPONENT.MAP).getMap();

    let view = "";
    for (let i = 0; i < map.getRows(); i++) {
      view = "*";
      for (let j = 0; j < map.getCols(); j++) {
        if (map.getValue(i, j) === 1) view += "|";
        else view += " ";
      }
      view += "*";
      console.log(view);
    }

    console.log("*********\n");
  }
}

class VisitorComponent extends Component {
  type() {
    return TYPE_COMPONENT.VISITOR;
  }
  constructor() {
    super();
    this._locate = { line: 0, matches: 0 };
  }

  /**
   * @param {Number} line
   * @param {Number} matches
   */
  setLocate(line, matches) {
    this._locate.line = line;
    this._locate.matches = matches;
  }

  getLocate() {
    return { line: this._line, matches: this._matches };
  }

  _reset() {
    this._locate.line = 0;
    this._locate.matches = 0;
  }

  init() {}
  update() {
    const map = this._entity
      .getWord()
      .getEntity(ENTITY_TYPE.GRAPHICS)
      .getComponent(TYPE_COMPONENT.MAP)
      .getMap();

    let cpt = 0;
    for (let j = map.getCols() - 1; j >= 0; j--) {
      if (map.getValue(this._locate.line - 1, j) !== 0) {
        map.setValue(this._locate.line - 1, j, 0);
        cpt++;
      }
      if (cpt === this._locate.matches) break;
    }
  }
}

class InputComponent extends Component {
  constructor() {
    super();
  }
  type() {
    return TYPE_COMPONENT.INPUT;
  }
  init() {}
  update() {
    console.log("Your turn:");
    /*** CHECK LINE ***/
    let line;
    do {
      line = Number(prompt("Line: "));

      if (line <= 0 || Number.isNaN(line)) {
        console.log("Error: invalid input (positive number expected)");
      }

      if (line > 4) {
        console.log("Error: this line is out of range");
      }
    } while (line > 4 || line <= 0 || Number.isNaN(line));

    /*** CHECK MATCHES ***/
    let matches;
    do {
      matches = Number(prompt("Matches: "));

      if (matches <= 0 || Number.isNaN(matches)) {
        console.log("Error: invalid input (positive number expected)");
      }

      if (matches > 7) {
        console.log("Error: not enough matches on this line");
      }
    } while (matches > 7 || matches <= 0 || Number.isNaN(matches));

    console.log(`Player removed ${matches} match(es) from line ${line}`);
    const visitor = this._entity.getComponent(TYPE_COMPONENT.VISITOR);
    visitor.setLocate(line, matches);
  }
}

class IAComponent extends Component {
  getRandom(min, max) {
    return Math.floor(Math.random() * max) + min;
  }
  type() {
    return TYPE_COMPONENT.IA;
  }
  init() {}
  update() {
    console.log("AI’s turn...");
    const map = this._entity
      .getWord()
      .getEntity(ENTITY_TYPE.GRAPHICS)
      .getComponent(TYPE_COMPONENT.MAP)
      .getMap();

    let line;
    do {
      line = this.getRandom(1, 4);
    } while (map.checkRowIsEmpty(line - 1));

    const matches = this.getRandom(1, map.countActiveCol(line - 1));

    console.log(`AI  removed ${matches} match(es) from line ${line}`);
    const visitor = this._entity.getComponent(TYPE_COMPONENT.VISITOR);
    visitor.setLocate(line, matches);
  }
}

/*** END COMPONENT ****/

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

  getWord() {
    return this._word;
  }

  /**
   * @param {TYPE_COMPONENT} type
   */
  getComponent(type) {
    return this._components[type];
  }

  /**
   * @param {Component} component
   */
  attach(component) {
    component.setEntity(this);
    this._components[component.type()] = component;
  }

  init() {
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

class World {
  constructor() {
    this._entities = {};
    this._graphicsSystem = {};
  }

  isFinish() {
    const map = this._graphicsSystem.getComponent(TYPE_COMPONENT.MAP).getMap();
    for (let i = 0; i < map.getRows(); i++) {
      if (!map.checkRowIsEmpty(i)) return false;
    }
    return true;
  }

  /**
   * @param {ENTITY_TYPE} type
   * @param {Entity} entity
   */
  registerEntity(entity) {
    entity.setWord(this);
    this._entities[entity.type()] = entity;
    if (entity.type() === ENTITY_TYPE.GRAPHICS) {
      this._graphicsSystem = entity;
    }
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
    do {
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
    } while (!this.isFinish());
  }

  draw() {
    this._graphicsSystem.draw();
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

// const game = new GameEngine();

// game.start();

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
graphics.attach(new MapComponent());
graphics.attach(new DrawableComponent());

word.registerEntity(player);
word.registerEntity(computer);
word.registerEntity(graphics);

//? Test
word.init();
word.draw();
word.update();
