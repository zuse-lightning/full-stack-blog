import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {

    //Check if the user already exists
    const q = "SELECT * FROM users WHERE email = ? OR username = ?";

    db.query(q, [req.body.email, req.body.username], (err, result) => {
        if (err) return res.json(err);
        if (result.length) return res.status(409).json("User already exists!");

        //Hash password and create user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q = "INSERT INTO users (username, email, password) VALUES (?)";
        const values = [
            req.body.username,
            req.body.email,
            hash
        ];

        db.query(q, [values], (err, result) => {
            if (err) return res.json(err);
            return res.status(200).json("User has been created");
        });
    });
};

export const login = (req, res) => {
    //Check user
    const q = "SELECT * FROM users WHERE username = ?";
    db.query(q, [req.body.username], (err, result) => {
        if (err) return res.json(err);
        if (result.length === 0) return res.status(404).json("User not found!");

        //Check password
        const isPassword = bcrypt.compareSync(req.body.password, result[0].password);

        if (!isPassword) return res.status(400).json("Invalid username or password!");

        const token = jwt.sign({ id: result[0].id }, "jwtkey");
        const { password, ...other } = result[0];

        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(other);
    });
};

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
    }).status(200).json("User has been logged out!");
};