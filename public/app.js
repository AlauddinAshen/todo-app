const authSection = document.getElementById("authSection");
const todoSection = document.getElementById("todoSection");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const toggleAuth = document.getElementById("toggleAuth");
const authTitle = document.getElementById("authTitle");

const authMessage = document.getElementById("authMessage");
const todoMessage = document.getElementById("todoMessage");

const form = document.getElementById("formSubmit");
const logoutButton = document.getElementById("logoutButton");


function showAuthMessage(message) {
    authMessage.textContent = message;
}

function showTodoMessage(message) {
    todoMessage.textContent = message;
}


// Switch Login / Register

toggleAuth.addEventListener("click", () => {

    loginForm.classList.toggle("hidden");
    registerForm.classList.toggle("hidden");

    if (loginForm.classList.contains("hidden")) {
        authTitle.textContent = "Register";
        toggleAuth.textContent = "Already have an account? Login";
    } else {
        authTitle.textContent = "Login";
        toggleAuth.textContent = "Create an account";
    }

    showAuthMessage("");
});


// Register

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username =
        document.getElementById("registerUsername").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    if (!username || !email || !password) {
        showAuthMessage("All fields are required.");
        return;
    }

    if (password.length < 6) {
        showAuthMessage(
            "Password must contain at least 6 characters."
        );
        return;
    }

    const response = await fetch("/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    const data = await response.json();

    if (data.success) {

        showAuthMessage(
            "Registration successful. You can now login."
        );

        registerForm.reset();

        toggleAuth.click();

    } else {

        showAuthMessage(data.msg);
    }
});


// Login

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    if (!email || !password) {
        showAuthMessage("All fields are required.");
        return;
    }

    const response = await fetch("/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (data.success) {

        showAuthMessage("");

        showTodoSection();

    } else {

        showAuthMessage(data.msg);
    }
});


// Show Todo App

function showTodoSection() {

    authSection.classList.add("hidden");
    todoSection.classList.remove("hidden");

    loadTodos();
}


// Show Login

function showAuthSection() {

    authSection.classList.remove("hidden");
    todoSection.classList.add("hidden");
}


// Create Todo Element

function createTodoElement(todo) {

    const todoElement = document.createElement("div");
    todoElement.classList.add("todo-item");

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = todo.completed === 1;

    const taskText = document.createElement("span");

    taskText.textContent = todo.task;

    const editButton = document.createElement("button");

    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";


    // Update completed class state initially
if (todo.completed === 1) {
    todoElement.classList.add("completed");
}

checkbox.addEventListener("change", async () => {
    const response = await fetch(`/todos/${todo.id}`, { method: "PATCH" });
    const data = await response.json();

    if (data.success) {
        todoElement.classList.toggle("completed");
    } else {
        checkbox.checked = !checkbox.checked;
        showTodoMessage(data.msg);
    }
});

deleteButton.addEventListener("click", async () => {
    const response = await fetch(`/todos/${todo.id}`, { method: "DELETE" });
    const data = await response.json();

    if (data.success) {
        // Trigger CSS exit animation, then remove DOM element
        todoElement.classList.add("deleting");
        todoElement.addEventListener("animationend", () => {
            todoElement.remove();
        });
    } else {
        showTodoMessage(data.msg);
    }
});


    editButton.addEventListener("click", async () => {

        if (editButton.textContent === "Edit") {

            const input = document.createElement("input");

            input.value = taskText.textContent;

            input.classList.add("edit-input");

            taskText.replaceWith(input);

            editButton.textContent = "Save";

            input.focus();

        } else {

            const input =
                todoElement.querySelector(".edit-input");

            const task = input.value.trim();

            if (!task) {
                showTodoMessage("Task cannot be empty.");
                return;
            }

            const response = await fetch(
                `/todos/${todo.id}/task`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({ task })
                }
            );

            const data = await response.json();

            if (data.success) {

                taskText.textContent = task;

                input.replaceWith(taskText);

                editButton.textContent = "Edit";

            } else {

                showTodoMessage(data.msg);
            }
        }
    });


    todoElement.appendChild(checkbox);
    todoElement.appendChild(taskText);
    todoElement.appendChild(editButton);
    todoElement.appendChild(deleteButton);

    return todoElement;
}


// Load User Todos

async function loadTodos() {

    const response = await fetch("/todos");

    if (!response.ok) {
        showAuthSection();
        return;
    }

    const todos = await response.json();

    const todoContainer =
        document.getElementById("todos");

    todoContainer.innerHTML = "";

    todos.forEach(todo => {

        todoContainer.appendChild(
            createTodoElement(todo)
        );
    });
}


// Add Todo

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const input = document.getElementById("task");

    const task = input.value.trim();

    if (!task) {
        showTodoMessage("Task cannot be empty.");
        return;
    }

    const response = await fetch("/todos", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ task })
    });

    const data = await response.json();

    if (response.ok) {

        const todoElement =
            createTodoElement(data);

        document
            .getElementById("todos")
            .appendChild(todoElement);

        input.value = "";

    } else {

        showTodoMessage(data.msg);
    }
});


// Logout

logoutButton.addEventListener("click", async () => {

    const response = await fetch("/logout", {
        method: "POST"
    });

    const data = await response.json();

    if (data.success) {

        document.getElementById("todos").innerHTML = "";

        showAuthSection();

    } else {

        showTodoMessage(data.msg);
    }
});


// Check Session

async function checkSession() {

    const response = await fetch("/session");

    if (response.ok) {
        showTodoSection();
    } else {
        showAuthSection();
    }
}

checkSession();