let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categorySelect');

// Load quotes from localStorage on initialization
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not in what you have, but who you are.", category: "Success" }
  ];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Get random quote, optionally by category
function getRandomQuote(category = null) {
  const filteredQuotes = category && category !== 'All'
    ? quotes.filter(q => q.category.toLowerCase() === category.toLowerCase())
    : quotes;

  if (filteredQuotes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  return filteredQuotes[randomIndex];
}

// Show random quote in the DOM
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const quote = getRandomQuote(selectedCategory);

  if (quote) {
    quoteDisplay.textContent = `"${quote.text}" - [${quote.category}]`;

    // Save to sessionStorage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  } else {
    quoteDisplay.textContent = "No quotes available in this category.";
  }
}

// Load last viewed quote from sessionStorage (optional)
function loadLastViewedQuote() {
  const stored = sessionStorage.getItem('lastViewedQuote');
  if (stored) {
    const quote = JSON.parse(stored);
    quoteDisplay.textContent = `"${quote.text}" - [${quote.category}]`;
  }
}

// Update the category dropdown with unique categories
function updateCategoryFilter() {
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
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  updateCategoryFilter();
  showRandomQuote();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Dynamically create the quote form
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

// === JSON Export ===
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

// === JSON Import ===
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryFilter();
      showRandomQuote();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert("Failed to import quotes. Invalid JSON format.");
    }
  };
  reader.readAsText(file);
}

// Create import/export UI
function createImportExportUI() {
  const exportBtn = document.createElement('button');
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.onclick = exportToJsonFile;

  const importLabel = document.createElement('label');
  importLabel.textContent = "Import Quotes (JSON): ";

  const importInput = document.createElement('input');
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener('change', importFromJsonFile);

  document.body.appendChild(document.createElement('hr'));
  document.body.appendChild(exportBtn);
  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(importLabel);
  document.body.appendChild(importInput);
}

// === Event Listeners ===
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);

// === Initialization ===
loadQuotes();
updateCategoryFilter();
loadLastViewedQuote();
createAddQuoteForm();
createImportExportUI();
