const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const baseUrl = isLocal
    ? window.location.origin
    : 'https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main';

const scripts = [
    'src/app/tracker/assets/tracker.js'
];

window.__WATCHTOWER_CONFIG__ = {
    apiKey: document.currentScript.getAttribute("data-apikey")
};

scripts.forEach((src) => {
    const scriptName = src.split('/').at(-1);
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${baseUrl}/${src}`;
    script.onload = () => console.log(`WatchTower: ${scriptName} loaded`);
    script.onerror = () => console.error(`WatchTower: Failed to load ${scriptName}`);
    document.head.appendChild(script);
});
