// Element references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categorySelect');
const quoteCount = document.getElementById('quoteCount');

let quotes = [];
const SYNC_INTERVAL = 30_000; // 30 seconds
const API_URL = 'https://dummyjson.com/quotes';

// Load from localStorage or default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [
    { text: "Default on-device quote.", category: "Default" }
  ];
}

// Persist quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate dropdown categories
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'All';
  allOpt.textContent = 'All';
  categoryFilter.appendChild(allOpt);
  categories.forEach(cat => {
    const opt = new Option(cat, cat);
    categoryFilter.appendChild(opt);
  });
}

// Display filtered quotes (random)
function filterQuotes() {
  const cat = categoryFilter.value;
  localStorage.setItem('selectedCategory', cat);
  const filtered = cat === 'All' ? quotes : quotes.filter(q => q.category === cat);

  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes in this category.";
    quoteCount.textContent = '';
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — (${random.category})`;
  quoteCount.textContent = `Showing ${filtered.length} quote(s) in "${cat}"`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(random));
}

// Show a new quote without changing filter
function showRandomQuote() {
  filterQuotes();
}

// Restore last seen quote
function loadLastViewedQuote() {
  const stored = sessionStorage.getItem('lastViewedQuote');
  if (stored) {
    const q = JSON.parse(stored);
    quoteDisplay.textContent = `"${q.text}" — (${q.category})`;
  }
}

// Restore last selected category
function restoreLastSelectedCategory() {
  const cat = localStorage.getItem('selectedCategory');
  if (cat) categoryFilter.value = cat;
}

// Add a new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const cat = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !cat) { alert('Both fields required.'); return; }
  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories();
  filterQuotes();
  alert('Quote added.');
}

// Detect and resolve conflict: server overrides local
function resolveConflicts(serverQuotes) {
  const all = [...serverQuotes];
  serverQuotes.forEach(sq => {
    if (!quotes.some(lq => lq.text === sq.quote && lq.category === (sq.category || 'Uncategorized'))) {
      all.push({ text: sq.quote, category: sq.category || 'Uncategorized' });
    }
  });
  return all;
}

// Fetch latest quotes from mock server
async function syncWithServer() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data?.quotes) {
      const merged = resolveConflicts(data.quotes);
      quotes = merged;
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification('Synced with server: quotes updated.');
    }
  } catch (e) {
    console.error('Sync error:', e);
  }
}

// Show a simple UI notification
function showNotification(msg) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    background: 'lightgreen',
    padding: '10px',
    border: '1px solid green',
    zIndex: 999
  });
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => document.body.removeChild(div), 4000);
}

// Create add-quote form
function createAddQuoteForm() {
  const title = document.createElement('h3');
  title.textContent = 'Add a New Quote';
  const container = document.createElement('div');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'New quote';

  const inputCat = document.createElement('input');
  inputCat.id = 'newQuoteCategory';
  inputCat.type = 'text';
  inputCat.placeholder = 'Category';

  const btn = document.createElement('button');
  btn.textContent = 'Add Quote';
  btn.addEventListener('click', addQuote);

  container.append(inputText, inputCat, btn);
  document.body.append(title, container);
}

// JSON export/import
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'quotes.json' });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
async function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) throw new Error();
    imported.forEach(iq => {
      if (!quotes.some(q => q.text === iq.text && q.category === iq.category)) quotes.push(iq);
    });
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert('Imported successfully.');
  } catch {
    alert('Invalid JSON.');
  }
}

// Event Listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Initialization
loadQuotes();
populateCategories();
restoreLastSelectedCategory();
loadLastViewedQuote();
createAddQuoteForm();
filterQuotes();
showRandomQuote();

// Periodic sync
setInterval(syncWithServer, SYNC_INTERVAL);
