const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const db = new Database("todo.db");

const PORT = 3005;

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
        created_at TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`).run();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "cognifyz-task-6-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

function logincheck(req, res, next) {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            msg: "Please login first"
        });
    }

    next();
}


// Register

app.post("/register", async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            msg: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            msg: "Password must contain at least 6 characters"
        });
    }

    const existingUser = db.prepare(
        "SELECT id FROM users WHERE email = ?"
    ).get(email);

    if (existingUser) {
        return res.status(409).json({
            success: false,
            msg: "Email already registered"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `).run(username, email, hashedPassword);

    res.status(201).json({
        success: true,
        msg: "User registered successfully",
        userId: result.lastInsertRowid
    });
});


// Login

app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            msg: "Enter all fields"
        });
    }

    const user = db.prepare(
        "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (!user) {
        return res.status(404).json({
            success: false,
            msg: "User not found"
        });
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            msg: "Invalid email or password"
        });
    }

    req.session.userId = user.id;

    res.json({
        success: true,
        msg: "Login successful"
    });
});


// Session

app.get("/session", (req, res) => {

    if (req.session.userId) {
        return res.json({
            success: true,
            userId: req.session.userId
        });
    }

    res.status(401).json({
        success: false,
        msg: "User not logged in"
    });
});


// Get user's todos

app.get("/todos", logincheck, (req, res) => {

    const todos = db.prepare(`
        SELECT id, task, completed, created_at
        FROM todos
        WHERE user_id = ?
        ORDER BY id DESC
    `).all(req.session.userId);

    res.json(todos);
});


// Create todo

app.post("/todos", logincheck, (req, res) => {

    const task = req.body.task;

    if (!task || task.trim() === "") {
        return res.status(400).json({
            success: false,
            msg: "Task cannot be empty"
        });
    }

    const date = new Date().toISOString();

    const result = db.prepare(`
        INSERT INTO todos
        (task, completed, created_at, user_id)
        VALUES (?, 0, ?, ?)
    `).run(
        task.trim(),
        date,
        req.session.userId
    );

    const todo = db.prepare(`
        SELECT id, task, completed, created_at
        FROM todos
        WHERE id = ? AND user_id = ?
    `).get(
        result.lastInsertRowid,
        req.session.userId
    );

    res.status(201).json(todo);
});


// Update completed status

app.patch("/todos/:id", logincheck, (req, res) => {

    const result = db.prepare(`
        UPDATE todos
        SET completed = 1 - completed
        WHERE id = ? AND user_id = ?
    `).run(
        req.params.id,
        req.session.userId
    );

    if (result.changes === 0) {
        return res.status(404).json({
            success: false,
            msg: "Todo not found"
        });
    }

    res.json({
        success: true,
        msg: "Todo updated successfully"
    });
});


// Edit todo

app.patch("/todos/:id/task", logincheck, (req, res) => {

    const task = req.body.task;

    if (!task || task.trim() === "") {
        return res.status(400).json({
            success: false,
            msg: "Task cannot be empty"
        });
    }

    const result = db.prepare(`
        UPDATE todos
        SET task = ?
        WHERE id = ? AND user_id = ?
    `).run(
        task.trim(),
        req.params.id,
        req.session.userId
    );

    if (result.changes === 0) {
        return res.status(404).json({
            success: false,
            msg: "Todo not found"
        });
    }

    res.json({
        success: true,
        msg: "Todo edited successfully"
    });
});


// Delete todo

app.delete("/todos/:id", logincheck, (req, res) => {

    const result = db.prepare(`
        DELETE FROM todos
        WHERE id = ? AND user_id = ?
    `).run(
        req.params.id,
        req.session.userId
    );

    if (result.changes === 0) {
        return res.status(404).json({
            success: false,
            msg: "Todo not found"
        });
    }

    res.json({
        success: true,
        msg: "Todo deleted successfully"
    });
});


// Logout

app.post("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                msg: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            msg: "Logged out successfully"
        });
    });
});


app.listen(PORT, () => {
    console.log(`Task 6 server running at http://localhost:${PORT}`);
});