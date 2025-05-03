import { prompt } from '../components/prompt.js';

document.addEventListener("DOMContentLoaded", function () {
    // Tab switching functionality
    const goalsTab = document.getElementById("goals-tab");
    const dashboardTab = document.getElementById("dashboard-tab");
    const goalsSection = document.getElementById("goals-section");
    const dashboardSection = document.getElementById("dashboard-section");

    goalsTab.addEventListener("click", function () {
        goalsTab.classList.add("active");
        dashboardTab.classList.remove("active");
        goalsSection.style.display = "block";
        dashboardSection.style.display = "none";
    });

    dashboardTab.addEventListener("click", function () {
        dashboardTab.classList.add("active");
        goalsTab.classList.remove("active");
        dashboardSection.style.display = "block";
        goalsSection.style.display = "none";
    });

    // Create first goal button
    const createFirstGoalBtn = document.getElementById("create-first-goal-btn");
    createFirstGoalBtn.addEventListener("click", function () {
        goalsTab.click();
    });

    // Helper function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Helper function to get remaining days
    function getRemainingDays(dateString) {
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    // Handle goal form submission
    const goalForm = document.getElementById("new-goal-form");
    goalForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get form values
        const goalName = document.getElementById("goal-name").value;
        const goalCategory = document.getElementById("goal-category").value;
        const goalAmount = document.getElementById("goal-amount").value;
        const goalDeadline = document.getElementById("goal-deadline").value;
        const goalDescription = document.getElementById("goal-description").value;
        const initialDeposit = document.getElementById("initial-deposit").value;

        // Generate a unique ID for the goal
        const goalId = 'goal-' + Date.now();

        // Create and save goal
        const goal = {
            id: goalId,
            name: goalName,
            category: goalCategory,
            amount: parseFloat(goalAmount),
            deadline: goalDeadline,
            description: goalDescription,
            initialDeposit: parseFloat(initialDeposit) || 0,
            currentAmount: parseFloat(initialDeposit) || 0,
            checkpoints: [], // Will be populated by the AI response
            created: new Date().toISOString()
        };

        // Show loading state
        const createGoalButton = goalForm.querySelector('button[type="submit"]');
        const originalButtonText = createGoalButton.textContent;
        createGoalButton.textContent = "Processing...";
        createGoalButton.disabled = true;

        // Get AI suggestions for checkpoints
        try {
            // Prepare the goal data for AI analysis
            const income = localStorage.getItem("monthlyincome") || "N/A";
            const goalSummary = `I want to save for ${goalName} with a target amount of ₹${goalAmount}. 
My current Monthly income is : ${income}.
I'd like to reach this goal by ${goalDeadline}. 
My initial savings deposit is ₹${initialDeposit}. 
Is this goal realistic, and what strategy would you recommend?`;

            // Get transaction summary if available
            const transactionSummary = await fetchTransactionSummary();
            const fullText = `${goalSummary}\n\n${transactionSummary}`;

            // This would normally call your actual API, but for demo we'll use mock data
            const response = await fetch(`https://my-backend-api-erp6.onrender.com/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: fullText }]
                    }]
                })
            });
            const data = await response.json();
            let reply = null;
            if (data.content && data.content.parts && data.content.parts.length > 0) {
                reply = data.content.parts[0].text;
                console.log("Generated reply:", reply);
                const regex = /\{([^}]+)\}/g;
                let match;
                const checkpoints = [];
                while ((match = regex.exec(reply)) !== null) {
                    checkpoints.push(match[1].trim());
                }
                console.log("Extracted checkpoints:", checkpoints);
                goal.checkpoints = checkpoints.map((text, index) => {
                    return {
                        id: `${goalId}-checkpoint-${index}`,
                        text: text,
                        completed: index === 0 && goal.initialDeposit > 0
                    };
                });

                // Save goals to localStorage
                const existingGoals = JSON.parse(localStorage.getItem('fintrack-goals') || '[]');
                existingGoals.push(goal);
                localStorage.setItem('fintrack-goals', JSON.stringify(existingGoals));

                // Add goal to dashboard
                createGoalBlock(goal);

                // Hide empty state if needed
                document.getElementById("empty-goals-state").style.display = "none";

                // Reset form
                goalForm.reset();

                // Switch to dashboard tab
                dashboardTab.click();
            }
        } catch (error) {
            console.error("Error creating goal:", error);
            alert("There was an error creating your goal. Please try again.");
        } finally {
            // Restore button state
            createGoalButton.textContent = originalButtonText;
            createGoalButton.disabled = false;
        }
    });

    // Function to create a goal block and add it to the dashboard
    function createGoalBlock(goal) {
        const goalBlock = document.createElement("div");
        goalBlock.className = "goal-block";
        goalBlock.id = goal.id;

        // Calculate progress percentage
        const progressPercentage = (goal.currentAmount / goal.amount) * 100;
        const remainingDays = getRemainingDays(goal.deadline);

        // Create HTML for the goal block
        goalBlock.innerHTML = `
            <div class="goal-header">
                <h3 class="goal-title">${goal.name}</h3>
                <span class="goal-category">${goal.category}</span>
            </div>
            <div class="goal-info">
                <div class="goal-amount">₹${goal.amount.toLocaleString('en-IN')}</div>
                <div class="goal-date">Due by ${formatDate(goal.deadline)}</div>
                ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-stats">
                    <span>₹${goal.currentAmount.toLocaleString('en-IN')} saved</span>
                    <span>${Math.round(progressPercentage)}% complete</span>
                </div>
                <div class="days-remaining">${remainingDays} days remaining</div>
            </div>
            <div class="checkpoints-container">
                <h4>Milestones:</h4>
                <div class="checkpoints-list">
                    ${goal.checkpoints.map((checkpoint, index) => `
                        <div class="checkpoint-item">
                            <input type="radio" id="${checkpoint.id}" name="${goal.id}-checkpoints" 
                                value="${index}" ${checkpoint.completed ? 'checked' : ''}>
                            <label for="${checkpoint.id}">${checkpoint.text}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add to dashboard
        const dashboardContainer = document.getElementById("goals-dashboard");
        dashboardContainer.insertBefore(goalBlock, document.getElementById("empty-goals-state"));

        // Add event listeners to checkpoint radios
        const checkpointRadios = goalBlock.querySelectorAll('input[type="radio"]');
        checkpointRadios.forEach((radio, index) => {
            radio.addEventListener('change', function () {
                // Update checkpoint status
                const goals = JSON.parse(localStorage.getItem('fintrack-goals') || '[]');
                const goalIndex = goals.findIndex(g => g.id === goal.id);

                if (goalIndex !== -1) {
                    // Mark this and all previous checkpoints as completed
                    for (let i = 0; i <= index; i++) {
                        goals[goalIndex].checkpoints[i].completed = true;
                    }

                    // Update current amount based on checkpoint
                    if (index === 0) {
                        // First checkpoint is creating a savings plan
                        goals[goalIndex].currentAmount = Math.max(goals[goalIndex].initialDeposit, goals[goalIndex].amount * 0.1);
                    } else if (index === 1) {
                        goals[goalIndex].currentAmount = goals[goalIndex].amount * 0.25;
                    } else if (index === 2) {
                        goals[goalIndex].currentAmount = goals[goalIndex].amount * 0.5;
                    } else if (index === 3) {
                        goals[goalIndex].currentAmount = goals[goalIndex].amount * 0.75;
                    } else if (index === 4) {
                        goals[goalIndex].currentAmount = goals[goalIndex].amount;
                        // Show celebration for final goal completion
                        showCelebration(goals[goalIndex]);
                        // Remove goal after celebration
                        setTimeout(() => {
                            goals.splice(goalIndex, 1);
                            localStorage.setItem('fintrack-goals', JSON.stringify(goals));
                            goalBlock.remove();

                            // Show empty state if needed
                            if (goals.length === 0) {
                                document.getElementById("empty-goals-state").style.display = "block";
                            }
                        }, 500);
                    }

                    // Update progress bar
                    const progressPercentage = (goals[goalIndex].currentAmount / goals[goalIndex].amount) * 100;
                    goalBlock.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
                    goalBlock.querySelector('.progress-stats span:first-child').textContent =
                        `₹${goals[goalIndex].currentAmount.toLocaleString('en-IN')} saved`;
                    goalBlock.querySelector('.progress-stats span:last-child').textContent =
                        `${Math.round(progressPercentage)}% complete`;

                    // Save updated goals
                    localStorage.setItem('fintrack-goals', JSON.stringify(goals));
                }
            });
        });
    }

    // Load existing goals from localStorage
    function loadGoals() {
        const goals = JSON.parse(localStorage.getItem('fintrack-goals') || '[]');

        if (goals.length > 0) {
            document.getElementById("empty-goals-state").style.display = "none";
            goals.forEach(goal => createGoalBlock(goal));
        }
    }

    // Show celebration when a goal is completed
    function showCelebration(goal) {
        const celebrationModal = document.getElementById("celebration-modal");
        celebrationModal.querySelector("h2").textContent = `Congratulations! 🎉`;
        celebrationModal.querySelector("p").textContent =
            `You've successfully completed your "${goal.name}" goal of ₹${goal.amount.toLocaleString('en-IN')}! Keep up the great work!`;

        celebrationModal.style.display = "flex";

        // Create confetti effect
        createConfetti();

        // Close button
        document.getElementById("close-celebration").addEventListener("click", function () {
            celebrationModal.style.display = "none";
            // Remove all confetti elements
            document.querySelectorAll('.confetti').forEach(el => el.remove());
        }, { once: true });
    }

    // Create confetti animation
    function createConfetti() {
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
            confetti.style.opacity = "1";

            // Animate fall
            confetti.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });

            document.body.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Function to fetch transaction summary
    async function fetchTransactionSummary() {
        try {
            const userEmail = localStorage.getItem("userEmail");
            // This would normally call your actual API, but for demo we'll return mock data
            const response = await fetch(`https://my-backend-api-erp6.onrender.com/api/get-transactions?userEmail=${encodeURIComponent(userEmail)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to fetch transactions.");
            const trans = await response.json();
            const transactions = trans.map(({ userEmail, ...t }) => ({ ...t, id: t._id }));
            let totalAmount = 0;
            let transactionList = "";
            const currentMonth = new Date().getMonth();

            transactions.forEach(transaction => {
                const transDate = new Date(transaction.date);
                if (transDate.getMonth() === currentMonth) {
                    totalAmount += transaction.amount;
                    transactionList += `📌 ${transaction.date.split("T")[0]} - ${transaction.category}: ₹${transaction.amount}\n\n`;
                }
            });

            return `Here's my transaction history for this month:\nTotal Spent: ₹${totalAmount}\n\n
            ${transactionList || "I didn't do any transactions this month till now."}\n\n
            ${prompt}`;
        } catch (error) {
            console.error("Error fetching transaction summary:", error);
            return "Transaction data is unavailable at the moment.";
        }
    }

    // Load existing goals on page load
    loadGoals();
});