(function () {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  var cursor = document.getElementById("cursor");
  if (!cursor) return;

  var cursorX = -100, cursorY = -100;
  var isHovering = false;

  var CLICKABLE = [
    "a", "button", "select",
    "input[type='submit']", "input[type='button']",
    "input[type='color']", "input[type='file']",
    "label", "[role='button']", ".ripple"
  ].join(", ");

  function updatePosition() {
    var half = isHovering ? 13 : 5;
    cursor.style.transform = "translate(" + (cursorX - half) + "px, " + (cursorY - half) + "px)";
  }

  document.addEventListener("mousemove", function (e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    updatePosition();
    cursor.classList.remove("is-hidden");
  });

  document.addEventListener("mouseleave", function () {
    cursor.classList.add("is-hidden");
  });

  document.addEventListener("mouseenter", function () {
    cursor.classList.remove("is-hidden");
  });

  document.addEventListener("mouseover", function (e) {
    isHovering = !!e.target.closest(CLICKABLE);
    cursor.classList.toggle("is-hovering", isHovering);
    updatePosition();
  });

  document.addEventListener("mousedown", function () {
    cursor.classList.add("is-clicking");
  });

  document.addEventListener("mouseup", function () {
    cursor.classList.remove("is-clicking");
  });

  cursor.classList.add("is-hidden");
})();
