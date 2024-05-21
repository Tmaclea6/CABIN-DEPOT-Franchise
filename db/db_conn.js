const fs = require("fs")
const sqlite3 = require("sqlite3").verbose()
const filepath = "./db/form_entry.db"

function createDbConnection() {
    if (fs.existsSync(filepath)) {
        console.log("Connection with SQLite has been established")
        return new sqlite3.Database(filepath)
    } else {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error)
                return console.error(error.message)
            createTable(db)
        })
        console.log("Connection with SQLite has been established")
        return db
    }
}

function createTable(db) {
    db.exec(`
        CREATE TABLE form_entries (
            fname VARCHAR(50) NOT NULL,
            lname VARCHAR(50) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL,
            add1 VARCHAR(50) NOT NULL,
            add2 VARCHAR(50) NOT NULL,
            comments VARCHAR(250) NOT NULL
        )
    `)
}

module.exports = createDbConnection()