import mysql from "mysql2/promise";

async function seedSkills() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "izar",
        password: "261426",
        database: "portofolio",
    });

    console.log("✅ Connected to MySQL\n");

    // Create skill_categories table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL,
      items JSON NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'skill_categories' created\n");

    // Check if data already exists
    const [rows] = await connection.execute(
        "SELECT id FROM skill_categories"
    );

    const defaultSkills = [
        { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"], sortOrder: 1 },
        { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs"], sortOrder: 2 },
        { category: "DevOps & Alat", items: ["Git", "Docker", "Vercel", "Linux", "Figma"], sortOrder: 3 },
    ];

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  Skill categories already exist. Skipping insertion...\n");
    } else {
        for (const skill of defaultSkills) {
            await connection.execute(
                `INSERT INTO skill_categories (category_name, items, sort_order) VALUES (?, ?, ?)`,
                [skill.category, JSON.stringify(skill.items), skill.sortOrder]
            );
        }
        console.log("✅ Initial 'skill_categories' data inserted\n");
    }

    await connection.end();
    process.exit(0);
}

seedSkills().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
