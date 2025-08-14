const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categorySelect');
const quoteCount = document.getElementById('quoteCount');

let quotes = [];
const SYNC_INTERVAL = 30000; // every 30 seconds
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// === Load from localStorage or use default quotes ===
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not in what you have, but who you are.", category: "Success" }
  ];
}

// === Save quotes to localStorage ===
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// === Populate category dropdown ===
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'All';
  allOption.textContent = 'All';
  categoryFilter.appendChild(allOption);

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  restoreLastSelectedCategory();
}

// === Filter and show a quote ===
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);

  const filtered = selectedCategory === 'All'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available in this category.";
    if (quoteCount) quoteCount.textContent = "";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" - [${random.category}]`;
  if (quoteCount) quoteCount.textContent = `Showing ${filtered.length} quote(s) in “${selectedCategory}”`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(random));
}

// === Show new random quote ===
function showRandomQuote() {
  filterQuotes();
}

// === Restore last viewed quote ===
function loadLastViewedQuote() {
  const stored = sessionStorage.getItem('lastViewedQuote');
  if (stored) {
    const quote = JSON.parse(stored);
    quoteDisplay.textContent = `"${quote.text}" - [${quote.category}]`;
  }
}

// === Restore last selected category ===
function restoreLastSelectedCategory() {
  const lastCategory = localStorage.getItem('selectedCategory');
  if (lastCategory && categoryFilter) {
    categoryFilter.value = lastCategory;
  }
}

// === Add new quote ===
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  postQuoteToServer(newQuote); // Post to server

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// === Post quote to server using JSONPlaceholder ===
async function postQuoteToServer(quote) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: quote.category,
        body: quote.text,
        userId: 1
      })
    });
    console.log("Quote posted to server:", quote);
  } catch (err) {
    console.error("Failed to post quote:", err);
  }
}

// === Create Add Quote form dynamically ===
function createAddQuoteForm() {
  const title = document.createElement('h3');
  title.textContent = "Add a New Quote";

  const container = document.createElement('div');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';

  const inputCat = document.createElement('input');
  inputCat.id = 'newQuoteCategory';
  inputCat.type = 'text';
  inputCat.placeholder = 'Enter quote category';

  const btn = document.createElement('button');
  btn.textContent = 'Add Quote';
  btn.addEventListener('click', addQuote);

  container.append(inputText, inputCat, btn);
  document.body.append(title, container);
}

// === Fetch quotes from server (GET) ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Simulate conversion from posts to quotes
    return data.slice(0, 10).map(post => ({
      text: post.body,
      category: "Server"
    }));
  } catch (err) {
    console.error("Failed to fetch quotes from server:", err);
    return [];
  }
}

// === Resolve quote conflicts (merge) ===
function resolveConflicts(serverQuotes) {
  const merged = [...quotes];
  serverQuotes.forEach(sq => {
    if (!merged.some(q => q.text === sq.text && q.category === sq.category)) {
      merged.push(sq);
    }
  });
  return merged;
}

// === Sync with server ===
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length > 0) {
    quotes = resolveConflicts(serverQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Synced with server.");
  }
}
function syncQuotes() {
  syncWithServer();
}
// === Show notification ===
function showNotification(message) {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.position = 'fixed';
  note.style.bottom = '20px';
  note.style.right = '20px';
  note.style.background = '#d4edda';
  note.style.color = '#155724';
  note.style.padding = '10px 20px';
  note.style.border = '1px solid #c3e6cb';
  note.style.borderRadius = '5px';
  note.style.zIndex = 1000;
  document.body.appendChild(note);

  setTimeout(() => note.remove(), 4000);
}

// === Export quotes as JSON ===
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();

  URL.revokeObjectURL(url);
}

// === Import quotes from JSON file ===
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      importedQuotes.forEach(iq => {
        if (!quotes.some(q => q.text === iq.text && q.category === iq.category)) {
          quotes.push(iq);
        }
      });

      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert("Failed to import quotes. Invalid JSON format.");
    }
  };
  reader.readAsText(file);
}

// === Event Listeners ===
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// === Initialization ===
loadQuotes();
populateCategories();
restoreLastSelectedCategory();
loadLastViewedQuote();
createAddQuoteForm();
filterQuotes();

// === Periodic sync ===
setInterval(syncWithServer, SYNC_INTERVAL);
