let totalBudget = 0;
let categories = {};
let spent = {};

function setBudget() {
    const budgetInput = document.getElementById("totalBudget").value;
    if (budgetInput === "" || budgetInput <= 0) {
        alert("Please enter a valid total budget.");
        return;
    }
    totalBudget = parseFloat(budgetInput);
    document.getElementById("budgetDisplay").innerText = `Total Budget: ₹${totalBudget}`;
    alert("Total budget set successfully!");
}

function addCategory() {
    const category = document.getElementById("categoryName").value.trim();
    const limit = parseFloat(document.getElementById("categoryLimit").value);

    if (!category || isNaN(limit) || limit <= 0) {
        alert("Please enter a valid category name and limit.");
        return;
    }

    if (limit > totalBudget) {
        alert("⚠️ Limit cannot exceed total budget!");
        return; // stop further execution
    }

    if (categories[category]) {
        alert("This category already exists.");
        return;
    }

    categories[category] = limit;
    spent[category] = 0;
    displayCategories();
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryLimit").value = "";
}

function addExpense() {
    const category = document.getElementById("expenseCategory").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);

    if (!category || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid category and amount.");
        return;
    }

    spent[category] += amount;

    if (spent[category] > categories[category]) {
        alert(`⚠️ You have exceeded the limit for ${category}!`);
    }

    displayCategories();
    document.getElementById("expenseAmount").value = "";
}

function displayCategories() {
    const container = document.getElementById("categoriesList");
    container.innerHTML = "";

    Object.keys(categories).forEach(cat => {
        const progress = (spent[cat] / categories[cat]) * 100;
        container.innerHTML += `
            <div class="category-card">
                <h3>${cat}</h3>
                <p>Limit: ₹${categories[cat]}</p>
                <p>Spent: ₹${spent[cat]}</p>
                <div class="progress-bar">
                    <div class="progress" style="width:${Math.min(progress, 100)}%"></div>
                </div>
            </div>
        `;
    });

    updateExpenseDropdown();
}

function updateExpenseDropdown() {
    const dropdown = document.getElementById("expenseCategory");
    dropdown.innerHTML = "<option value=''>Select Category</option>";
    Object.keys(categories).forEach(cat => {
        dropdown.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

function resetLimits() {
    if (confirm("Are you sure you want to reset all limits?")) {
        categories = {};
        spent = {};
        document.getElementById("categoriesList").innerHTML = "";
        document.getElementById("expenseCategory").innerHTML = "<option value=''>Select Category</option>";
        alert("All category limits have been reset.");
    }
}
