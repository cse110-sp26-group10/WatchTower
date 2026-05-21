const repo = "https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main/";
const scripts = [
    "src/prototype/tracker/assets/tracker.js"
];

scripts.forEach(async (src) => {
    const scriptName = src.split("/").at(-1);
    try {
        const response = await fetch(repo + src);
        if (!response.ok) throw new Error(`WatchTower: HTTP errored with status: ${response.status}`);
        const code = await response.text();
        const script = document.createElement("script");
        script.text = code;
        document.head.appendChild(script);
        console.log(`WatchTower: ${scriptName} loaded`);
    } catch (error) {
        console.error(`WatchTower: Failed to load ${scriptName}`, error);
    }
});