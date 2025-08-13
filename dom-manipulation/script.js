// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// Populate the category dropdown
function populateCategories() {
  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear existing options
  categorySelect.innerHTML = "";

  // Add options
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show a random quote from the selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

  // Filter quotes by category
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Add a new quote to the array and update UI
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update categories dropdown
  populateCategories();

  alert("Quote added successfully!");
}

// Event listeners
newQuoteButton.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize categories on page load
populateCategories();
