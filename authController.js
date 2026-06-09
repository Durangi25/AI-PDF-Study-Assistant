import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/sqlite.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// REGISTER USER
export const registerUser = (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db
      .prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
      )
      .run(name, email, hashedPassword, "user");

    const newUser = db
      .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
      .get(result.lastInsertRowid);

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// LOGIN USER
export const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// GET LOGGED-IN USER
export const getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};