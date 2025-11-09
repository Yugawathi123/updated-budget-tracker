let totalBudget = 0;
let categories = {};
let spent = {};
let currentUser = "";

// LOGIN FUNCTIONALITY
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  if (!username || !password) {
    message.innerText = "Please enter both username and password.";
    return;
  }

  const savedUsers = JSON.parse(localStorage.getItem("users")) || {};

  if (savedUsers[username]) {
    if (savedUsers[username].password !== password) {
      message.innerText = "Incorrect password!";
      return;
    }
  } else {
    savedUsers[username] = { password };
    localStorage.setItem("users", JSON.stringify(savedUsers));
  }

  currentUser = username;
  message.innerText = "";
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  document.getElementById("welcomeUser").innerText = `👋 Welcome, ${username}!`;

  loadData();
}

// SET TOTAL BUDGET
function setBudget() {
  const budgetInput = document.getElementById("totalBudget").value;
  if (budgetInput === "" || budgetInput <= 0) {
    alert("Please enter a valid total budget.");
    return;
  }
  totalBudget = parseFloat(budgetInput);
  document.getElementById("budgetDisplay").innerText = `✅ Total Budget: ₹${totalBudget}`;
  saveData();
}

// ADD CATEGORY
function addCategory() {
  const category = document.getElementById("categoryName").value.trim();
  const limit = parseFloat(document.getElementById("categoryLimit").value);

  if (!category || isNaN(limit) || limit <= 0) {
    alert("Please enter a valid category name and limit.");
    return;
  }

  if (limit > totalBudget) {
    alert("⚠️ Limit cannot exceed total budget!");
    return;
  }

  // 🧠 NEW FEATURE: Check if adding this limit exceeds total budget
  const totalUsed = Object.values(categories).reduce((a, b) => a + b, 0);
  const newTotal = totalUsed + limit;
  if (newTotal > totalBudget) {
    alert(`⚠️ Total category limits (₹${newTotal}) exceed total budget (₹${totalBudget})!`);
    return;
  }

  if (categories[category]) {
    alert("This category already exists.");
    return;
  }

  categories[category] = limit;
  spent[category] = 0;
  displayCategories();
  updateExpenseDropdown();
  saveData();

  document.getElementById("categoryName").value = "";
  document.getElementById("categoryLimit").value = "";
}

// ADD EXPENSE
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
  saveData();
  document.getElementById("expenseAmount").value = "";
}

// DISPLAY CATEGORIES
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
}

// UPDATE DROPDOWN
function updateExpenseDropdown() {
  const dropdown = document.getElementById("expenseCategory");
  dropdown.innerHTML = "<option value=''>Select Category</option>";
  Object.keys(categories).forEach(cat => {
    dropdown.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// RESET LIMITS
function resetLimits() {
  if (confirm("Are you sure you want to reset all limits?")) {
    categories = {};
    spent = {};
    saveData();
    displayCategories();
    updateExpenseDropdown();
    alert("All category limits have been reset.");
  }
}

// SAVE & LOAD DATA
function saveData() {
  const data = {
    totalBudget,
    categories,
    spent,
  };
  localStorage.setItem(`budgetData_${currentUser}`, JSON.stringify(data));
}

function loadData() {
  const data = localStorage.getItem(`budgetData_${currentUser}`);
  if (data) {
    const saved = JSON.parse(data);
    totalBudget = saved.totalBudget || 0;
    categories = saved.categories || {};
    spent = saved.spent || {};
    if (totalBudget > 0)
      document.getElementById("budgetDisplay").innerText = `✅ Total Budget: ₹${totalBudget}`;
    displayCategories();
    updateExpenseDropdown();
  }
}
