// Mobile navigation toggle
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Property type filter tabs (listings page)
  var tabs = document.querySelectorAll('[role="tab"]');
  var cards = document.querySelectorAll("[data-property-type]");

  if (tabs.length && cards.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", "false");
        });
        tab.setAttribute("aria-selected", "true");

        var filter = tab.getAttribute("data-filter");
        cards.forEach(function (card) {
          var type = card.getAttribute("data-property-type");
          var show = filter === "all" || filter === type;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }
});
