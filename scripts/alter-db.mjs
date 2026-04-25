import mysql from "mysql2/promise";

async function alterDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log("✅ Connected to MySQL");

    try {
        await connection.execute(`ALTER TABLE admins MODIFY totp_secret VARCHAR(255) NULL`);
        console.log("✅ Altered admins table (totp_secret is now NULLable)");
    } catch (err) {
        console.error("⚠️ Error altering admins table:", err.message);
    }

    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS disable_2fa_tokens (
                email VARCHAR(255) PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Created disable_2fa_tokens table");
    } catch (err) {
        console.error("⚠️ Error creating disable_2fa_tokens table:", err.message);
    }

    await connection.end();
    process.exit(0);
}

alterDb();
