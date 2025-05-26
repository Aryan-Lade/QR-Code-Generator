(function () {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  var cursor = document.getElementById("cursor");
  var ring = document.getElementById("cursorRing");
  if (!cursor || !ring) return;

  var mouseX = -200, mouseY = -200;
  var ringX = -200, ringY = -200;

  var HALF_DOT = 5;
  var HALF_RING = 19;

  var CLICKABLE = [
    "a", "button", "select",
    "input[type='submit']", "input[type='button']",
    "input[type='color']", "input[type='file']",
    "label", "[role='button']", ".ripple"
  ].join(", ");

  function setCursor(x, y) {
    cursor.style.transform = "translate(" + (x - HALF_DOT) + "px, " + (y - HALF_DOT) + "px)";
  }

  function setRing(x, y) {
    ring.style.transform = "translate(" + (x - HALF_RING) + "px, " + (y - HALF_RING) + "px)";
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    ringX = lerp(ringX, mouseX, 0.14);
    ringY = lerp(ringY, mouseY, 0.14);
    setRing(ringX, ringY);
    requestAnimationFrame(tick);
  }

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setCursor(mouseX, mouseY);
    cursor.classList.remove("is-hidden");
    ring.classList.remove("is-hidden");
  });

  document.addEventListener("mouseleave", function () {
    cursor.classList.add("is-hidden");
    ring.classList.add("is-hidden");
  });

  document.addEventListener("mouseenter", function () {
    cursor.classList.remove("is-hidden");
    ring.classList.remove("is-hidden");
  });

  document.addEventListener("mouseover", function (e) {
    var over = e.target.closest(CLICKABLE);
    cursor.classList.toggle("is-hovering", !!over);
    ring.classList.toggle("is-hovering", !!over);
  });

  document.addEventListener("mousedown", function () {
    cursor.classList.add("is-clicking");
    ring.classList.add("is-clicking");
  });

  document.addEventListener("mouseup", function () {
    cursor.classList.remove("is-clicking");
    ring.classList.remove("is-clicking");
  });

  setCursor(mouseX, mouseY);
  setRing(ringX, ringY);
  cursor.classList.add("is-hidden");
  ring.classList.add("is-hidden");
  tick();
})();
