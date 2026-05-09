const display = document.querySelector("[data-testid='display']");
const expressionDisplay = document.querySelector("[data-testid='expression']");
const keypad = document.querySelector(".keypad");

const state = {
  current: "0",
  previous: null,
  operator: null,
  waitingForNextNumber: false,
  justCalculated: false,
};

const operatorLabels = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Erro";
  }

  const normalized = Object.is(value, -0) ? 0 : value;
  const rounded = Number.parseFloat(normalized.toFixed(10));
  return rounded.toLocaleString("pt-BR", {
    maximumFractionDigits: 10,
  });
}

function parseDisplayNumber(value) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

function calculate(first, operator, second) {
  switch (operator) {
    case "+":
      return first + second;
    case "-":
      return first - second;
    case "*":
      return first * second;
    case "/":
      if (second === 0) {
        return Number.NaN;
      }
      return first / second;
    default:
      return second;
  }
}

function updateDisplay() {
  display.value = state.current;
  display.textContent = state.current;

  if (state.previous !== null && state.operator) {
    expressionDisplay.textContent = `${state.previous} ${operatorLabels[state.operator]}`;
    return;
  }

  expressionDisplay.innerHTML = "&nbsp;";
}

function clearCalculator() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.waitingForNextNumber = false;
  state.justCalculated = false;
  updateDisplay();
}

function inputNumber(number) {
  if (state.current === "Erro" || state.justCalculated) {
    state.current = number;
    state.previous = null;
    state.operator = null;
    state.justCalculated = false;
    state.waitingForNextNumber = false;
    updateDisplay();
    return;
  }

  if (state.waitingForNextNumber) {
    state.current = number;
    state.waitingForNextNumber = false;
    updateDisplay();
    return;
  }

  if (state.current === "0") {
    state.current = number;
  } else if (state.current.replace("-", "").replace(",", "").length < 12) {
    state.current += number;
  }

  updateDisplay();
}

function inputDecimal() {
  if (state.current === "Erro" || state.justCalculated) {
    state.current = "0,";
    state.previous = null;
    state.operator = null;
    state.justCalculated = false;
    updateDisplay();
    return;
  }

  if (state.waitingForNextNumber) {
    state.current = "0,";
    state.waitingForNextNumber = false;
    updateDisplay();
    return;
  }

  if (!state.current.includes(",")) {
    state.current += ",";
  }

  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (state.current === "Erro") {
    clearCalculator();
    return;
  }

  if (state.operator && !state.waitingForNextNumber) {
    performCalculation();
  }

  state.previous = state.current;
  state.operator = nextOperator;
  state.waitingForNextNumber = true;
  state.justCalculated = false;
  updateDisplay();
}

function performCalculation() {
  if (!state.operator || state.previous === null || state.current === "Erro") {
    return;
  }

  const firstNumber = parseDisplayNumber(state.previous);
  const secondNumber = parseDisplayNumber(state.current);
  const result = calculate(firstNumber, state.operator, secondNumber);

  state.current = formatNumber(result);
  state.previous = null;
  state.operator = null;
  state.waitingForNextNumber = true;
  state.justCalculated = true;
  updateDisplay();
}

function deleteLastDigit() {
  if (state.current === "Erro" || state.justCalculated || state.waitingForNextNumber) {
    state.current = "0";
    state.waitingForNextNumber = false;
    state.justCalculated = false;
    updateDisplay();
    return;
  }

  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";

  if (state.current === "-") {
    state.current = "0";
  }

  updateDisplay();
}

function toggleSign() {
  if (state.current === "0" || state.current === "Erro") {
    return;
  }

  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : `-${state.current}`;
  updateDisplay();
}

function applyPercent() {
  if (state.current === "Erro") {
    return;
  }

  const percentage = parseDisplayNumber(state.current) / 100;
  state.current = formatNumber(percentage);
  updateDisplay();
}

function handleAction(action, value) {
  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "equals":
      performCalculation();
      break;
    case "clear":
      clearCalculator();
      break;
    case "delete":
      deleteLastDigit();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      applyPercent();
      break;
    default:
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^\d$/.test(key)) {
    inputNumber(key);
    return;
  }

  if (key === "," || key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    chooseOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    performCalculation();
    return;
  }

  if (key === "Backspace") {
    deleteLastDigit();
    return;
  }

  if (key === "Escape") {
    clearCalculator();
  }
});

updateDisplay();
