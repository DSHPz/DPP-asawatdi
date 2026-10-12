const balloon = document.getElementById("balloon");

const MIN_SIZE = 200;
const MAX_SIZE = 420;
const GROW_STEP = 10;
const SHRINK_STEP = 5;
const colors = ["red", "green", "blue"];

let size = MIN_SIZE;
let colorIndex = 0;

function render() {
  balloon.style.width = size + "px";
  balloon.style.height = size + "px";
  balloon.style.backgroundColor = colors[colorIndex];
}

// Click: grow by 10px, color goes red -> green -> blue -> red
balloon.addEventListener("click", function () {
  size += GROW_STEP;

  if (size > MAX_SIZE) {
    // The balloon explodes: back to its original size and color
    size = MIN_SIZE;
    colorIndex = 0;
  } else {
    colorIndex = (colorIndex + 1) % colors.length;
  }

  render();
});

// Mouse leaves: shrink by 5px (min 200px), color goes in reverse order
balloon.addEventListener("mouseleave", function () {
  size = Math.max(MIN_SIZE, size - SHRINK_STEP);
  colorIndex = (colorIndex - 1 + colors.length) % colors.length;
  render();
});

render();
