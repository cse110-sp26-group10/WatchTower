async function getDataFromServer() {
    try {
        let response = await fetch("http://localhost:8080/api/data");
        if (!response.ok) {
            throw new Error("Network response failed")
        }
        let data = await response.json();
        console.log("Response:", data);
        return data;
    } catch (error) {
        console.log("Logging failed:", error);
        return null;
    }
}

let data = await getDataFromServer();