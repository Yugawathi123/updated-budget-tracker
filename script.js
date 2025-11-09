// Monthly per-user storage smart budget tracker
// Keying by username + month (YYYY-MM) so each month is separate
const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginMsg = document.getElementById('loginMsg');

const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

const welcome = document.getElementById('welcome');
const logoutBtn = document.getElementById('logoutBtn');

const totalBudgetInput = document.getElementById('totalBudget');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const clearMonthBtn = document.getElementById('clearMonthBtn');

const categoryNameInput = document.getElementById('categoryName');
const categoryLimitInput = document.getElementById('categoryLimit');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesContainer = document.getElementById('categoriesContainer');

const expenseCategory = document.getElementById('expenseCategory');
const expenseAmount = document.getElementById('expenseAmount');
const addExpenseBtn = document.getElementById('addExpenseBtn');

const summaryDiv = document.getElementById('summary');
const lastUpdatedP = document.getElementById('lastUpdated');
const budgetInfo = document.getElementById('budgetInfo');

let username = null;
let monthKey = null; // YYYY-MM
let storageKey = null; // budget_{username}_{YYYY-MM}
let state = {
  total: 0,
  categories: {}, // {name: limit}
  expenses: {},   // {name: spent}
  lastUpdated: null
};

// --- helpers
function getCurrentMonthKey(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  return `${yyyy}-${mm}`;
}
function storageKeyFor(user, month){ return `budget_${user}_${month}`; }
function saveState(){
  localStorage.setItem(storageKey, JSON.stringify(state));
}
function loadState(){
  const raw = localStorage.getItem(storageKey);
  if(raw){
    try{ state = JSON.parse(raw); } catch(e){ console.error(e); }
  } else {
    // reset base state
    state = { total:0, categories:{}, expenses:{}, lastUpdated:null };
  }
}

// --- login/register
loginBtn.addEventListener('click', () => {
  loginMsg.textContent = '';
  const user = loginUsername.value.trim();
  const pass = loginPassword.value.trim();
  if(!user || !pass){ loginMsg.textContent = 'Please enter username and password'; return; }

  // simple user store (passwords stored in localStorage; for demo only)
  const usersRaw = localStorage.getItem('users_db');
  const users = usersRaw ? JSON.parse(usersRaw) : {};
  if(users[user]){
    if(users[user].password !== pass){
      loginMsg.textContent = 'Incorrect password';
      return;
    }
  } else {
    // register new
    users[user] = { password: pass };
    localStorage.setItem('users_db', JSON.stringify(users));
  }

  username = user;
  monthKey = getCurrentMonthKey();
  storageKey = storageKeyFor(username, monthKey);
  loadState();
  showApp();
});

// show app
function showApp(){
  loginPage.classList.add('hidden');
  app.classList.remove('hidden');
  welcome.textContent = `👋 Welcome, ${username}!`;
  renderAll();
}

// logout
logoutBtn.addEventListener('click', () => {
  username = null;
  monthKey = null;
  storageKey = null;
  loginUsername.value=''; loginPassword.value='';
  app.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

// Save budget
saveBudgetBtn.addEventListener('click', () => {
  const total = Number(totalBudgetInput.value);
  if(!total || total <= 0){ alert('Enter a valid total budget'); return; }

  // ensure sum of category limits <= total
  const sumLimits = Object.values(state.categories).reduce((a,b)=>a+(Number(b)||0),0);
  if(sumLimits > total){
    alert(`⚠️ Total of category limits (₹${sumLimits}) exceeds budget (₹${total}). Adjust limits first.`);
    return;
  }

  state.total = total;
  state.lastUpdated = new Date().toISOString();
  saveState();
  renderAll();
  alert('✅ Total budget saved');
});

// Add category with validation
addCategoryBtn.addEventListener('click', () => {
  const name = (categoryNameInput.value || '').trim();
  const limit = Number(categoryLimitInput.value);
  if(!name) { alert('Enter category name'); return; }
  if(!limit || limit <= 0) { alert('Enter a valid limit'); return; }
  if(!state.total || state.total <= 0){ alert('Please save total budget first'); return; }

  // check existing sum + this <= total
  const used = Object.values(state.categories).reduce((a,b)=>a+(Number(b)||0),0);
  if(used + limit > state.total){
    alert(`⚠️ Adding this limit makes total limits ₹${used+limit} which exceeds budget ₹${state.total}`);
    return;
  }
  if(state.categories[name]){
    alert('Category already exists');
    return;
  }
  state.categories[name] = limit;
  state.expenses[name] = 0;
  state.lastUpdated = new Date().toISOString();
  saveState();
  categoryNameInput.value=''; categoryLimitInput.value='';
  renderAll();
});

// add expense
addExpenseBtn.addEventListener('click', () => {
  const cat = expenseCategory.value;
  const amt = Number(expenseAmount.value);
  if(!cat){ alert('Choose a category'); return; }
  if(!amt || amt <= 0){ alert('Enter a valid amount'); return; }
  if(!(cat in state.expenses)) state.expenses[cat] = 0;
  state.expenses[cat] += amt;
  state.lastUpdated = new Date().toISOString();
  saveState();
  expenseAmount.value='';
  renderAll();

  if(state.expenses[cat] > (state.categories[cat] || 0)){
    alert(`⚠️ You have exceeded the limit for ${cat}`);
  }
});

// reset limits (clear categories & expenses for month)
clearMonthBtn.addEventListener('click', () => {
  if(!confirm('Reset all categories & expenses for this month?')) return;
  state.categories = {};
  state.expenses = {};
  state.total = 0;
  state.lastUpdated = new Date().toISOString();
  saveState();
  totalBudgetInput.value = '';
  renderAll();
});

// UI rendering
function renderAll(){
  loadState();
  totalBudgetInput.value = state.total || '';
  budgetInfo.textContent = state.total ? `Total budget set to ₹${state.total}` : 'No total budget set yet';
  renderCategories();
  renderExpenseSelect();
  renderSummary();
}

function renderCategories(){
  categoriesContainer.innerHTML = '';
  const keys = Object.keys(state.categories);
  if(keys.length === 0){
    categoriesContainer.innerHTML = `<div class="muted">No categories yet. Add one above.</div>`;
    return;
  }
  keys.forEach(name => {
    const limit = state.categories[name] || 0;
    const spent = state.expenses[name] || 0;
    const percent = limit > 0 ? Math.min(100, Math.round((spent/limit)*100)) : 0;
    const div = document.createElement('div');
    div.className = 'cat-row';
    div.innerHTML = `
      <div class="cat-info">
        <strong>${escapeHtml(name)}</strong>
        <div class="muted small">Limit: ₹${limit} • Spent: ₹${spent}</div>
        <div class="progress"><div class="fill" style="width:${percent}%"></div></div>
      </div>
      <div>
        <button onclick="removeCategory('${encodeURIComponent(name)}')" style="background:#f97316;padding:8px;border-radius:8px;border:0;color:#fff">Delete</button>
      </div>
    `;
    categoriesContainer.appendChild(div);
  });
}

function removeCategory(encodedName){
  const name = decodeURIComponent(encodedName);
  if(!confirm(`Delete category "${name}"? This removes its limit and spent amount.`)) return;
  delete state.categories[name];
  delete state.expenses[name];
  state.lastUpdated = new Date().toISOString();
  saveState();
  renderAll();
}

function renderExpenseSelect(){
  expenseCategory.innerHTML = '';
  const keys = Object.keys(state.categories);
  if(keys.length === 0){
    expenseCategory.innerHTML = `<option value="">— add category first —</option>`;
    return;
  }
  const opt0 = document.createElement('option'); opt0.value=''; opt0.textContent='Select category'; expenseCategory.appendChild(opt0);
  keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = k;
    expenseCategory.appendChild(opt);
  });
}

function renderSummary(){
  summaryDiv.innerHTML = '';
  let totalSpent = 0;
  const ul = document.createElement('ul');
  ul.style.listStyle='none'; ul.style.padding='0';
  for(const cat of Object.keys(state.categories)){
    const limit = state.categories[cat] || 0;
    const spent = state.expenses[cat] || 0;
    totalSpent += spent;
    const li = document.createElement('li');
    li.textContent = `${cat}: ₹${spent} / ₹${limit}`;
    ul.appendChild(li);
  }
  const totalLine = document.createElement('div');
  totalLine.style.marginTop='10px';
  const remaining = (state.total || 0) - totalSpent;
  totalLine.innerHTML = `<strong>Total spent:</strong> ₹${totalSpent} &nbsp; | &nbsp; <strong>Remaining:</strong> ₹${remaining}`;
  summaryDiv.appendChild(ul);
  summaryDiv.appendChild(totalLine);

  lastUpdatedP.textContent = state.lastUpdated ? `Last updated: ${new Date(state.lastUpdated).toLocaleString()}` : '';
}

// escape html
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// init (if user already logged in - none by default)
(function init(){
  // nothing to auto-login; wait for user to log in
})();
