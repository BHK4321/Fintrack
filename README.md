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

The pie chart is completely linked with the transactions provided by the user.

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

All the values are real-time (as provided by user).

### 6. Data Security & Authentication
- Secure authentication using JWT.
- Complete Secure Signup , Signin system with forgot password -- reset password feature with email.
- Financial data is stored securely in MongoDB.
- Password hashing and encryption for sensitive information like account numbers.
- Automatic logout in case of unauthorized access for additional security (implemented in `allow.js` and `auth.js`).
- Google Sign-in is also implemented.

### 7. Notifications & Bill Reminders
Users can set up bill reminders and receive an email 6 hours before the deadline.

The cron job searches for bills with deadlines 6 hours ahead from the current time , 
if it detects some bills it stores them and then sends reminders to each user using node-mailer.

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

The cron job searches for bills with deadlines 6 hours ahead from the current time , 
if it detects some bills it stores them and then sends reminders to each user using node-mailer.

A reminder email is also sent 6 hours before the deadline.

### 2. AI Assistant (Bottom Right Corner)

An AI assistant is available to help users navigate the website and understand its features.

### 3. Smart Budgeting (Goal Setting Page)

The AI assistant on the Goal Setting page provides personalized financial guidance, budgeting tips, and investment insights.

---

## Hosted Links

- **Front-end Deployment**
- Folder -- docs.
  
  [https://bhk4321.github.io/Devbits/](https://bhk4321.github.io/Fintrack/)

- **Back-end Deployment**
- Folder -- Backend
  
  The pages may take time to load initially due to free-tier hosting. Render's free instances spin down with inactivity, causing delays of 50 seconds or more.  
  [https://my-backend-api-erp6.onrender.com](https://my-backend-api-erp6.onrender.com)

---
## Relevant Images For Guidance :
- **Expensense Tracking**
  
![image](https://github.com/user-attachments/assets/9694f788-77fc-497c-941f-7f8d072af9c0)
![image (1)](https://github.com/user-attachments/assets/577926c4-4c12-43a6-8578-8a257105d57c)

- **Graphs and Visualization**

![image (2)](https://github.com/user-attachments/assets/8dcbb1e5-5141-47fd-9aea-a95afdc245a4)

- **CSV Import/Export**

![image (3)](https://github.com/user-attachments/assets/d3b9ce18-a478-423b-8773-ca3e8f56051a)

- **search, filter, and sort transactions**

![image (4)](https://github.com/user-attachments/assets/9533bff4-b864-4a89-b8f1-684382dd870b)


![image (5)](https://github.com/user-attachments/assets/3cd55ded-62f0-4e21-a362-5881ac5f6d5c)

- **Dashboard**

![image (6)](https://github.com/user-attachments/assets/27b4cd0b-741c-4f33-a808-e5dd607e57d5)

- **Notifications & Bill Reminders**
  
![image (7)](https://github.com/user-attachments/assets/675782a4-c96e-4580-99c4-dce6990b5249)

![image (10)](https://github.com/user-attachments/assets/0facf4da-19e3-4834-9103-9e2557e64486)


- **Financial Goal Setting**

  ![image (9)](https://github.com/user-attachments/assets/d2640b65-87f6-4844-904f-8161351a9012)

- **Split Bills**

 
  ![image (11)](https://github.com/user-attachments/assets/1cd83e3b-3fb4-4d9d-b3e4-3e2e4b958f88)


![image (12)](https://github.com/user-attachments/assets/250308c3-9e61-428a-a591-36172c5e4b9e)


- **AI ASSISTANT**

  
  ![image (13)](https://github.com/user-attachments/assets/907cd9d3-4b38-49cb-b7d9-49d144699424)
  

  ![image (14)](https://github.com/user-attachments/assets/01b398e8-eec2-4000-a936-c22cf42e9048)

- **Smart Budgeting with AI**
 
![image (15)](https://github.com/user-attachments/assets/e7683b0f-6805-4cc5-bcab-96798142f657)

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
