/*
============================================================
 DIGITAL VILLAGE ADMINISTRATION SYSTEM
============================================================

 ADMIN
   POST /login
   GET  /admin-login
   GET  /dashboard

 USER
   POST /user-login
   GET  /user-login
   GET  /user-dashboard

 ADMIN TABLE API
   GET  /api/admin/table/:table
   POST /api/admin/table/:table
   PUT  /api/admin/table/:table/:id
   DELETE /api/admin/table/:table/:id

 TABLES
   citizens
   complaints
   schemes
   birth_records
   death_records
   tax_records
   certificates

============================================================
*/

"use strict";


/* =========================================================
   IMPORT PACKAGES
========================================================= */

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

require("dotenv").config();


/* =========================================================
   CREATE APP
========================================================= */

const app = express();


/* =========================================================
   PORT
========================================================= */

const PORT = Number(process.env.PORT) || 3000;


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   STATIC PUBLIC FOLDER
========================================================= */

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* =========================================================
   MYSQL CONNECTION POOL
========================================================= */

const db = mysql.createPool({

    host:
        process.env.DB_HOST || "localhost",

    user:
        process.env.DB_USER || "root",

    password:
        process.env.DB_PASSWORD || "",

    database:
        process.env.DB_NAME || "digital_village",

    waitForConnections:
        true,

    connectionLimit:
        10,

    queueLimit:
        0

});


/* =========================================================
   ALLOWED ADMIN & USER TABLES & RESOLUTION
========================================================= */

const allowedTables = [
    "citizens",
    "complaints",
    "schemes",
    "birth_records",
    "births",
    "death_records",
    "deaths",
    "tax_records",
    "taxes",
    "certificates",
    "payments"
];

const tableAliasMap = {
    "birth_records": "births",
    "death_records": "deaths",
    "tax_records": "taxes"
};

async function resolveTableName(table) {
    if (!table) return table;
    const directTarget = tableAliasMap[table] || table;
    try {
        const [rows] = await db.query("SHOW TABLES LIKE ?", [directTarget]);
        if (rows && rows.length > 0) {
            return directTarget;
        }
    } catch (e) { }

    // Check if the original name exists directly
    try {
        const [rows] = await db.query("SHOW TABLES LIKE ?", [table]);
        if (rows && rows.length > 0) {
            return table;
        }
    } catch (e) { }

    return directTarget;
}


/* =========================================================
   TEST MYSQL CONNECTION
========================================================= */

async function testDatabase() {

    try {

        const connection =
            await db.getConnection();

        console.log("");
        console.log(
            "=================================================="
        );

        console.log(
            "✅ MYSQL CONNECTED SUCCESSFULLY"
        );

        console.log(
            "Database:",
            process.env.DB_NAME || "digital_village"
        );

        console.log(
            "=================================================="
        );

        // Ensure payments table exists
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100),
                    service_name VARCHAR(150),
                    amount DECIMAL(10,2),
                    razorpay_order_id VARCHAR(100),
                    razorpay_payment_id VARCHAR(100),
                    payment_status VARCHAR(50),
                    payment_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("✅ PAYMENTS TABLE VERIFIED / INITIALIZED");
        } catch (tableErr) {
            console.log("Payments table init note:", tableErr.message);
        }

        connection.release();

    }

    catch (error) {

        console.error("");
        console.error(
            "❌ MYSQL CONNECTION FAILED"
        );

        console.error(
            "Error:",
            error.message
        );

        console.error("");

    }

}

testDatabase();


/* =========================================================
   HOME PAGE
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


/* =========================================================
   ADMIN LOGIN
=========================================================

 POST /login

 {
    "username": "admin",
    "password": "admin123"
 }

========================================================= */

app.post(
    "/login",
    async (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
                ).trim();

            const password =
                String(
                    req.body.password || ""
                );


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required."

                });

            }


            console.log(
                "🛡️ Admin login attempt:",
                username
            );


            /* -----------------------------------------
               FIND ADMIN
            ----------------------------------------- */

            const [rows] =
                await db.execute(

                    `
                    SELECT *
                    FROM admin
                    WHERE username = ?
                    LIMIT 1
                    `,

                    [username]

                );


            if (
                rows.length === 0
            ) {

                console.log(
                    "❌ Admin not found:",
                    username
                );

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }


            const admin =
                rows[0];


            /* -----------------------------------------
               PASSWORD
            ----------------------------------------- */

            if (
                String(admin.password) !==
                password
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }


            /* -----------------------------------------
               STATUS
            ----------------------------------------- */

            if (
                admin.status &&
                String(admin.status)
                    .toLowerCase() !==
                "active"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Admin account is inactive."

                });

            }


            console.log(
                "✅ Admin login successful:",
                username
            );


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            return res.json({

                success: true,

                message:
                    "Admin login successful.",

                user: {

                    id:
                        admin.id || null,

                    username:
                        admin.username,

                    full_name:
                        admin.full_name ||
                        admin.name ||
                        "Village Administrator",

                    email:
                        admin.email || "",

                    mobile:
                        admin.mobile || "",

                    role:
                        admin.role || "admin"

                }

            });

        }

        catch (error) {

            console.error("");
            console.error(
                "❌ ADMIN LOGIN DATABASE ERROR"
            );

            console.error(
                error.message
            );


            return res.status(500).json({

                success: false,

                message:
                    "Admin login database error.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   USER LOGIN
=========================================================

 POST /user-login

 {
    "mobile": "9876543210",
    "password": "user123"
 }

========================================================= */

app.post(
    "/user-login",
    async (req, res) => {

        try {

            const mobile =
                String(
                    req.body.mobile || ""
                ).trim();

            const password =
                String(
                    req.body.password || ""
                );


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !mobile ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Mobile number and password are required."

                });

            }


            console.log(
                "👤 User login attempt:",
                mobile
            );


            /* -----------------------------------------
               FIND USER IN CITIZENS TABLE OR USERS TABLE
            ----------------------------------------- */

            let user = null;
            let citizenRows = [];

            try {
                const [cRows] = await db.execute(
                    `
                    SELECT *
                    FROM citizens
                    WHERE mobile = ?
                    LIMIT 1
                    `,
                    [mobile]
                );
                citizenRows = cRows;
            } catch (e) {
                console.log("Citizens lookup notice:", e.message);
            }

            if (citizenRows && citizenRows.length > 0) {
                user = citizenRows[0];
            } else {
                try {
                    const [uRows] = await db.execute(
                        `
                        SELECT *
                        FROM users
                        WHERE username = ?
                        LIMIT 1
                        `,
                        [mobile]
                    );
                    if (uRows && uRows.length > 0) {
                        user = uRows[0];
                    }
                } catch (e) {
                    console.log("Users lookup notice:", e.message);
                }
            }

            /* -----------------------------------------
               ANY 10-DIGIT NUMBER: LOGIN WITHOUT ADDING TO DATABASE
            ----------------------------------------- */

            if (!user) {
                const defaultName = "Citizen " + mobile.slice(-4);
                user = {
                    id: null,
                    name: defaultName,
                    full_name: defaultName,
                    mobile: mobile,
                    password: password,
                    age: 25,
                    gender: "Citizen",
                    address: "Village Resident",
                    role: "user"
                };
                console.log("✅ User logged in with 10-digit mobile (without adding to database):", mobile);
            }

            console.log(
                "✅ User login successful:",
                mobile
            );

            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            return res.json({
                success: true,
                message: "User login successful.",
                user: {
                    id: user.id || null,
                    mobile: user.mobile || mobile,
                    name: user.name || user.full_name || user.username || ("Citizen " + mobile.slice(-4)),
                    full_name: user.full_name || user.name || user.username || ("Citizen " + mobile.slice(-4)),
                    email: user.email || "",
                    address: user.address || "Village Resident",
                    gender: user.gender || "Citizen",
                    age: user.age || 25,
                    role: "user"
                }
            });

        }

        catch (error) {

            console.error("");
            console.error(
                "❌ USER LOGIN DATABASE ERROR"
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "SQL State:",
                error.sqlState
            );


            return res.status(500).json({

                success: false,

                message:
                    "User login database error.",

                error:
                    error.message,

                code:
                    error.code || null

            });

        }

    }
);


/* =========================================================
   ADMIN LOGIN PAGE
========================================================= */

app.get(
    "/admin-login",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin-login.html"
            )
        );

    }
);


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

app.get(
    "/dashboard",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "dashboard.html"
            )
        );

    }
);


/* =========================================================
   USER LOGIN PAGE
========================================================= */

app.get(
    "/user-login",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "user-login.html"
            )
        );

    }
);


/* =========================================================
   USER DASHBOARD
========================================================= */

app.get(
    "/user-dashboard",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "user-dashboard.html"
            )
        );

    }
);


/* =========================================================
   GET TABLE COLUMNS
========================================================= */

async function getTableColumns(tableName) {

    const [rows] =
        await db.query(
            `SHOW COLUMNS FROM \`${tableName}\``
        );

    return rows.map(
        row => row.Field
    );

}


/* =========================================================
   GET ADMIN & USER TABLE DATA
========================================================= */

app.get(
    "/api/admin/table/:table",
    async (req, res) => {

        try {

            const table =
                req.params.table;

            if (
                !allowedTables.includes(table)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid table name."

                });

            }

            const resolvedTable =
                await resolveTableName(table);

            const columns =
                await getTableColumns(
                    resolvedTable
                );

            let orderQuery = "";

            if (columns.includes("id")) {
                orderQuery = " ORDER BY id ASC";
            } else if (columns.length > 0) {
                orderQuery = ` ORDER BY \`${columns[0]}\` ASC`;
            }

            const [rows] =
                await db.query(

                    `
                    SELECT *
                    FROM \`${resolvedTable}\`
                    ${orderQuery}
                    `

                );

            return res.json({

                success: true,

                table:
                    table,

                columns:
                    columns,

                rows:
                    rows

            });

        }

        catch (error) {

            console.error(
                "❌ GET TABLE ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load table.",

                error:
                    error.message

            });

        }

    }
);

// Allow user-specific route alias for table reading in ascending order
app.get(
    "/api/user/table/:table",
    async (req, res) => {
        try {
            const table = req.params.table;
            if (!allowedTables.includes(table)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid table name."
                });
            }
            const resolvedTable = await resolveTableName(table);
            const columns = await getTableColumns(resolvedTable);
            let orderQuery = columns.includes("id") ? " ORDER BY id ASC" : (columns.length > 0 ? ` ORDER BY \`${columns[0]}\` ASC` : "");
            const [rows] = await db.query(`SELECT * FROM \`${resolvedTable}\`${orderQuery}`);
            return res.json({
                success: true,
                table: table,
                columns: columns,
                rows: rows
            });
        } catch (error) {
            console.error("❌ USER GET TABLE ERROR:", error.message);
            return res.status(500).json({
                success: false,
                message: "Unable to load table.",
                error: error.message
            });
        }
    }
);


/* =========================================================
   INSERT RECORD
========================================================= */

app.post(
    "/api/admin/table/:table",
    async (req, res) => {

        try {

            const table =
                req.params.table;

            if (
                !allowedTables.includes(table)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid table name."

                });

            }

            const resolvedTable =
                await resolveTableName(table);

            const columns =
                await getTableColumns(
                    resolvedTable
                );

            const input =
                req.body || {};

            const insertColumns =
                Object.keys(input)
                    .filter(
                        column =>
                            columns.includes(column)
                    )
                    .filter(
                        column =>
                            column.toLowerCase() !== "id"
                    );

            if (
                insertColumns.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No valid fields provided."

                });

            }

            const values =
                insertColumns.map(
                    column => {

                        const value =
                            input[column];

                        return value === ""
                            ? null
                            : value;

                    }
                );

            const placeholders =
                insertColumns
                    .map(
                        () => "?"
                    )
                    .join(", ");

            const columnSQL =
                insertColumns
                    .map(
                        column =>
                            `\`${column}\``
                    )
                    .join(", ");

            const sql = `

                INSERT INTO \`${resolvedTable}\`

                (${columnSQL})

                VALUES
                (${placeholders})

            `;

            const [result] =
                await db.execute(
                    sql,
                    values
                );

            return res.json({

                success: true,

                message:
                    "Record inserted successfully.",

                id:
                    result.insertId

            });

        }

        catch (error) {

            console.error(
                "❌ INSERT ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to insert record.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   UPDATE RECORD
========================================================= */

app.put(
    "/api/admin/table/:table/:id",
    async (req, res) => {

        try {

            const table =
                req.params.table;

            const id =
                req.params.id;

            if (
                !allowedTables.includes(table)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid table name."

                });

            }

            const resolvedTable =
                await resolveTableName(table);

            const columns =
                await getTableColumns(
                    resolvedTable
                );

            if (
                !columns.includes("id")
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This table does not have an id column."

                });

            }

            const input =
                req.body || {};

            const updateColumns =
                Object.keys(input)
                    .filter(
                        column =>
                            columns.includes(column)
                    )
                    .filter(
                        column =>
                            column.toLowerCase() !== "id"
                    );

            if (
                updateColumns.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No valid fields provided."

                });

            }

            const setSQL =
                updateColumns
                    .map(
                        column =>
                            `\`${column}\` = ?`
                    )
                    .join(", ");

            const values =
                updateColumns.map(
                    column => {

                        const value =
                            input[column];

                        return value === ""
                            ? null
                            : value;

                    }
                );

            values.push(id);

            const sql = `

                UPDATE \`${resolvedTable}\`

                SET ${setSQL}

                WHERE id = ?

            `;

            const [result] =
                await db.execute(
                    sql,
                    values
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Record not found."

                });

            }

            return res.json({

                success: true,

                message:
                    "Record updated successfully."

            });

        }

        catch (error) {

            console.error(
                "❌ UPDATE ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update record.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   DELETE RECORD
========================================================= */

app.delete(
    "/api/admin/table/:table/:id",
    async (req, res) => {

        try {

            const table =
                req.params.table;

            const id =
                req.params.id;

            if (
                !allowedTables.includes(table)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid table name."

                });

            }

            const resolvedTable =
                await resolveTableName(table);

            const columns =
                await getTableColumns(
                    resolvedTable
                );

            if (
                !columns.includes("id")
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This table does not have an id column."

                });

            }

            const [result] =
                await db.execute(

                    `
                    DELETE FROM \`${resolvedTable}\`
                    WHERE id = ?
                    `,

                    [id]

                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Record not found."

                });

            }

            return res.json({

                success: true,

                message:
                    "Record deleted successfully."

            });

        }

        catch (error) {

            console.error(
                "❌ DELETE ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete record.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   DASHBOARD STATISTICS (LIVE DATABASE COUNTS)
========================================================= */

app.get(
    "/api/dashboard-stats",
    async (req, res) => {

        try {

            const statistics = {
                citizens: 0,
                complaints: 0,
                schemes: 0,
                certificates: 0,
                birth_records: 0,
                births: 0,
                death_records: 0,
                deaths: 0,
                tax_records: 0,
                taxes: 0,
                payments: 0
            };

            const queryMap = {
                citizens: "citizens",
                complaints: "complaints",
                schemes: "schemes",
                certificates: "certificates",
                birth_records: "births",
                death_records: "deaths",
                tax_records: "taxes",
                payments: "payments"
            };

            for (const [key, rawTable] of Object.entries(queryMap)) {
                try {
                    const resolvedTable = await resolveTableName(rawTable);
                    const [rows] = await db.query(
                        `SELECT COUNT(*) AS total FROM \`${resolvedTable}\``
                    );
                    const total = Number(rows[0]?.total || 0);
                    statistics[key] = total;
                    statistics[resolvedTable] = total;
                } catch (error) {
                    console.log(`Live count notice for ${key}:`, error.message);
                }
            }

            return res.json({
                success: true,
                citizens: statistics.citizens,
                complaints: statistics.complaints,
                schemes: statistics.schemes,
                certificates: statistics.certificates,
                birth_records: statistics.birth_records || statistics.births || 0,
                births: statistics.births || statistics.birth_records || 0,
                death_records: statistics.death_records || statistics.deaths || 0,
                deaths: statistics.deaths || statistics.death_records || 0,
                tax_records: statistics.tax_records || statistics.taxes || 0,
                taxes: statistics.taxes || statistics.tax_records || 0,
                payments: statistics.payments || 0
            });

        }

        catch (error) {

            console.error(
                "❌ DASHBOARD STATISTICS ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load live dashboard statistics.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   UPI PAYMENT RECORDING (₹1 TO 8760114592)
========================================================= */

app.post(
    "/api/payment/upi-record",
    async (req, res) => {
        try {
            const mobile = String(req.body.mobile || "8760114592").trim();
            const citizenName = String(req.body.citizen_name || "Village Citizen").trim();
            const amount = Number(req.body.amount) || 1.00;
            const taxType = String(req.body.tax_type || "UPI Village Service Fee").trim();
            const upiId = String(req.body.upi_id || "8760114592@upi").trim();
            const transactionRef = String(req.body.transaction_ref || ("UPI" + Date.now())).trim();
            const today = new Date().toISOString().slice(0, 10);

            let paymentId = null;

            // 1. Record into taxes table
            try {
                const [taxRes] = await db.execute(
                    `
                    INSERT INTO taxes (citizen_name, tax_type, amount, payment_date)
                    VALUES (?, ?, ?, ?)
                    `,
                    [citizenName, taxType, amount, today]
                );
                paymentId = taxRes.insertId;
            } catch (e) {
                console.log("Taxes insert notice:", e.message);
            }

            // 2. Record into payments table if exists
            try {
                await db.execute(
                    `
                    INSERT INTO payments (username, service_name, amount, razorpay_order_id, razorpay_payment_id, payment_status)
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [mobile, taxType, amount, "UPI_PAYMENT", transactionRef, "SUCCESS"]
                );
            } catch (e) {
                console.log("Payments table notice:", e.message);
            }

            console.log(`✅ UPI Payment of ₹${amount} recorded for ${citizenName} (${mobile}) to 8760114592`);

            return res.json({
                success: true,
                message: `₹${amount} UPI Payment recorded successfully for 8760114592!`,
                payment_id: paymentId,
                receiver: "8760114592",
                amount: amount
            });

        } catch (error) {
            console.error("❌ UPI PAYMENT RECORD ERROR:", error.message);
            return res.status(500).json({
                success: false,
                message: "Unable to record UPI payment: " + error.message
            });
        }
    }
);

/* =========================================================
   RAZORPAY PAYMENT ENDPOINTS
========================================================= */

// Return public key for client integration
app.get(
    "/api/payment/razorpay-config",
    (req, res) => {
        return res.json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_TaZ1JYsRl01YUj"
        });
    }
);

// Record Razorpay successful payment
app.post(
    "/api/payment/razorpay-record",
    async (req, res) => {
        try {
            const mobile = String(req.body.mobile || "").trim();
            const citizenName = String(req.body.citizen_name || "Village Citizen").trim();
            const amount = Number(req.body.amount) || 1.00;
            const serviceName = String(req.body.service_name || req.body.tax_type || "Village Service Fee (Razorpay)").trim();
            const razorpayPaymentId = String(req.body.razorpay_payment_id || "").trim();
            const razorpayOrderId = String(req.body.razorpay_order_id || "DIRECT_PAY").trim();
            const today = new Date().toISOString().slice(0, 10);

            let taxId = null;

            // 1. Record into taxes table
            try {
                const [taxRes] = await db.execute(
                    `
                    INSERT INTO taxes (citizen_name, tax_type, amount, payment_date)
                    VALUES (?, ?, ?, ?)
                    `,
                    [citizenName, serviceName, amount, today]
                );
                taxId = taxRes.insertId;
            } catch (e) {
                console.log("Taxes insert notice:", e.message);
            }

            // 2. Record into payments table
            try {
                await db.execute(
                    `
                    INSERT INTO payments (username, service_name, amount, razorpay_order_id, razorpay_payment_id, payment_status, payment_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [mobile || citizenName, serviceName, amount, razorpayOrderId, razorpayPaymentId, "SUCCESS", today]
                );
            } catch (e) {
                console.log("Payments table insert notice:", e.message);
            }

            console.log(`✅ Razorpay Payment ₹${amount} recorded: ${razorpayPaymentId} for ${citizenName} (${mobile})`);

            return res.json({
                success: true,
                message: `Payment of ₹${amount} recorded successfully via Razorpay!`,
                payment_id: razorpayPaymentId,
                tax_record_id: taxId,
                amount: amount,
                citizen_name: citizenName,
                service_name: serviceName,
                date: today
            });

        } catch (error) {
            console.error("❌ RAZORPAY PAYMENT RECORD ERROR:", error.message);
            return res.status(500).json({
                success: false,
                message: "Unable to record Razorpay payment: " + error.message
            });
        }
    }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await db.query(
                "SELECT 1"
            );


            return res.json({

                success: true,

                server:
                    "running",

                database:
                    "connected",

                database_name:
                    process.env.DB_NAME ||
                    "digital_village",

                port:
                    PORT

            });

        }

        catch (error) {

            return res.status(500).json({

                success: false,

                server:
                    "running",

                database:
                    "disconnected",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   GEMINI AI BOT CHAT API (ANSWERS ANY QUESTION)
========================================================= */

let genAIClient = null;

function getGenAIClient() {
    if (!genAIClient) {
        try {
            const { GoogleGenAI } = require("@google/genai");
            const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
            if (apiKey) {
                genAIClient = new GoogleGenAI({ apiKey });
            }
        } catch (e) {
            console.error("Gemini AI initialization error:", e.message);
        }
    }
    return genAIClient;
}

app.post(
    "/api/ai/chat",
    async (req, res) => {
        try {
            const userMessage = String(req.body.message || "").trim();
            const history = Array.isArray(req.body.history) ? req.body.history : [];

            if (!userMessage) {
                return res.status(400).json({
                    success: false,
                    message: "Message cannot be empty."
                });
            }

            const ai = getGenAIClient();
            if (!ai) {
                return res.status(500).json({
                    success: false,
                    message: "Gemini API key is not configured on server."
                });
            }

            // Fetch full live digital_village database context
            let villageContext = "";
            try {
                const [citizens] = await db.query("SELECT id, name, age, gender, mobile, address FROM citizens ORDER BY id ASC LIMIT 50");
                const [complaints] = await db.query("SELECT id, citizen_name, complaint, status, created_at FROM complaints ORDER BY id ASC LIMIT 50");
                const [schemes] = await db.query("SELECT id, scheme_name, description FROM schemes ORDER BY id ASC LIMIT 50");
                const [certificates] = await db.query("SELECT id, citizen_name, certificate_type, issue_date FROM certificates ORDER BY id ASC LIMIT 50");
                const [births] = await db.query("SELECT id, child_name, father_name, mother_name, dob, village FROM births ORDER BY id ASC LIMIT 50");
                const [deaths] = await db.query("SELECT id, person_name, age, date_of_death, cause FROM deaths ORDER BY id ASC LIMIT 50");
                const [taxes] = await db.query("SELECT id, citizen_name, tax_type, amount, payment_date FROM taxes ORDER BY id ASC LIMIT 50");

                villageContext = `
==================================================
🏛️ DIGITAL VILLAGE ("digital_village") LIVE DATABASE RECORDS
==================================================

📊 LIVE SUMMARY STATS:
- Total Citizens: ${citizens.length}
- Total Schemes: ${schemes.length}
- Total Complaints: ${complaints.length}
- Total Certificates: ${certificates.length}
- Total Birth Records: ${births.length}
- Total Death Records: ${deaths.length}
- Total Tax Records: ${taxes.length}

📋 VILLAGE SCHEMES IN DATABASE:
${schemes.length > 0 ? schemes.map(s => `• [Scheme #${s.id}] "${s.scheme_name}" - Description: ${s.description}`).join("\n") : "No schemes currently registered."}

👥 REGISTERED CITIZENS IN DATABASE:
${citizens.length > 0 ? citizens.map(c => `• [Citizen #${c.id}] Name: "${c.name}", Age: ${c.age}, Gender: ${c.gender}, Mobile: ${c.mobile}, Address/Town: "${c.address}"`).join("\n") : "No citizens currently registered."}

📢 VILLAGE COMPLAINTS & GRIEVANCES IN DATABASE:
${complaints.length > 0 ? complaints.map(cp => `• [Complaint #${cp.id}] Filed by: "${cp.citizen_name}" | Issue: "${cp.complaint}" | Status: "${cp.status}"`).join("\n") : "No complaints recorded."}

📄 CERTIFICATES ISSUED IN DATABASE:
${certificates.length > 0 ? certificates.map(cert => `• [Certificate #${cert.id}] Citizen: "${cert.citizen_name}" | Type: "${cert.certificate_type}" | Issue Date: ${cert.issue_date ? String(cert.issue_date).slice(0, 10) : 'N/A'}`).join("\n") : "No certificates issued."}

👶 BIRTH RECORDS IN DATABASE:
${births.length > 0 ? births.map(b => `• [Birth #${b.id}] Child: "${b.child_name}" | Father: "${b.father_name}" | Mother: "${b.mother_name}" | DOB: ${b.dob ? String(b.dob).slice(0, 10) : 'N/A'} | Village: "${b.village || 'Local'}"`).join("\n") : "No birth records."}

🕊️ DEATH RECORDS IN DATABASE:
${deaths.length > 0 ? deaths.map(d => `• [Death #${d.id}] Person: "${d.person_name}" | Age: ${d.age} | Date of Death: ${d.date_of_death ? String(d.date_of_death).slice(0, 10) : 'N/A'} | Cause: "${d.cause || 'N/A'}"`).join("\n") : "No death records."}

💰 TAX & PAYMENT RECORDS IN DATABASE:
${taxes.length > 0 ? taxes.map(t => `• [Tax #${t.id}] Citizen: "${t.citizen_name}" | Tax Type: "${t.tax_type}" | Amount: ₹${t.amount} | Date: ${t.payment_date ? String(t.payment_date).slice(0, 10) : 'N/A'}`).join("\n") : "No tax records."}
==================================================`;
            } catch (dbErr) {
                console.log("Village context query notice:", dbErr.message);
            }

            const systemPrompt = `You are the official, highly intelligent AI Assistant for the "Digital Village Administration System" (digital_village portal).
You have FULL, DIRECT, REAL-TIME ACCESS to the live MySQL database for this village.

${villageContext}

YOUR MISSION & GUIDELINES:
1. DIGITAL VILLAGE QUESTIONS & DOUBTS:
   - When the user asks any question or doubt about this specific village (such as "What schemes exist in our village?", "Who is registered?", "What is the status of Ramesh Kumar's complaint?", "What is complaint #2 about?", "Who received an Income certificate?", "Who paid taxes and how much?", "Who are the children in birth records?"), ALWAYS answer using the REAL LIVE DATABASE DATA provided above!
   - Provide exact citizen names, phone numbers, addresses, scheme names, complaint numbers, statuses, certificate types, and tax amounts from the database.
2. GENERAL DOUBTS & ALL OTHER QUESTIONS:
   - In addition to digital_village database records, you can answer ANY general questions (math, science, farming tips, state/central government policies, general knowledge, daily life advice, tech, etc.).
3. MULTILINGUAL OUTPUT:
   - Match the user's language: If in Tamil (தமிழ்), reply politely in natural, clear Tamil. If in English, reply in English. If in Tanglish (e.g. "complaint #1 status enna?"), reply in Tanglish/Tamil with clear English terms.
   - Use neat markdown formatting with bold text and bullet points.`;

            let conversationText = systemPrompt + "\n\nRecent Conversation:\n";
            for (const item of history.slice(-6)) {
                if (item.sender === "user") {
                    conversationText += `User: ${item.text}\n`;
                } else if (item.sender === "bot" || item.sender === "assistant") {
                    conversationText += `AI Assistant: ${item.text}\n`;
                }
            }
            conversationText += `User: ${userMessage}\nAI Assistant:`;

            const preferredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
            const candidateModels = [
                preferredModel,
                "gemini-3.5-flash-lite",
                "gemini-3.7-flash",
                "gemini-3.6-flash",
                "gemini-2.5-flash"
            ];

            let reply = "";
            let lastError = null;

            for (const modelName of candidateModels) {
                try {
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: conversationText
                    });
                    if (response && response.text) {
                        reply = response.text;
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    console.log(`AI model ${modelName} fallback notice:`, err.message?.slice(0, 120));
                }
            }

            if (!reply) {
                throw lastError || new Error("Failed to generate response from all available Gemini models.");
            }

            return res.json({
                success: true,
                reply: reply
            });

        } catch (error) {
            console.error("❌ GEMINI AI ERROR:", error.message);
            return res.status(500).json({
                success: false,
                message: "AI Error: " + error.message,
                error: error.message
            });
        }
    }
);


/* =========================================================
   404 HANDLER
========================================================= */

app.use(
    (req, res) => {

        return res.status(404).json({

            success: false,

            message:
                "Route not found.",

            path:
                req.originalUrl

        });

    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ GLOBAL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "🏡 DIGITAL VILLAGE ADMINISTRATION SYSTEM"
        );

        console.log(
            "=================================================="
        );

        console.log(
            `🚀 Server running at http://localhost:${PORT}`
        );

        console.log(
            `🏠 Home        : http://localhost:${PORT}/`
        );

        console.log(
            `👤 User Login  : http://localhost:${PORT}/user-login`
        );

        console.log(
            `👤 User Dash   : http://localhost:${PORT}/user-dashboard`
        );

        console.log(
            `🛡️ Admin Login : http://localhost:${PORT}/admin-login`
        );

        console.log(
            `🛡️ Admin Dash  : http://localhost:${PORT}/dashboard`
        );

        console.log(
            "=================================================="
        );

    }
);