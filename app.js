const express = require('express')
const app = express()
const { Server } = require('socket.io')
const cors = require('cors')
app.use(cors({
	origin: ['https://www.thecabindepot.com', 'https://www.thecabindepot.ca']
}))
const server = require('http').createServer(app)
const io = new Server(server)
const db = require("./db/db")
const nodemailer = require('nodemailer')
let all_entries_printed = null

app.use(express.static(__dirname))
app.get('/', async (req, res) => {
	res.sendFile(__dirname + "/projects/franchise/html/index.html")
})
app.get('/favicon.ico', async (req, res) => {
	res.sendFile(__dirname + "/favicon.ico")
})
app.get('/email', async (req, res) => {
	res.sendFile(__dirname + "/projects/franchise/html/email.html")
})

const eml_to_html = (text, email_address) => {
	if (email_address) {
		console.log("here")
		html = `<a href="mailto:${email_address}" style='color: #89c99e' target="_blank">${email_address}</a>`
		text = text.replace(email_address, html)
	} else {
		console.log("Here2")
	}
	return `<style>
				@import url("https://use.typekit.net/eub3bgp.css");
			</style>
			<div style='font-family: "futura-pt", sans-serif; background-color: #0064a2; color: white; margin: 0; padding: 50px;'>
				${text.replace(/(?:\r\n|\r|\n)/g, '<br>')}
				<img style='display: block; height: 80px; width: auto; margin-top: 30px;' 
					src='https://franchise.thecabindepot.ca/files/logo-transparent.png' />
			</div>` 
}

const eml_to_text = (text) => {
	return text.replace("<b>","").replace("</b>","")
}

async function insertEntry(fname, lname, phone, email, add1, where, why, comments, socket) {
	let message = "", success = true
	res = await db.insertEntry(fname, lname, phone, email, add1, where, why, comments)
	if (res === 0) {
		success = false
		message = "An error occurred"
	} else {
		var transporter = nodemailer.createTransport({
			host: "smtp-mail.outlook.com", 
			secureConnection: false, 
			port: 587, 
			auth: {
				user: "franchise@thecabindepot.com",
				pass: "kC|45a89dm}&"
			},
			tls: {
				ciphers:'SSLv3'
			}
		})
		let eml = `The franchise application form at <b>franchise.thecabindepot.ca</b> has received a new submission:\n\n` +
					`<b>First name:</b> ${fname}\n` +
					`<b>Last name:</b> ${lname}\n` +
					`<b>Phone:</b> ${phone}\n` +
					`<b>Email:</b> ${email}\n` +
					`<b>Address:</b> ${add1}\n` +
					`<b>Where:</b> ${where}\n` +
					`<b>Why:</b> ${why}\n` +
					`<b>Comments:</b> ${comments}\n`
		transporter.sendMail({
			from: 'franchise@thecabindepot.com',
			to: [
				'franchise@thecabindepot.com',
                                'gamal.ahmed@thecabindepot.com'
			],
			subject: 'New Franchise Form Entry',
			text: eml_to_text(eml),
			html: eml_to_html(eml, email),
		}, function(error, info){
			console.log(error ? error: 'Email sent. Responmse: ' + info.response)
		})
		eml = `Dear <b>${fname}</b>,\n
				Thanks for your interest in The Cabin Depot franchise. We've received your application and will review it within the next 10 business days.\n
				We'll contact you with next steps or if we need more information. If you have any questions, please feel free to reach out at franchise@thecabindepot.com.\n
				Thank you.
				-The Cabin Depot`
		transporter.sendMail({
			from: 'franchise@thecabindepot.com',
			to: email,
			subject: 'Your Cabin Depot Franchise Application',
			text: eml_to_text(eml),
			html: eml_to_html(eml, 'franchise@thecabindepot.com'),
		}, function(error, info){
			console.log(error ? error: 'Email sent: ' + info.response);
		})
	}
	socket.emit('insert_entry_return', [res, success, message])
}

io.on('connection', async (socket) => {
	if (all_entries_printed === null) {
		console.log("All Entries:")
		console.log(await db.getAllEntries())
		all_entries_printed = 1
	}
	socket.on('insert_entry', async (fname, lname, phone, email, add1, where, why, comments)=> {
		res = await insertEntry(fname, lname, phone, email, add1, where, why, comments, socket)
	})
})

// Local env port to 3000 & live env port to 5000
home_path = app.settings['views'].substring(0, 5)
server.listen(
	home_path === "/User" || home_path === "C:\\Us"
		? 3000
		: 5000,
	() => console.log(`App running!`)
)
