
const API_URL = "http://127.0.0.1:5000";

function showLogin() {
    alert("Student login will be connected in the next stage.");
}

async function loadItems(type = "all") {
    const grid = document.getElementById("itemGrid");

    try {
        const response = await fetch(`${API_URL}/api/items?type=${type}`);

        if (!response.ok) throw new Error("Unable to load reports");

        const items = await response.json();

        if (!items.length) {
            grid.innerHTML = `
                <div class="empty-state">
                    <span>✧</span>
                    <h3>No reports yet</h3>
                    <p>Be the first to report an item!</p>
                </div>`;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="item-card">
                <p>${escapeHTML(item.type.toUpperCase())}</p>
                <h3>${escapeHTML(item.name)}</h3>
                <p>Category: ${escapeHTML(item.category || "Not specified")}</p>
                <p>Colour: ${escapeHTML(item.colour || "Not specified")}</p>
                <p>Location: ${escapeHTML(item.location)}</p>
                <p>${escapeHTML(item.description || "")}</p>
                <small>${escapeHTML(item.date)}</small>
            </div>
        `).join("");

    } catch (error) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Unable to connect</h3>
                <p>Check whether the Flask backend is running.</p>
            </div>`;
        console.error(error);
    }
}

function filterItems(type, button) {
    document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
    });

    button.classList.add("active");
    loadItems(type);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.getElementById("reportForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const message = document.getElementById("formMessage");
    message.textContent = "Submitting report...";

    const report = {
        name: document.getElementById("itemName").value.trim(),
        type: document.getElementById("itemType").value,
        category: document.getElementById("itemCategory").value,
        colour: document.getElementById("itemColour").value.trim(),
        location: document.getElementById("itemLocation").value,
        description: document.getElementById("itemDescription").value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/api/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(report)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Report failed");
        }

        message.textContent = "✓ Item reported successfully!";
        this.reset();
        loadItems();

    } catch (error) {
        message.textContent = error.message;
        console.error(error);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadItems();
});
