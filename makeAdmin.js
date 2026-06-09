import db from "../config/sqlite.js";

const email = process.argv[2];

if (!email) {
  console.log("Please provide user email");
  console.log("Example: node src/scripts/makeAdmin.js test@gmail.com");
  process.exit(1);
}

const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

if (!user) {
  console.log("User not found");
  process.exit(1);
}

db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);

console.log(`${email} is now an admin`);