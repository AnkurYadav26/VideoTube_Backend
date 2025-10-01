import dotenv from "dotenv";
dotenv.config();
import connect_db from "./db/index.js";

import { app } from "./app.js";

connect_db()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("db connection failed !!!!", err);
    });
