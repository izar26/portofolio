import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";

async function seed() {
    // No need to generate TOTP secret during seed anymore

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log("✅ Connected to MySQL\n");

    // Create admins table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      totp_secret VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'admins' created\n");

    // Create password_resets table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      email VARCHAR(255) PRIMARY KEY,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'password_resets' created\n");

    // Check if admin already exists
    const adminEmail = "nizar.nizar.nizar.26@gmail.com";
    const adminPassword = "passwrod";
    
    const [rows] = await connection.execute(
        "SELECT id FROM admins WHERE email = ?",
        [adminEmail]
    );

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  Admin user already exists. Updating password only...\n");
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await connection.execute(
            "UPDATE admins SET password = ? WHERE email = ?",
            [hashedPassword, adminEmail]
        );
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await connection.execute(
            "INSERT INTO admins (email, password) VALUES (?, ?)",
            [adminEmail, hashedPassword]
        );
        console.log("✅ Admin user created\n");
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log(`   TIPS: Login menggunakan email: ${adminEmail}, password: ${adminPassword}`);
    console.log("   Anda dapat mengaktifkan Google Authenticator nanti");
    console.log("   melalui menu Dashboard > Keamanan.");
    console.log("═══════════════════════════════════════════════════════");

    await connection.end();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
