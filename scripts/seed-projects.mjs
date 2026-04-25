import mysql from "mysql2/promise";

async function seedProjects() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log("✅ Connected to MySQL\n");

    // Create projects table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      tags JSON NOT NULL,
      live_url VARCHAR(500),
      github_url VARCHAR(500),
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
    console.log("✅ Table 'projects' created\n");

    // Check if data already exists
    const [rows] = await connection.execute(
        "SELECT id FROM projects"
    );

    const defaultProjects = [
        {
            title: "Platform E-Commerce",
            description: "Solusi e-commerce skala penuh dengan inventaris waktu nyata, pembayaran aman via Stripe, dan dashboard admin yang intuitif.",
            image_url: "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=800",
            tags: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
            live_url: "#",
            github_url: "#",
            sort_order: 1
        },
        {
            title: "Asisten Penulis AI",
            description: "Aplikasi SaaS yang menggunakan model OpenAI untuk membantu pengguna menghasilkan salinan berkualitas tinggi, postingan blog, dan materi pemasaran secara instan.",
            image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
            tags: ["React", "Express", "OpenAI API", "MongoDB", "Framer Motion"],
            live_url: "#",
            github_url: "#",
            sort_order: 2
        }
    ];

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  Projects already exist. Skipping insertion...\n");
    } else {
        for (const project of defaultProjects) {
            await connection.execute(
                `INSERT INTO projects (title, description, image_url, tags, live_url, github_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [project.title, project.description, project.image_url, JSON.stringify(project.tags), project.live_url, project.github_url, project.sort_order]
            );
        }
        console.log("✅ Initial 'projects' data inserted\n");
    }

    await connection.end();
    process.exit(0);
}

seedProjects().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
