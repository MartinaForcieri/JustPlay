import dbConnect from "../../../utils/dbConnect";
import Cookies from "cookies";
import { clientPromise } from "../../../utils/dbConnect";
import { createHash } from "crypto";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      res.redirect("/signIn?msg=Per favore inserisci username e password");
      return;
    }

    try {
      await dbConnect(); // Ensure database connection is established
      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME);
      const collection = db.collection("users");
      const user = await collection.findOne({ username: username });

      if (!user) {
        res.redirect("/signIn?msg=Utente non trovato");
        return;
      }

      const password_hash = createHash("sha256").update(password).digest("hex");

      if (user.password !== password_hash) {
        res.redirect("/signIn?msg=Password errata");
        return;
      }

      const cookies = new Cookies(req, res);
      cookies.set("username", username);
      res.redirect("/");
    } catch (error) {
      res
        .status(400)
        .json({ error: "Mi dispiace c'è stato un errore, riprova." });
    }
  } else {
    res.redirect("/");
  }
}
