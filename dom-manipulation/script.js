// Initial quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// Cached DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categorySelect');

// === Utility Functions ===

// Get random quote, optionally filtered by category
function getRandomQuote(category = null) {
  const filteredQuotes = category && category !== 'All'
    ? quotes.filter(q => q.category.toLowerCase() === category.toLowerCase())
    : quotes;

  if (filteredQuotes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  return filteredQuotes[randomIndex];
}

// Show a random quote in the DOM
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const quote = getRandomQuote(selectedCategory);
  quoteDisplay.textContent = quote
    ? `"${quote.text}" - [${quote.category}]`
    : "No quotes available in this category.";
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

// Add a new quote from user input
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
  updateCategoryFilter(); // Refresh categories
  showRandomQuote(); // Optionally display the new quote

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Dynamically create the add-quote form
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

  // Add event listener to the dynamically created button
  addButton.addEventListener('click', addQuote);
}

// === Event Listeners ===
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);

// === Initialize ===
updateCategoryFilter();
showRandomQuote();
createAddQuoteForm(); // ✅ Create the form dynamically
