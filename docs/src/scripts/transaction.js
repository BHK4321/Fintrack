      let transactions = [];
        let filteredTransactions = [];

        // Store all transactions
        async function fetchTransactions() {
            try {
                const userEmail = localStorage.getItem("userEmail");
                if (!userEmail) throw new Error("User email not found");

                const response = await fetch(`https://my-backend-api-erp6.onrender.com/api/get-transactions?userEmail=${encodeURIComponent(userEmail)}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                console.log("ok");
                if (!response.ok) throw new Error("Failed to fetch transactions.");
                const trans = await response.json();
                transactions = [];

                trans.forEach(transaction => {
                    const { userEmail, ...transactionWithoutEmail } = transaction;
                    transactionWithoutEmail.id = transactionWithoutEmail._id;
                    transactions.push(transactionWithoutEmail);
                });
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        }
        document.addEventListener("DOMContentLoaded", function () {
            // DOM Elements
            const transactionBody = document.getElementById("transaction-body");
            const addTransactionBtn = document.getElementById("add-transaction-btn");
            const exportCsvBtn = document.getElementById("export-csv-btn");
            const importCsvBtn = document.getElementById("import-csv-btn");
            const fileInput = document.getElementById("csv-file-input");
            const csvDropzone = document.getElementById("csv-dropzone");
            const searchTypeSelect = document.getElementById("search-type");
            const dateSearch = document.getElementById("date-search");
            const categorySearch = document.getElementById("category-search");
            const searchBtn = document.getElementById("search-btn");
            const resetSearchBtn = document.getElementById("reset-search-btn");
            const sortBySelect = document.getElementById("sort-by");
            // Initialize chart with responsive options
            const ctx = document.getElementById('category-chart').getContext('2d');
            let categoryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#0066cc', '#0080ff', '#66b3ff', '#2997ff', '#0056b3',
                            '#e0e0e0', '#86868b', '#6c757d', '#003366', '#002b4d'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ₹${value.toFixed(2)}`;
                                }
                            }
                        }
                    }
                }
            });
            // Toggle search type
            searchTypeSelect.addEventListener("change", function () {
                if (this.value === "date") {
                    dateSearch.style.display = "flex";
                    categorySearch.style.display = "none";
                } else {
                    dateSearch.style.display = "none";
                    categorySearch.style.display = "block";
                }
            });
            async function add(transaction) {
                const userEmail = localStorage.getItem("userEmail");
                const resp = await fetch("https://my-backend-api-erp6.onrender.com/api/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...transaction, userEmail }),
                });

                if (!resp.ok) {
                    console.error("Error adding transaction:", await resp.json());
                    return null; // Prevent pushing invalid data
                }

                const data = await resp.json();
                return data.id || null; // Ensure id exists
            }

            async function del(id) {
                const resp = await fetch(`https://my-backend-api-erp6.onrender.com/api/transactions/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!resp.ok) {
                    console.error("Error deleting transaction:", await resp.json());
                }
            }
            async function initialize() {
                await fetchTransactions(); // Fetch transactions before setting up chart
                updateTransactionTable();
                updateChart();
            }
            initialize();
            // Add transaction
            addTransactionBtn.addEventListener("click", async function () {
                const date = document.getElementById("transaction-date").value;
                const description = document.getElementById("transaction-desc").value;
                const category = document.getElementById("transaction-category").value;
                const amount = document.getElementById("transaction-amount").value;

                if (!date || !description || !amount) {
                    alert("Please fill in all fields.");
                    return;
                }

                const transaction = {
                    date: date,
                    description: description,
                    category: category,
                    amount: parseFloat(amount),
                };

                const id = await add(transaction);
                if (!id) {
                    alert("Failed to add transaction.");
                    return;
                }

                transaction.id = id;
                transactions.push(transaction);
                updateTransactionTable();
                updateChart();
                // Clear form
                document.getElementById("transaction-date").value = "";
                document.getElementById("transaction-desc").value = "";
                document.getElementById("transaction-amount").value = "";
            });
            function attachDeleteListeners() {
                document.querySelectorAll(".delete-btn").forEach((btn, index) => {
                    btn.addEventListener("click", function () {
                        const currentTransactions = filteredTransactions.length > 0 ? filteredTransactions : transactions;
                        const transactionIndex = transactions.indexOf(currentTransactions[index]);
                        const trans = transactions[transactionIndex];
                        del(trans.id);
                        if (transactionIndex > -1) {
                            transactions.splice(transactionIndex, 1);
                            updateTransactionTable();
                            updateChart();
                        }
                    });
                });
            }

            // Update transaction table
            function updateTransactionTable() {
                transactionBody.innerHTML = ""; // Clear table

                const displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : transactions;
                displayTransactions.forEach(transaction => {
                    const row = document.createElement("tr");
                    const datea = new Date(transaction.date).toISOString().split("T")[0];

                    row.innerHTML = `
            <td>${datea}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>₹${transaction.amount.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger delete-btn" data-id="${transaction.id}">Delete</button>
            </td>
        `;
                    transactionBody.appendChild(row);
                });

                attachDeleteListeners(); // Reattach event listeners
            }


            // Update chart
            function updateChart() {
                // Group by category and sum amounts
                const categoryData = {};

                transactions.forEach(transaction => {
                    // Include all transaction types
                    const category = transaction.category;
                    const amount = Math.abs(transaction.amount);

                    if (categoryData[category]) {
                        categoryData[category] += amount;
                    } else {
                        categoryData[category] = amount;
                    }
                });

                // Check if we have any data to display
                if (Object.keys(categoryData).length === 0) {
                    categoryChart.data.labels = ['No transaction data'];
                    categoryChart.data.datasets[0].data = [1];
                    categoryChart.data.datasets[0].backgroundColor = ['#e0e0e0'];
                } else {
                    const labels = Object.keys(categoryData);
                    const data = Object.values(categoryData);

                    // Update chart data
                    categoryChart.data.labels = labels;
                    categoryChart.data.datasets[0].data = data;
                    categoryChart.data.datasets[0].backgroundColor = [
                        '#0066cc', '#0080ff', '#66b3ff', '#2997ff', '#0056b3',
                        '#e0e0e0', '#86868b', '#6c757d', '#003366', '#002b4d'
                    ].slice(0, labels.length);
                }

                // Update the chart
                categoryChart.update();
            }

            // Sort transactions
            sortBySelect.addEventListener("change", function () {
                const sortBy = sortBySelect.value;

                let displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : transactions;

                switch (sortBy) {
                    case "date-asc":
                        displayTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
                        break;
                    case "date-desc":
                        displayTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                        break;
                    case "amount-asc":
                        displayTransactions.sort((a, b) => a.amount - b.amount);
                        break;
                    case "amount-desc":
                        displayTransactions.sort((a, b) => b.amount - a.amount);
                        break;
                    case "category":
                        displayTransactions.sort((a, b) => a.category.localeCompare(b.category));
                        break;
                    case "description":
                        displayTransactions.sort((a, b) => a.description.localeCompare(b.description));
                        break;
                    default:
                        break;
                }

                updateTransactionTable();
            });


            // Search transactions
            searchBtn.addEventListener("click", function () {
                const searchType = searchTypeSelect.value;

                if (searchType === "date") {
                    const fromDate = document.getElementById("search-date-from").value;
                    const toDate = document.getElementById("search-date-to").value;

                    if (!fromDate && !toDate) {
                        alert("Please enter at least one date for searching.");
                        return;
                    }

                    filteredTransactions = transactions.filter(transaction => {
                        if (fromDate && toDate) {
                            return transaction.date >= fromDate && transaction.date <= toDate;
                        } else if (fromDate) {
                            return transaction.date >= fromDate;
                        } else {
                            return transaction.date <= toDate;
                        }
                    });
                } else {
                    const category = document.getElementById("search-category").value;

                    if (!category) {
                        filteredTransactions = [];
                        updateTransactionTable();
                        return;
                    }

                    filteredTransactions = transactions.filter(transaction =>
                        transaction.category === category
                    );
                }

                updateTransactionTable();
            });

            // Reset search
            resetSearchBtn.addEventListener("click", function () {
                document.getElementById("search-date-from").value = "";
                document.getElementById("search-date-to").value = "";
                document.getElementById("search-category").value = "";
                filteredTransactions = [];
                updateTransactionTable();
            });

            // CSV file dropzone
            csvDropzone.addEventListener("click", function () {
                fileInput.click();
            });

            csvDropzone.addEventListener("dragover", function (e) {
                e.preventDefault();
                csvDropzone.classList.add("dragover");
            });

            csvDropzone.addEventListener("dragleave", function () {
                csvDropzone.classList.remove("dragover");
            });

            csvDropzone.addEventListener("drop", function (e) {
                e.preventDefault();
                csvDropzone.classList.remove("dragover");

                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                }
            });

            // Import CSV
            importCsvBtn.addEventListener("click", function () {
                const file = fileInput.files[0];
                if (!file) {
                    alert("Please select a CSV file.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    const csvData = e.target.result;
                    const lines = csvData.split("\n");

                    // Skip header row
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        const fields = line.split(",");
                        if (fields.length < 4) continue;

                        const transaction = {
                            date: fields[0],
                            description: fields[1],
                            category: fields[2],
                            amount: parseFloat(fields[3].replace(/[^-0-9.]/g, ""))
                        };
                        transaction.id = add(transaction);
                        transactions.push(transaction);
                    }

                    updateTransactionTable();
                    updateChart();
                    alert("CSV file imported successfully!");
                };

                reader.readAsText(file);
            });

            // Export CSV
            exportCsvBtn.addEventListener("click", function () {
                if (transactions.length === 0) {
                    alert("No transactions to export.");
                    return;
                }

                let csvContent = "data:text/csv;charset=utf-8,Date,Description,Category,Amount\n";

                transactions.forEach(transaction => {
                    const row = [
                        transaction.date,
                        transaction.description,
                        transaction.category,
                        transaction.amount.toFixed(2)
                    ].join(",");

                    csvContent += row + "\n";
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "transactions.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
            updateChart();
        });