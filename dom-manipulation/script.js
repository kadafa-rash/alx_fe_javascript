// Initial quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// Cached DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryFilter = document.getElementById('categoryFilter');

// === Utility Functions ===

// Get random quote, optionally by category
function getRandomQuote(category = null) {
  const filteredQuotes = category && category !== 'All'
    ? quotes.filter(q => q.category.toLowerCase() === category.toLowerCase())
    : quotes;

  if (filteredQuotes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  return filteredQuotes[randomIndex];
}

// Display a random quote in the DOM
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const quote = getRandomQuote(selectedCategory);
  quoteDisplay.textContent = quote
    ? `"${quote.text}" - [${quote.category}]`
    : "No quotes available in this category.";
}

// Populate category dropdown
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

// Add a new quote from user input
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  updateCategoryFilter(); // Refresh category list

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
  showRandomQuote(); // ✅ Show the new quote immediately
}

// === Event Listeners ===
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', showRandomQuote);

// Initial Setup
updateCategoryFilter();
showRandomQuote(); // Display a random quote on load
