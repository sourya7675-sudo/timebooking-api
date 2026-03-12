import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCommand } from "./helpers/parseCommand";

/**
 * API handler for creating a booking.
 * Accepts POST requests with a command and device name.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Request Body:", req.body);
  console.log("Environment Variables:", process.env);

  try {
    const { command, device } = req.body;

    // Validate request body
    if (!command || !device) {
      return res.status(400).json({ error: "Missing command or device in request body" });
    }

    console.log("Command:", command);
    console.log("Device:", device);

    // Parse the command to extract booking details
    const { startTime, endTime, target } = parseCommand(command);

    console.log("Parsed Command:", { startTime, endTime, target });

    const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    let bookingId;

    if (!isNaN(Number(target))) {
      bookingId = Number(target);
      console.log("Booking ID (numeric):", bookingId);
    } else {
      const { rows } = await sql`
        SELECT booking_id FROM id_mapping
        WHERE keyword = ${target}
      `;
      console.log("Database Query Result:", rows);

      if (rows.length === 0) {
        console.error("Target not found in id_mapping");
        return res.status(404).json({ error: "Target not found in id_mapping" });
      }

      bookingId = rows[0].booking_id;
      console.log("Booking ID (from query):", bookingId);
    }

    // Insert booking into the database
    await sql`
      INSERT INTO bookings
      (booking_id, device_name, date, start_time, end_time, status)
      VALUES
      (${bookingId}, ${device}, ${today}, ${startTime}, ${endTime}, 'READY')
    `;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in /api/book.ts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}