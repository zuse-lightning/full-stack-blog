import mysql from "mysql";

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Zu$eLightning0verdrive",
    database: "blog"
});