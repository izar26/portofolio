import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function updateAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const adminEmail = "nizar.nizar.nizar.26@gmail.com";
    const adminPassword = "passwrod";
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Delete old admin if exists to prevent duplicates or just update the first row
    const [rows] = await connection.execute("SELECT id FROM admins LIMIT 1");
    if (Array.isArray(rows) && rows.length > 0) {
        await connection.execute(
            "UPDATE admins SET email = ?, password = ? WHERE id = ?",
            [adminEmail, hashedPassword, rows[0].id]
        );
        console.log("✅ Admin user updated in database");
    } else {
        await connection.execute(
            "INSERT INTO admins (email, password) VALUES (?, ?)",
            [adminEmail, hashedPassword]
        );
        console.log("✅ Admin user inserted in database");
    }

    await connection.end();
    process.exit(0);
}

updateAdmin().catch(console.error);
