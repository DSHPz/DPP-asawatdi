const form = document.getElementById("calc-form");
const leftInput = document.getElementById("left");
const rightInput = document.getElementById("right");
const operatorSelect = document.getElementById("operator");

// Accepts only positive integers (>= 0): digits only, nothing else.
function isPositiveInteger(value) {
  return /^\d+$/.test(value);
}

function showResult(result) {
  console.log(result);
  alert(result);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const leftValue = leftInput.value.trim();
  const rightValue = rightInput.value.trim();

  if (!isPositiveInteger(leftValue) || !isPositiveInteger(rightValue)) {
    alert("Error :(");
    return;
  }

  const left = parseInt(leftValue, 10);
  const right = parseInt(rightValue, 10);
  const operator = operatorSelect.value;

  if ((operator === "/" || operator === "%") && right === 0) {
    alert("It's over 9000!");
    return;
  }

  let result;
  switch (operator) {
    case "+":
      result = left + right;
      break;
    case "-":
      result = left - right;
      break;
    case "*":
      result = left * right;
      break;
    case "/":
      result = left / right;
      break;
    case "%":
      result = left % right;
      break;
  }

  showResult(result);
});

// Every 30 seconds, remind the user to use the calculator.
setInterval(function () {
  alert("Please, use me...");
}, 30000);
