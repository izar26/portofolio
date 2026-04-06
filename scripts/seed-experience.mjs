import mysql from "mysql2/promise";

async function seedExperience() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "izar",
        password: "261426",
        database: "portofolio",
    });

    console.log("✅ Connected to MySQL\n");

    // Create experiences table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS experiences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      period VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'experiences' created\n");

    // Check if data already exists
    const [rows] = await connection.execute(
        "SELECT id FROM experiences"
    );

    const defaultExperiences = [
        {
            role: "Senior Frontend Engineer",
            company: "TechNova Solutions",
            period: "2022 - Sekarang",
            description: "Memimpin pengembangan frontend dashboard SaaS modern. Membimbing pengembang junior dan menetapkan alur otomatisasi CI/CD pipelines.",
            sort_order: 1
        },
        {
            role: "Full Stack Developer",
            company: "Creative Digital Agency",
            period: "2019 - 2022",
            description: "Mengembangkan dan mengelola berbagai situs web klien menggunakan React, Node.js, dan MongoDB. Meningkatkan performa website klien hingga 40%.",
            sort_order: 2
        },
        {
            role: "Web Development Intern",
            company: "StartUp Inc",
            period: "2018 - 2019",
            description: "Membantu membuat komponen UI dan mengintegrasikan REST API. Mendapatkan pengalaman langsung dengan framework JavaScript modern.",
            sort_order: 3
        }
    ];

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  Experiences already exist. Skipping insertion...\n");
    } else {
        for (const exp of defaultExperiences) {
            await connection.execute(
                `INSERT INTO experiences (role, company, period, description, sort_order) VALUES (?, ?, ?, ?, ?)`,
                [exp.role, exp.company, exp.period, exp.description, exp.sort_order]
            );
        }
        console.log("✅ Initial 'experiences' data inserted\n");
    }

    await connection.end();
    process.exit(0);
}

seedExperience().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
