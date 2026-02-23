const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { db } = require("../database/database");

const router = express.Router();

/* ===================== FILE UPLOAD ===================== */

const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];

const settingsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(
        new Error("Invalid file type. Only PNG, JPG, JPEG, or PDF allowed.")
      );
    }

    if (file.fieldname === "logo") cb(null, "Logo" + ext);
    else if (file.fieldname === "bg_image") cb(null, "Background" + ext);
    else cb(null, Date.now() + ext);
  },
});

const settingsUpload = multer({ storage: settingsStorage });

/* ===================== DELETE OLD FILE ===================== */

const deleteOldFile = (fileUrl) => {
  if (!fileUrl) return;

  const filePath = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
  fs.unlink(filePath, (err) => {
    if (err) console.error("Delete error:", err.message);
    else console.log("Deleted:", filePath);
  });
};

/* ===================== GET SETTINGS ===================== */

router.get("/settings", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM company_settings WHERE id = 1"
    );

    if (rows.length === 0) {
      return res.json({
        company_name: "",
        short_term: "",
        address: "",
        header_color: "#ffffff",
        footer_text: "",
        footer_color: "#ffffff",
        logo_url: null,
        bg_image: null,
        main_button_color: "#ffffff",
        sub_button_color: "#ffffff",
        border_color: "#000000",
        stepper_color: "#000000",
        sidebar_button_color: "#000000",
        title_color: "#000000",
        subtitle_color: "#555555",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Fetch settings error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===================== SAVE SETTINGS ===================== */

router.post(
  "/settings",
  settingsUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        company_name,
        short_term,
        address,
        header_color,
        footer_text,
        footer_color,
        main_button_color,
        sub_button_color,
        border_color,
        stepper_color,
        sidebar_button_color,
        title_color,
        subtitle_color,
      } = req.body;

      const logoUrl = req.files?.logo
        ? `/uploads/${req.files.logo[0].filename}`
        : null;

      const bgImageUrl = req.files?.bg_image
        ? `/uploads/${req.files.bg_image[0].filename}`
        : null;

      const [rows] = await db.query(
        "SELECT * FROM company_settings WHERE id = 1"
      );

      /* ========= UPDATE ========= */
      if (rows.length > 0) {
        const oldLogo = rows[0].logo_url;
        const oldBg = rows[0].bg_image;

        let query = `
          UPDATE company_settings SET
            company_name=?,
            short_term=?,
            address=?,
            header_color=?,
            footer_text=?,
            footer_color=?,
            main_button_color=?,
            sub_button_color=?,
            border_color=?,
            stepper_color=?,
            sidebar_button_color=?,
            title_color=?,
            subtitle_color=?`;

        const params = [
          company_name || "",
          short_term || "",
          address || "",
          header_color || "#ffffff",
          footer_text || "",
          footer_color || "#ffffff",
          main_button_color || "#ffffff",
          sub_button_color || "#ffffff",
          border_color || "#000000",
          stepper_color || "#000000",
          sidebar_button_color || "#000000",
          title_color || "#000000",
          subtitle_color || "#555555",
        ];

        if (logoUrl) {
          query += ", logo_url=?";
          params.push(logoUrl);
        }

        if (bgImageUrl) {
          query += ", bg_image=?";
          params.push(bgImageUrl);
        }

        query += " WHERE id = 1";

        await db.query(query, params);

        if (logoUrl && oldLogo !== logoUrl) deleteOldFile(oldLogo);
        if (bgImageUrl && oldBg !== bgImageUrl) deleteOldFile(oldBg);

        return res.json({ success: true, message: "Settings updated" });
      }

      /* ========= INSERT ========= */
      const insertQuery = `
        INSERT INTO company_settings (
          company_name, short_term, address, header_color,
          footer_text, footer_color, logo_url, bg_image,
          main_button_color, sub_button_color, border_color,
          stepper_color, sidebar_button_color,
          title_color, subtitle_color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await db.query(insertQuery, [
        company_name || "",
        short_term || "",
        address || "",
        header_color || "#ffffff",
        footer_text || "",
        footer_color || "#ffffff",
        logoUrl,
        bgImageUrl,
        main_button_color || "#ffffff",
        sub_button_color || "#ffffff",
        border_color || "#000000",
        stepper_color || "#000000",
        sidebar_button_color || "#000000",
        title_color || "#000000",
        subtitle_color || "#555555",
      ]);

      res.json({ success: true, message: "Settings created" });
    } catch (err) {
      console.error("❌ Save settings error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ===================== GET BRANCHES ===================== */
router.get("/branches", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM company_branches ORDER BY branch_name"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch branches error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ===================== ADD BRANCH ===================== */
router.post("/branches", async (req, res) => {
  try {
    const { branch_name } = req.body;

    if (!branch_name) {
      return res.status(400).json({ message: "Branch name required" });
    }

    const [exists] = await db.query(
      "SELECT branch_id FROM company_branches WHERE branch_name = ?",
      [branch_name]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Branch already exists" });
    }

    await db.query(
      "INSERT INTO company_branches (branch_name) VALUES (?)",
      [branch_name]
    );

    res.json({ success: true, message: "Branch added" });
  } catch (err) {
    console.error("❌ Add branch error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ===================== UPDATE BRANCH ===================== */
router.put("/branches/:id", async (req, res) => {
  try {
    const { branch_name } = req.body;
    const { id } = req.params;

    await db.query(
      "UPDATE company_branches SET branch_name = ? WHERE branch_id = ?",
      [branch_name, id]
    );

    res.json({ success: true, message: "Branch updated" });
  } catch (err) {
    console.error("❌ Update branch error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ===================== DELETE BRANCH ===================== */
router.delete("/branches/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM company_branches WHERE branch_id = ?",
      [req.params.id]
    );

    res.json({ success: true, message: "Branch deleted" });
  } catch (err) {
    console.error("❌ Delete branch error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;