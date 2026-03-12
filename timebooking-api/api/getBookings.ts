import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API handler for retrieving bookings.
 * Accepts GET requests with a device name as a query parameter.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { device } = req.query;

    // Validate query parameter
    if (!device || typeof device !== "string") {
      return res.status(400).json({ error: "Missing or invalid device parameter" });
    }

    // Retrieve bookings from the database
    const { rows } = await sql`
      SELECT * FROM bookings
      WHERE status = 'READY' AND device_name = ${device}
    `;

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error in /api/getBookings.ts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}