import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes." }
});

const app = express();
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP as it might interfere with Vite injection
}));
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "referee-manager-secret-key";

// Initialize Neon Postgres
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("CRITICAL: DATABASE_URL is missing in environment variables!");
} else {
  try {
    const url = new URL(databaseUrl);
    console.log(`Configured to connect to host: ${url.host} (Database: ${url.pathname.slice(1)})`);
  } catch (e) {
    console.error("DATABASE_URL is not a valid URL format");
  }
}
const sql = neon(databaseUrl!);

// Initialize Database Tables
async function initDb() {
  if (!databaseUrl) return;
  
  try {
    console.log("Testing database connection...");
    
    // Test simple query
    await sql`SELECT 1`;
    console.log("Database connection successful!");

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'pending'
      );
    `;

    // Ensure role column exists if table already existed
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'pending'`;
    } catch (e) {
      console.log("Role column likely already exists");
    }

    await sql`
      CREATE TABLE IF NOT EXISTS referees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        grade TEXT,
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
        terrain TEXT,
        assessor TEXT,
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
      { email: "mahdiyacoubali318@gmail.com", password: "admin123", role: "admin" },
      { email: "mahdiyacoubali2004@gmail.com", password: "admin123", role: "admin" }
    ];
    
    for (const user of seedUsers) {
      const email = user.email.toLowerCase();
      const existing = await sql`SELECT * FROM users WHERE LOWER(email) = ${email}`;
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      
      if (existing.length === 0) {
        await sql`INSERT INTO users (email, password, role) VALUES (${email}, ${hashedPassword}, ${user.role})`;
        console.log(`Seed user created: ${email}`);
      } else {
        await sql`UPDATE users SET password = ${hashedPassword}, role = ${user.role} WHERE LOWER(email) = ${email}`;
        console.log(`Seed user updated: ${email}`);
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

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient permissions" });
    }
    next();
  };
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Everyone registers as 'pending'
    await sql`INSERT INTO users (email, password, role) VALUES (${email}, ${hashedPassword}, 'pending')`;
    res.status(201).json({ message: "User registered. Waiting for admin approval." });
  } catch (error) {
    res.status(400).json({ error: "User already exists or error occurred" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { password } = req.body;
  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user: any = users[0];
    
    if (user && bcrypt.compareSync(password, user.password)) {
      if (user.role === 'pending') {
        return res.status(403).json({ error: "Your account is pending approval by an administrator." });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
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

app.get("/api/users", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const users = await sql`SELECT id, email, role FROM users ORDER BY email`;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.put("/api/users/:id/role", authenticateToken, authorize(['admin']), async (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'manager', 'audit', 'pending'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    await sql`UPDATE users SET role = ${role} WHERE id = ${Number(req.params.id)}`;
    res.json({ message: "Role updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating role" });
  }
});

app.delete("/api/users/:id", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userToDelete = await sql`SELECT email FROM users WHERE id = ${id}`;
    if (userToDelete[0]?.email === "mahdiyacoubali318@gmail.com") {
      return res.status(400).json({ error: "Cannot delete the super-admin" });
    }
    await sql`DELETE FROM users WHERE id = ${id}`;
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// --- REFEREES ROUTES ---
app.get("/api/referees", authenticateToken, authorize(['admin', 'manager', 'audit']), async (req, res) => {
  try {
    const referees = await sql`SELECT * FROM referees ORDER BY name`;
    const mapped = referees.map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      grade: r.grade,
      createdAt: r.createdAt || r.createdat
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Error fetching referees" });
  }
});

app.post("/api/referees", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  const { id, name, phone, grade, createdAt } = req.body;
  try {
    await sql`INSERT INTO referees (id, name, phone, grade, createdAt) VALUES (${id}, ${name}, ${phone}, ${grade}, ${createdAt})`;
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Error creating referee" });
  }
});

app.put("/api/referees/:id", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  const { name, phone, grade } = req.body;
  try {
    await sql`UPDATE referees SET name = ${name}, phone = ${phone}, grade = ${grade} WHERE id = ${req.params.id}`;
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating referee" });
  }
});

app.delete("/api/referees/:id", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  try {
    await sql`DELETE FROM referees WHERE id = ${req.params.id}`;
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting referee" });
  }
});

// --- CATEGORIES ROUTES ---
app.get("/api/categories", authenticateToken, authorize(['admin', 'manager', 'audit']), async (req, res) => {
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

app.post("/api/categories", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  const { id, name, centralFee, assistantFee, fourthFee } = req.body;
  try {
    await sql`INSERT INTO categories (id, name, centralfee, assistantfee, fourthfee) VALUES (${id}, ${name}, ${centralFee}, ${assistantFee}, ${fourthFee})`;
    res.status(201).json({ id });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error creating category: " + (error instanceof Error ? error.message : String(error)) });
  }
});

app.delete("/api/categories/:id", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  try {
    await sql`DELETE FROM categories WHERE id = ${req.params.id}`;
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
});

app.put("/api/categories/:id", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
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
app.get("/api/designations", authenticateToken, authorize(['admin', 'manager', 'audit']), async (req, res) => {
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
      terrain: d.terrain,
      assessor: d.assessor,
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

app.put("/api/designations/:id", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  const { 
    date, teamA, teamB, matchNumber, startTime, endTime, terrain, assessor,
    categoryId, centralId, assistant1Id, assistant2Id, fourthId 
  } = req.body;
  
  try {
    const cleanId = (val: any) => (val === "none" || !val) ? null : val;
    await sql`
      UPDATE designations 
      SET date = ${date || null}, teama = ${teamA || null}, teamb = ${teamB || null}, 
          matchnumber = ${matchNumber || null}, starttime = ${startTime || null}, endtime = ${endTime || null}, 
          terrain = ${terrain || null}, assessor = ${assessor || null},
          categoryid = ${categoryId || null}, centralid = ${centralId || null}, 
          assistant1id = ${cleanId(assistant1Id)}, assistant2id = ${cleanId(assistant2Id)}, fourthid = ${cleanId(fourthId)}
      WHERE id = ${req.params.id}
    `;
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating designation" });
  }
});

app.post("/api/designations", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
  const { 
    id, date, teamA, teamB, matchNumber, startTime, endTime, terrain, assessor,
    categoryId, centralId, assistant1Id, assistant2Id, fourthId 
  } = req.body;
  
  try {
    const cleanId = (val: any) => (val === "none" || !val) ? null : val;

    await sql`
      INSERT INTO designations (
        id, date, teama, teamb, matchnumber, starttime, endtime, terrain, assessor,
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
        ${terrain || null}, 
        ${assessor || null}, 
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

app.delete("/api/designations/:id", authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
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
