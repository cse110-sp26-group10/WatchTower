function get_user_id() {
    let user_id = localStorage.getItem("watchtower_user_id");
    if (user_id === null) {
        user_id = crypto.randomUUID(); // Generate new user_id
        localStorage.setItem("watchtower_user_id", user_id);
    }
    return user_id;
}

// Sample event (test on browser)
let test = {}
test.event_type = "survey";
test.timestamp = new Date().toISOString();
test.deployment = {
    "id": "test_deployment",
    "version": "v0",
    "commit_hash": "abcdef"
};
test.user_id = get_user_id();
test.current_url = window.location.href;
test.referrer = document.referrer;
test.metadata = {
    "rating": 5,
    "message": "This is a test."
};
console.log(test);
fetch("http://localhost:8080", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(test)
}).then((response) => {
    if (!response.ok) {
      throw new Error("Network response failed");
    }
    return response.json();
}).then((data) => {
    console.log("Response:", data);
}).catch((error) => {
    console.log("Logging failed:", error);
});