let budget = { total: 0, categories: {} };
let currentUser = localStorage.getItem("currentUser");

document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeUser").textContent = `Welcome, ${currentUser}!`;

  loadUserData();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  document.getElementById("addCategory").addEventListener("click", addCategory);
  document.getElementById("saveBudget").addEventListener("click", saveBudget);
  document.getElementById("addExpense").addEventListener("click", addExpense);
});

function addCategory() {
  const name = document.getElementById("newCategory").value.trim();
  const limit = parseFloat(document.getElementById("newLimit").value);
  if (!name || isNaN(limit) || limit <= 0) {
    alert("Enter valid category and limit");
    return;
  }
  if (budget.categories[name]) {
    alert("Category exists!");
    return;
  }
  budget.categories[name] = { limit: limit, spent: 0 };
  updateUI();
  saveData();
}

function saveBudget() {
  budget.total = parseFloat(document.getElementById("totalBudget").value);
  saveData();
  alert("Budget Saved!");
}

function addExpense() {
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if (!category || isNaN(amount) || amount <= 0) {
    alert("Invalid expense");
    return;
  }
  budget.categories[category].spent += amount;
  if (budget.categories[category].spent > budget.categories[category].limit) {
    alert(`⚠️ Limit exceeded for ${category}!`);
  }
  saveData();
  updateUI();
}

function updateUI() {
  const catList = document.getElementById("categoryList");
  const catSelect = document.getElementById("category");
  const progressList = document.getElementById("progressList");

  catList.innerHTML = "";
  catSelect.innerHTML = "";
  progressList.innerHTML = "";

  for (let cat in budget.categories) {
    const c = budget.categories[cat];
    catList.innerHTML += `<li>${cat}: ₹${c.limit}</li>`;
    catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    progressList.innerHTML += `<p>${cat}: ₹${c.spent} / ₹${c.limit}</p>`;
  }
}

function saveData() {
  localStorage.setItem(`budget_${currentUser}`, JSON.stringify(budget));
}

function loadUserData() {
  const data = localStorage.getItem(`budget_${currentUser}`);
  if (data) {
    budget = JSON.parse(data);
    updateUI();
  }
}
