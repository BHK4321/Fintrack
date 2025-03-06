# Personal Finance Management Tool : FinTrack

FinTrack helps users manage their income, expenses, and transactions with budgeting, analytics, and financial insights.

## Key Features

### 1. Income and Expense Tracking
With the help of the Transaction Manager, users can easily track their expenses in different categories like rent, groceries, entertainment, and lifestyle.

Users can maintain a proper record of their expenses with dates and descriptions, which are stored and can be accessed anytime.

They can also track their monthly income, savings rate, and total balance directly from the dashboard.

This feature allows users to get an overall view of their expenditure, making it easier to plan their monthly budget.

### 2. Graphs and Visualizations
Provides graphical insights into income and expenses, helping users understand spending trends through interactive charts.

### 3. CSV Import/Export
This feature allows users to export their transaction records as a CSV file, which can be useful for tax filing.

Instead of manually entering data, users can also import transactions from a CSV file.

### 4. Transaction Management
Users can search, filter, and sort transactions by date, category, or amount for better financial organization.

Sorting options available:
- Date (Oldest first)
- Date (Newest first)
- Amount (Low to High)
- Amount (High to Low)

### 5. User-Friendly Dashboard
The dashboard provides an overview of:
- Total balance
- Monthly income and expenses
- Savings rate

It also includes a graphical expense breakdown using a pie chart and displays upcoming bill reminders to help users manage payments efficiently.

### 6. Data Security & Authentication
- Secure authentication using JWT.
- Complete Secure Signup , Signin system with forgot password -- reset password feature.
- Financial data is stored securely in MongoDB.
- Password hashing and encryption for sensitive information like account numbers.
- Automatic logout in case of unauthorized access for additional security (implemented in `allow.js` and `auth.js`).
- Google Sign-in is also implemented.

### 7. Notifications & Bill Reminders
Users can set up bill reminders and receive an email 6 hours before the deadline.

Upcoming bills are displayed on the dashboard, ensuring users never miss a payment.

### 8. Financial Goal Setting
Users can set savings goals by providing:
- Goal category
- Target date
- Initial deposit
- Target amount
- Description
  
The Front-end fetches the monthly-income , the recent transactions and other things related to the user which leads to better personalised guidance 
from the prompt generated for the user.

A generated prompt based on these inputs can be copied into the AI assistant for financial guidance.

## Additional Features

### 1. Split Bills
Users can split bills with friends by entering their email addresses, setting a deadline, and sending reminders.

A reminder email is also sent 6 hours before the deadline.

### 2. AI Assistant (Bottom Right Corner)
An AI assistant is available to help users navigate the website and understand its features.

### 3. Smart Budgeting (Goal Setting Page)
The AI assistant on the Goal Setting page provides personalized financial guidance, budgeting tips, and investment insights.

---

## Hosted Links

- **Front-end Deployment**  
  [https://bhk4321.github.io/Devbits/](https://bhk4321.github.io/Devbits/)

- **Back-end Deployment**  
  The pages may take time to load initially due to free-tier hosting. Render's free instances spin down with inactivity, causing delays of 50 seconds or more.  
  [https://my-backend-api-erp6.onrender.com](https://my-backend-api-erp6.onrender.com)

---

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js, Express.js (for the server)
- MongoDB (for database)

---

## API Endpoints

### User Management
- `POST /api/users`: Registers a new user
- `POST /api/signin`: Authenticates and logs in a user
- `POST /api/logout`: Logs out a user by clearing the access token cookie
- `GET /api/users/:email`: Retrieves a user's profile by email
- `PUT /api/update/:email`: Updates a user's profile information

### Password Management
- `POST /api/forgot-password`: Initiates the password reset process
- `POST /api/reset-password`: Resets a user's password

### Bill Management
- `POST /api/bills`: Creates a new bill
- `POST /api/schedule-reminder`: Schedules a reminder for a bill
- `GET /api/get-upcoming-bills`: Retrieves upcoming bills for a user

### Authentication
- `GET /auth/google`: Initiates Google OAuth authentication
- `GET /auth/google/callback`: Handles the Google OAuth callback
- `POST /api/google-signin`: Authenticates a user using Google sign-in
- `POST /api/jwt-auth`: Authenticates a user using a JWT token
- `GET /api/auth/check/:email`: Checks if a user is authorized

### Transaction Management
- `POST /api/transactions`: Creates a new transaction
- `GET /api/get-transactions`: Retrieves all transactions for a user
- `DELETE /api/transactions/:id`: Deletes a specific transaction
