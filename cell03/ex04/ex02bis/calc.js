function isPositiveInteger(value) {
  return /^\d+$/.test(value);
}

function showResult(result) {
  console.log(result);
  alert(result);
}

jQuery(function ($) {
  $("#calc-form").on("submit", function (event) {
    event.preventDefault();

    var leftValue = $("#left").val().trim();
    var rightValue = $("#right").val().trim();

    if (!isPositiveInteger(leftValue) || !isPositiveInteger(rightValue)) {
      alert("Error :(");
      return;
    }

    var left = parseInt(leftValue, 10);
    var right = parseInt(rightValue, 10);
    var operator = $("#operator").val();

    if ((operator === "/" || operator === "%") && right === 0) {
      alert("It's over 9000!");
      return;
    }

    var result;
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

  window.setInterval(function () {
    alert("Please, use me...");
  }, 30000);
});
