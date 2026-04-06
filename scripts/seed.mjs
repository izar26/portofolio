import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";

async function seed() {
    // Generate TOTP secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const base32Secret = secret.base32;

    const totp = new OTPAuth.TOTP({
        issuer: "Portofolio Admin",
        label: "admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
    });

    const otpauthUri = totp.toString();

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "izar",
        password: "261426",
        database: "portofolio",
    });

    console.log("✅ Connected to MySQL\n");

    // Create admins table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      totp_secret VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'admins' created\n");

    // Check if admin already exists
    const [rows] = await connection.execute(
        "SELECT id FROM admins WHERE email = ?",
        ["admin"]
    );

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  Admin user already exists. Updating...\n");
        const hashedPassword = await bcrypt.hash("password", 12);
        await connection.execute(
            "UPDATE admins SET password = ?, totp_secret = ? WHERE email = ?",
            [hashedPassword, base32Secret, "admin"]
        );
    } else {
        const hashedPassword = await bcrypt.hash("password", 12);
        await connection.execute(
            "INSERT INTO admins (email, password, totp_secret) VALUES (?, ?, ?)",
            ["admin", hashedPassword, base32Secret]
        );
        console.log("✅ Admin user created\n");
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("   GOOGLE AUTHENTICATOR SETUP");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("   Secret Key (manual entry):");
    console.log(`   ${base32Secret}`);
    console.log("");
    console.log("   OTPAuth URI (for QR code generators):");
    console.log(`   ${otpauthUri}`);
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("   📱 Buka Google Authenticator App");
    console.log("   📝 Pilih 'Enter a setup key'");
    console.log("   🏷️  Account name: Portofolio Admin");
    console.log(`   🔑 Key: ${base32Secret}`);
    console.log("   ⏱️  Type: Time-based");
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("   ⚠️  PENTING: Simpan TOTP_SECRET di .env.local:");
    console.log(`   TOTP_SECRET=${base32Secret}`);
    console.log("");
    console.log("═══════════════════════════════════════════════════════");

    await connection.end();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
