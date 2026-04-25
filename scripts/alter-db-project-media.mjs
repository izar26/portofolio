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
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS project_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                media_type ENUM('image', 'youtube') NOT NULL,
                media_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created project_media table");
    } catch (err) {
        console.error("⚠️ Error creating project_media table:", err.message);
    }

    await connection.end();
    process.exit(0);
}

alterDb();
