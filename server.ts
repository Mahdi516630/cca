import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "referee-manager-secret-key";

// Initialize Neon Postgres
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("CRITICAL: DATABASE_URL is missing in environment variables!");
}
const sql = neon(databaseUrl!);

// Initialize Database Tables
async function initDb() {
  if (!databaseUrl) return;
  
  try {
    console.log("Connecting to database...");
    
    // Test simple query
    await sql`SELECT 1`;
    console.log("Database connection established.");

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS referees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        createdAt TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        centralfee INTEGER DEFAULT 0,
        assistantfee INTEGER DEFAULT 0,
        fourthfee INTEGER DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS designations (
        id TEXT PRIMARY KEY,
        date TEXT,
        teama TEXT,
        teamb TEXT,
        matchnumber TEXT,
        starttime TEXT,
        endtime TEXT,
        categoryid TEXT REFERENCES categories(id),
        centralid TEXT REFERENCES referees(id),
        assistant1id TEXT REFERENCES referees(id),
        assistant2id TEXT REFERENCES referees(id),
        fourthid TEXT REFERENCES referees(id)
      );
    `;
    
    console.log("Tables verified/created successfully.");

    // Seed Users
    const seedUsers = [
      { email: "mahdiyacoubali318@gmail.com", password: "admin123" },
      { email: "mahdiyacoubali2004@gmail.com", password: "admin123" }
    ];
    
    for (const user of seedUsers) {
      const existing = await sql`SELECT * FROM users WHERE email = ${user.email}`;
      if (existing.length === 0) {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        await sql`INSERT INTO users (email, password) VALUES (${user.email}, ${hashedPassword})`;
        console.log("Seed user created: " + user.email);
      } else {
        // Optionnel: On s'assure que le mot de passe est bien admin123 pour ces comptes de test si le user insiste
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        await sql`UPDATE users SET password = ${hashedPassword} WHERE email = ${user.email}`;
        console.log("Seed user password reset: " + user.email);
      }
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

initDb();

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    await sql`INSERT INTO users (email, password) VALUES (${email}, ${hashedPassword})`;
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ error: "User already exists or error occurred" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { password } = req.body;
  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user: any = users[0];
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// --- REFEREES ROUTES ---
app.get("/api/referees", authenticateToken, async (req, res) => {
  try {
    const referees = await sql`SELECT * FROM referees ORDER BY name`;
    const mapped = referees.map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      createdAt: r.createdAt || r.createdat
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Error fetching referees" });
  }
});

app.post("/api/referees", authenticateToken, async (req, res) => {
  const { id, name, phone, createdAt } = req.body;
  try {
    await sql`INSERT INTO referees (id, name, phone, createdAt) VALUES (${id}, ${name}, ${phone}, ${createdAt})`;
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Error creating referee" });
  }
});

app.put("/api/referees/:id", authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  try {
    await sql`UPDATE referees SET name = ${name}, phone = ${phone} WHERE id = ${req.params.id}`;
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating referee" });
  }
});

app.delete("/api/referees/:id", authenticateToken, async (req, res) => {
  try {
    await sql`DELETE FROM referees WHERE id = ${req.params.id}`;
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting referee" });
  }
});

// --- CATEGORIES ROUTES ---
app.get("/api/categories", authenticateToken, async (req, res) => {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name`;
    const mapped = categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      centralFee: c.centralFee ?? c.centralfee ?? 0,
      assistantFee: c.assistantFee ?? c.assistantfee ?? 0,
      fourthFee: c.fourthFee ?? c.fourthfee ?? 0
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
});

app.post("/api/categories", authenticateToken, async (req, res) => {
  const { id, name, centralFee, assistantFee, fourthFee } = req.body;
  try {
    await sql`INSERT INTO categories (id, name, centralfee, assistantfee, fourthfee) VALUES (${id}, ${name}, ${centralFee}, ${assistantFee}, ${fourthFee})`;
    res.status(201).json({ id });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error creating category: " + (error instanceof Error ? error.message : String(error)) });
  }
});

app.delete("/api/categories/:id", authenticateToken, async (req, res) => {
  try {
    await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
});

app.put("/api/categories/:id", authenticateToken, async (req, res) => {
  const { name, centralFee, assistantFee, fourthFee } = req.body;
  try {
    await sql`
      UPDATE categories 
      SET name = ${name}, centralfee = ${centralFee}, assistantfee = ${assistantFee}, fourthfee = ${fourthFee} 
      WHERE id = ${req.params.id}
    `;
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating category" });
  }
});

// --- DESIGNATIONS ROUTES ---
app.get("/api/designations", authenticateToken, async (req, res) => {
  try {
    const designations = await sql`SELECT * FROM designations ORDER BY date DESC`;
    const mapped = designations.map((d: any) => ({
      id: d.id,
      date: d.date,
      teamA: d.teamA || d.teama,
      teamB: d.teamB || d.teamb,
      matchNumber: d.matchNumber || d.matchnumber,
      startTime: d.startTime || d.starttime,
      endTime: d.endTime || d.endtime,
      categoryId: d.categoryId || d.categoryid,
      centralId: d.centralId || d.centralid,
      assistant1Id: d.assistant1Id || d.assistant1id,
      assistant2Id: d.assistant2Id || d.assistant2id,
      fourthId: d.fourthId || d.fourthid
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Error fetching designations" });
  }
});

app.put("/api/designations/:id", authenticateToken, async (req, res) => {
  const { 
    date, teamA, teamB, matchNumber, startTime, endTime, 
    categoryId, centralId, assistant1Id, assistant2Id, fourthId 
  } = req.body;
  
  try {
    const cleanId = (val: any) => (val === "none" || !val) ? null : val;
    await sql`
      UPDATE designations 
      SET date = ${date || null}, teama = ${teamA || null}, teamb = ${teamB || null}, 
          matchnumber = ${matchNumber || null}, starttime = ${startTime || null}, endtime = ${endTime || null}, 
          categoryid = ${categoryId || null}, centralid = ${centralId || null}, 
          assistant1id = ${cleanId(assistant1Id)}, assistant2id = ${cleanId(assistant2Id)}, fourthid = ${cleanId(fourthId)}
      WHERE id = ${req.params.id}
    `;
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating designation" });
  }
});

app.post("/api/designations", authenticateToken, async (req, res) => {
  const { 
    id, date, teamA, teamB, matchNumber, startTime, endTime, 
    categoryId, centralId, assistant1Id, assistant2Id, fourthId 
  } = req.body;
  
  try {
    const cleanId = (val: any) => (val === "none" || !val) ? null : val;

    await sql`
      INSERT INTO designations (
        id, date, teama, teamb, matchnumber, starttime, endtime, 
        categoryid, centralid, assistant1id, assistant2id, fourthid
      )
      VALUES (
        ${id}, 
        ${date || null}, 
        ${teamA || null}, 
        ${teamB || null}, 
        ${matchNumber || null}, 
        ${startTime || null}, 
        ${endTime || null}, 
        ${categoryId || null}, 
        ${centralId || null}, 
        ${cleanId(assistant1Id)}, 
        ${cleanId(assistant2Id)}, 
        ${cleanId(fourthId)}
      )
    `;
    res.status(201).json({ id });
  } catch (error) {
    console.error("Error creating designation:", error);
    res.status(500).json({ error: "Error creating designation: " + (error instanceof Error ? error.message : String(error)) });
  }
});

app.delete("/api/designations/:id", authenticateToken, async (req, res) => {
  try {
    await sql`DELETE FROM designations WHERE id = ${req.params.id}`;
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting designation" });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
