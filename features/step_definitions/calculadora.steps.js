const assert = require("node:assert/strict");
const { Given, When, Then } = require("@cucumber/cucumber");
const { createCalculatorDriver } = require("../../tests/calculatorDriver");

Given("que a calculadora esta aberta", function () {
  this.calculator = createCalculatorDriver();
});

When("eu faco a operacao {string}", function (operation) {
  this.calculator.clickSequence(operation);
});

When("eu clico no botao {string}", function (buttonLabel) {
  this.calculator.clickButton(buttonLabel);
});

Then("o visor deve mostrar {string}", function (expectedResult) {
  assert.equal(this.calculator.getDisplay(), expectedResult);
});
