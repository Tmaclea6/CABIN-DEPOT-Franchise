const db_conn = require("./db_conn")

async function _insertEntry(fname, lname, phone, email, add1, add2, comments) {
    return new Promise((resolve, reject) => {
        console.log(fname)
        db_conn.run(
            `INSERT INTO form_entries (fname, lname, phone, email, add1, add2, comments) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fname, lname, phone, email, add1, add2, comments],
            (err) => {
                if (err)
                    reject(err)
                else {
                    console.log(`Inserted a row.`)
                    resolve()
                }
            }
        )
    })
}

async function _getAllUsers() {
    return new Promise((resolve, reject) => {
        db_conn.all(
            `SELECT * FROM form_entries`,
            (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            }
        )
    })
}

module.exports = {
    insertEntry: async function insertEntry(fname, lname, phone, email, add1, add2, comments) {
        try {
            await _insertEntry(fname, lname, phone, email, add1, add2, comments)
        } catch (e) {
            console.log("Error caught =>" + e)
            return 0
        }
        return 1
    },

    getAllEntries: async function getAllEntries() {
        all_entries = null
        try {
            all_entries = (await _getAllUsers())
        } catch (err) {
            console.log(`Caught error. ${err}`)
        }
        return all_entries
    }
}