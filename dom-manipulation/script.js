const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categorySelect');
const quoteCount = document.getElementById('quoteCount');

let quotes = [];
const SYNC_INTERVAL = 30000; // 30 seconds
const API_URL = 'https://dummyjson.com/quotes';

// === Load from LocalStorage or Default Quotes ===
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not in what you have, but who you are.", category: "Success" }
  ];
}

// === Save to LocalStorage ===
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// === Populate Category Dropdown ===
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

  restoreLastSelectedCategory(); // Restore selection after repopulating
}

// === Filter and Display a Random Quote ===
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);

  const filteredQuotes = selectedCategory === 'All'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (!filteredQuotes.length) {
    quoteDisplay.textContent = "No quotes available in this category.";
    quoteCount.textContent = "";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" - [${randomQuote.category}]`;
  quoteCount.textContent = `Showing ${filteredQuotes.length} quote(s) in “${selectedCategory}”`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// === Show Random Quote (Button) ===
function showRandomQuote() {
  filterQuotes();
}

// === Restore Last Viewed Quote ===
function loadLastViewedQuote() {
  const stored = sessionStorage.getItem('lastViewedQuote');
  if (stored) {
    const quote = JSON.parse(stored);
    quoteDisplay.textContent = `"${quote.text}" - [${quote.category}]`;
  }
}

// === Restore Last Selected Category ===
function restoreLastSelectedCategory() {
  const lastCategory = localStorage.getItem('selectedCategory');
  if (lastCategory && categoryFilter) {
    categoryFilter.value = lastCategory;
  }
}

// === Add New Quote ===
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// === Create Add-Quote Form ===
function createAddQuoteForm() {
  const formTitle = document.createElement('h3');
  formTitle.textContent = "Add a New Quote";

  const formContainer = document.createElement('div');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.id = 'addQuoteBtn';
  addButton.textContent = 'Add Quote';

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.appendChild(formTitle);
  document.body.appendChild(formContainer);

  addButton.addEventListener('click', addQuote);
}

// === Fetch Quotes from Server ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data || !data.quotes) return [];

    // Map server data to match local format
    return data.quotes.map(q => ({
      text: q.quote,
      category: q.category || 'Uncategorized'
    }));
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

// === Conflict Resolution (Server Wins) ===
function resolveConflicts(serverQuotes) {
  const merged = [...quotes];

  serverQuotes.forEach(sq => {
    const exists = merged.some(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) {
      merged.push(sq);
    }
  });

  return merged;
}

// === Sync with Server ===
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length > 0) {
    quotes = resolveConflicts(serverQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification('Quotes synced with server.');
  }
}

// === Show Sync Notification ===
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

  setTimeout(() => {
    note.remove();
  }, 4000);
}

// === Export to JSON File ===
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

// === Import from JSON File ===
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

// === Periodic Sync with Server ===
setInterval(syncWithServer, SYNC_INTERVAL);
