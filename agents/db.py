import sqlite3

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect("expenses.db")
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_phone TEXT,
    limit_amount REAL
);
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS Expense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    amount REAL,
    description TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES User(id)
);
''')

# Insert sample data
cursor.execute("INSERT INTO User (user_phone, limit_amount) VALUES (?, ?)", ("9876543210", 5000))
cursor.execute("INSERT INTO User (user_phone, limit_amount) VALUES (?, ?)", ("9123456789", 7000))

cursor.execute("INSERT INTO Expense (category, amount, description, user_id) VALUES (?, ?, ?, ?)", ("Food", 250, "Lunch", 1))
cursor.execute("INSERT INTO Expense (category, amount, description, user_id) VALUES (?, ?, ?, ?)", ("Transport", 100, "Bus fare", 1))
cursor.execute("INSERT INTO Expense (category, amount, description, user_id) VALUES (?, ?, ?, ?)", ("Groceries", 800, "Weekly shopping", 2))

conn.commit()

# Query data
cursor.execute("SELECT User.user_phone, Expense.category, Expense.amount, Expense.description FROM Expense JOIN User ON Expense.user_id = User.id")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
