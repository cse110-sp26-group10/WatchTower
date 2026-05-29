const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const baseUrl = isLocal
  ? window.location.origin
  : "https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main";

const scripts = ["src/prototype/tracker/assets/tracker.js"];

scripts.forEach((src) => {
<<<<<<< HEAD
    const scriptName = src.split('/').at(-1);
    const script = document.createElement('script');
    script.setAttribute("data-apikey", document.currentScript.getAttribute("data-apikey"));
    script.src = `${baseUrl}/${src}`;
    script.onload = () => console.log(`WatchTower: ${scriptName} loaded`);
    script.onerror = () => console.error(`WatchTower: Failed to load ${scriptName}`);
    document.head.appendChild(script);
=======
  const scriptName = src.split("/").at(-1);
  const script = document.createElement("script");
  script.src = `${baseUrl}/${src}`;
  script.onload = () => console.log(`WatchTower: ${scriptName} loaded`);
  script.onerror = () =>
    console.error(`WatchTower: Failed to load ${scriptName}`);
  document.head.appendChild(script);
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
});
