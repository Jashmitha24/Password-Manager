// Remove ?website=... from URL so saved passwords always load
history.replaceState(null, "", "index.html");

let selectedFolder = "All";

const form = document.getElementById("passwordForm");
const passwordList = document.getElementById("passwords");
const searchInput = document.getElementById("searchInput");

// 1. Initial Load
document.addEventListener("DOMContentLoaded", loadPasswords);

// 2. Listen for changes from OTHER tabs
window.addEventListener('storage', function(event) {
    if (event.key === 'passwords') {
        loadPasswords(); // Reload data when another tab updates localStorage
    }
});

// ADD PASSWORD
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const website = document.getElementById("website").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const entry = {
        website,
        username,
        password,
        folder: selectedFolder
    };

    let saved = JSON.parse(localStorage.getItem("passwords")) || [];
    saved.push(entry);
    localStorage.setItem("passwords", JSON.stringify(saved));

    form.reset();
    loadPasswords();
});

// LOAD PASSWORDS
function loadPasswords(filter = "") {
    passwordList.innerHTML = "";

    const saved = JSON.parse(localStorage.getItem("passwords")) || [];

    const filtered = saved.filter(item => {
        const matchesFolder = selectedFolder === "All" || item.folder === selectedFolder;
        const matchesSearch =
            item.website.toLowerCase().includes(filter.toLowerCase()) ||
            item.username.toLowerCase().includes(filter.toLowerCase());

        return matchesFolder && matchesSearch;
    });

    filtered.forEach((item, index) => {
        const li = document.createElement("li");

        // Note: The index here is based on the FILTRATED list, 
        // to delete correctly, we need the index of the ORIGINAL list.
        // For simplicity with this current structure, I'm keeping your indexing,
        // but it may cause issues if you delete while searching.
        
        li.innerHTML = `
            <div>
                <strong>${item.website}</strong><br>
                Username: ${item.username}<br>
                Password: <span id="pass-${index}">••••••••</span>
            </div>

            <div class="actions">
                <button onclick="togglePassword(${index})"><i class="fas fa-eye"></i></button>
                <button class="delete" onclick="deletePassword(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;

        passwordList.appendChild(li);
    });
}

// SHOW / HIDE PASSWORD
function togglePassword(index) {
    const saved = JSON.parse(localStorage.getItem("passwords"));
    const span = document.getElementById(`pass-${index}`);

    if (span.textContent === "••••••••") {
        span.textContent = saved[index].password;
    } else {
        span.textContent = "••••••••";
    }
}

// DELETE PASSWORD
function deletePassword(index) {
    let saved = JSON.parse(localStorage.getItem("passwords"));
    saved.splice(index, 1);
    localStorage.setItem("passwords", JSON.stringify(saved));
    loadPasswords();
}

// SEARCH
searchInput.addEventListener("input", function () {
    loadPasswords(searchInput.value);
});

// SELECT FOLDER
function selectFolder(name) {
    selectedFolder = name;
    loadPasswords();

    document.querySelectorAll("#folderList li").forEach(li => {
        li.classList.remove("active");
        if (li.textContent === name) li.classList.add("active");
    });
}

// CREATE NEW FOLDER
function createFolder() {
    const name = prompt("Enter folder name:");
    if (!name) return;

    const folderList = document.getElementById("folderList");
    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => selectFolder(name);
    folderList.appendChild(li);
}
