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

  try {
    const { command, device } = req.body;

    // Validate request body
    if (!command || !device) {
      return res.status(400).json({ error: "Missing command or device in request body" });
    }

    // Parse the command to extract booking details
    const { startTime, endTime, target } = parseCommand(command);

    const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    let bookingId;

    // Determine booking ID based on target
    if (!isNaN(Number(target))) {
      bookingId = Number(target);
    } else {
      const { rows } = await sql`
        SELECT booking_id FROM id_mapping
        WHERE keyword = ${target}
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: "Target not found in id_mapping" });
      }

      bookingId = rows[0].booking_id;
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