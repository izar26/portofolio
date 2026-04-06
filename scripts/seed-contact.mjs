import mysql from "mysql2/promise";

async function seedContact() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "izar",
        password: "261426",
        database: "portofolio",
    });

    console.log("✅ Connected to MySQL\n");

    // Create contact_settings table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS contact_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'contact_settings' created\n");

    // Create messages table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'messages' created\n");

    // Check if contact settings data already exists
    const [rows] = await connection.execute(
        "SELECT id FROM contact_settings"
    );

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  Contact settings already exist. Skipping insertion...\n");
    } else {
        await connection.execute(
            `INSERT INTO contact_settings (email, phone, location) VALUES (?, ?, ?)`,
            ["nizar@example.com", "+62 812 3456 7890", "Bandung, Indonesia"]
        );
        console.log("✅ Initial 'contact_settings' data inserted\n");
    }

    await connection.end();
    process.exit(0);
}

seedContact().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
