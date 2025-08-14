const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categorySelect');
const quoteCount = document.getElementById('quoteCount');

let quotes = [];

// === Load Quotes from localStorage or Default ===
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not in what you have, but who you are.", category: "Success" }
  ];
}

// === Save Quotes to localStorage ===
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// === Get Random Quote ===
function getRandomQuote(category = null) {
  const filteredQuotes = category && category.toLowerCase() !== 'all'
    ? quotes.filter(q => q.category.toLowerCase() === category.toLowerCase())
    : quotes;

  if (filteredQuotes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  return filteredQuotes[randomIndex];
}

// === Show Quote in DOM ===
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);

  const filteredQuotes = selectedCategory === 'All'
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    quoteCount.textContent = "";
    return;
  }

  const randomQuote = getRandomQuote(selectedCategory);
  quoteDisplay.textContent = `"${randomQuote.text}" - [${randomQuote.category}]`;

  quoteCount.textContent = `Showing ${filteredQuotes.length} quote(s) in “${selectedCategory}”`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
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
  if (lastCategory) {
    categoryFilter.value = lastCategory;
  }
}

// === Update Category Dropdown ===
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

// === Add a New Quote ===
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
  updateCategoryFilter();
  showRandomQuote();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// === Dynamically Create Add Quote Form ===
function createAddQuoteForm() {
  const formTitle = document.createElement('h3');
  formTitle.textContent = "Add a New Quote";

  const formContainer = document.createElement('div');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';
  inputText.autofocus = true;

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

// === Export Quotes to JSON ===
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

// === Import Quotes from JSON ===
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      // Deduplicate
      importedQuotes.forEach(iq => {
        if (!quotes.some(q => q.text === iq.text && q.category === iq.category)) {
          quotes.push(iq);
        }
      });

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

// === Event Listeners ===
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);

// === Initialization ===
loadQuotes();
updateCategoryFilter();
restoreLastSelectedCategory();
loadLastViewedQuote();
createAddQuoteForm();
showRandomQuote();
