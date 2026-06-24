import dotenv from "dotenv";
import path from "path";

// Load backend/.env variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Override configuration specifically for Jest execution
process.env.NODE_ENV = "test";
process.env.PORT = "5001";

