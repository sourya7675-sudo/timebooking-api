import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API handler for updating booking status.
 * Accepts POST requests with a booking ID in the request body.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body;

    // Validate request body
    if (!id || typeof id !== "number") {
      return res.status(400).json({ error: "Missing or invalid id in request body" });
    }

    // Update booking status in the database
    const result = await sql`
      UPDATE bookings
      SET status = 'DONE'
      WHERE id = ${id}
    `;

    // Check if any rows were affected
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in /api/updateStatus.ts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}