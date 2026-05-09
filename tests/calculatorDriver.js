const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");

class FakeElement {
  constructor({ dataset = {}, textContent = "" } = {}) {
    this.dataset = dataset;
    this.textContent = textContent;
    this.innerHTML = "";
    this.listeners = {};
  }

  set value(nextValue) {
    this._value = nextValue;
    this.textContent = nextValue;
  }

  get value() {
    return this._value;
  }

  addEventListener(eventName, handler) {
    this.listeners[eventName] = handler;
  }

  closest(selector) {
    return selector === "button" ? this : null;
  }
}

function parseButtonAttributes(rawAttributes) {
  const dataset = {};
  const attributes = {};
  const attributePattern = /([\w-]+)="([^"]*)"/g;
  let match;

  while ((match = attributePattern.exec(rawAttributes)) !== null) {
    const [, name, value] = match;
    attributes[name] = value;

    if (name.startsWith("data-")) {
      const datasetKey = name
        .slice(5)
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      dataset[datasetKey] = value;
    }
  }

  return { attributes, dataset };
}

function normalizeButtonText(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadButtonsFromHtml() {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const buttonPattern = /<button\b([^>]*)>([\s\S]*?)<\/button>/g;
  const buttons = new Map();
  let match;

  while ((match = buttonPattern.exec(html)) !== null) {
    const [, rawAttributes, rawText] = match;
    const { attributes, dataset } = parseButtonAttributes(rawAttributes);
    const text = normalizeButtonText(rawText);
    const button = new FakeElement({ dataset, textContent: text });

    if (text) {
      buttons.set(text, button);
    }

    if (attributes["data-testid"]) {
      buttons.set(attributes["data-testid"], button);
    }
  }

  return buttons;
}

function createCalculatorDriver() {
  const display = new FakeElement();
  const expression = new FakeElement();
  const keypad = new FakeElement();
  const buttons = loadButtonsFromHtml();

  const documentStub = {
    querySelector(selector) {
      if (selector === "[data-testid='display']") {
        return display;
      }

      if (selector === "[data-testid='expression']") {
        return expression;
      }

      if (selector === ".keypad") {
        return keypad;
      }

      return null;
    },
    addEventListener() {},
  };

  const script = fs.readFileSync(path.join(projectRoot, "script.js"), "utf8");
  vm.runInNewContext(script, {
    document: documentStub,
    Number,
  });

  function clickButton(label) {
    const aliases = {
      "*": "×",
      "x": "×",
      X: "×",
      "/": "÷",
      "-": "−",
      ".": ",",
      Backspace: "⌫",
      Delete: "⌫",
    };
    const normalizedLabel = aliases[label] || label;
    const button = buttons.get(normalizedLabel);

    if (!button) {
      throw new Error(`Botao nao encontrado: ${label}`);
    }

    keypad.listeners.click({ target: button });
  }

  function clickSequence(sequence) {
    const compactSequence = sequence.replace(/\s+/g, "");

    for (const character of compactSequence) {
      clickButton(character);
    }
  }

  return {
    clickButton,
    clickSequence,
    getDisplay() {
      return display.textContent;
    },
    getExpression() {
      return expression.textContent.trim();
    },
  };
}

module.exports = {
  createCalculatorDriver,
};
