# Todo Application

A simple and user-friendly Todo Application built with Node.js, Express, SQLite, and vanilla JavaScript. It helps users manage daily tasks, track progress, and stay organized through a clean web interface.

## Features

- **User Authentication** – Register and log in to your account securely.
- **Task Management** – Create, view, update, and delete tasks.
- **Task Status** – Track tasks based on their completion status.
- **Database Storage** – Store application data using SQLite.
- **Session Management** – Maintain user sessions during navigation.
- **Responsive Interface** – Simple and clean interface for easy interaction.
- **Password Security** – Hash passwords using bcrypt.
- **Backend Integration** – Handle application requests using Express.js.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite (better-sqlite3)
- **Authentication:** bcrypt
- **Session Management:** express-session

## Project Structure

```text
todo-app/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Git (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/AlauddinAshen/todo-app.git
```

### 2. Navigate to the Project Directory

```bash
cd todo-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

### 5. Open in Your Browser

Visit:

```text
http://localhost:3000
```

Check `server.js` for the configured port if the application uses a different one.

## Database

The application uses SQLite to store data locally. The database is managed using the `better-sqlite3` package.

## Future Improvements

- Add task search and filtering.
- Introduce task priorities and due dates.
- Add reminders and notifications.
- Improve mobile responsiveness.
- Deploy the application to a cloud hosting platform.

## License

This project is available for learning and personal use. Add a specific open-source license if you intend to distribute it under particular terms.

---

**Todo Application** — Organize your tasks, track your progress, and stay productive.
