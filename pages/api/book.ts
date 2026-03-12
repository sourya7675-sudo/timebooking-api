import supabase from "../../lib/supabase"
import { parseCommand } from "../../lib/parser"

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" })
  }

     try {

    const { command, device } = req.body

    if (!command) {
      return res.status(400).json({ error: "Command is required" })
    }

    const parsed = parseCommand(command)

    console.log("Parsed command:", parsed)

    let bookingId

    // CASE 1 → numeric ID
    if (!isNaN(Number(parsed.target))) {

      bookingId = Number(parsed.target)

    }

    // CASE 2 → keyword mapping
    else {

      const { data, error } = await supabase
        .from("id_mapping")
        .select("booking_id")
        .eq("keyword", parsed.target)
        .single()

      if (error || !data) {
        return res.status(400).json({
          error: "Keyword not found in mapping table"
        })
      }

      bookingId = data.booking_id
    }

    const today = new Date()

    const { error } = await supabase
      .from("bookings")
      .insert({
        booking_id: bookingId,
        device_name: device || "unknown",
        date: today.toISOString().split("T")[0],
        start_time: parsed.start,
        end_time: parsed.end,
        status: "READY"
      })

    if (error) {
      console.error("Insert error:", error)
      return res.status(500).json(error)
    }

    return res.json({
      success: true,
      booking_id: bookingId,
      start_time: parsed.start,
      end_time: parsed.end
    })

  } catch (err) {

    console.error(err)

    return res.status(400).json({
      error: err.message
    })

  }

}