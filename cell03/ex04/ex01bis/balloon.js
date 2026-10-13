jQuery(function ($) {
  var minimumSize = 200;
  var maximumSize = 420;
  var size = minimumSize;
  var colorIndex = 0;
  var colors = ["red", "green", "blue"];
  var $balloon = $("#balloon");

  function render() {
    $balloon.css({
      width: size + "px",
      height: size + "px",
      backgroundColor: colors[colorIndex]
    });
  }

  $balloon.on("click", function () {
    size += 10;

    if (size > maximumSize) {
      size = minimumSize;
      colorIndex = 0;
    } else {
      colorIndex = (colorIndex + 1) % colors.length;
    }

    render();
  });

  $balloon.on("mouseleave", function () {
    size = Math.max(minimumSize, size - 5);
    colorIndex = (colorIndex - 1 + colors.length) % colors.length;
    render();
  });

  render();
});
