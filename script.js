/**
 * what if, existence precedes essence?
 */

document.querySelector(".intro-page form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector(".intro-page form").setAttribute("disabled", "disabled");
  document.querySelector(".intro-page").setAttribute("hidden", "hidden");
  document.querySelector(".game").removeAttribute("hidden");
});