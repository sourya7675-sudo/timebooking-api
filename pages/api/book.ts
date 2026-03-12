import supabase from "../../lib/supabase"
import { parseCommand } from "../../lib/parser"

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" })
  }

  const { command, device } = req.body

  try {

    const parsed = parseCommand(command)

    let bookingId

    // CASE 1: target is numeric ID
    if (!isNaN(Number(parsed.target))) {

      bookingId = Number(parsed.target)

      // verify ID exists in database
      const { data, error } = await supabase
        .from("id_mapping")
        .select("booking_id")
        .eq("booking_id", bookingId)
        .single()

      if (error || !data) {
        return res.status(400).json({ error: "Invalid booking ID" })
      }

    }

    // CASE 2: target is keyword
    else {

      const { data, error } = await supabase
        .from("id_mapping")
        .select("booking_id")
        .eq("keyword", parsed.target)
        .single()

      if (error || !data) {
        return res.status(400).json({ error: "Keyword not found in mapping table" })
      }

      bookingId = data.booking_id

    }

    const today = new Date()

    const { error } = await supabase
      .from("bookings")
      .insert({
        booking_id: bookingId,
        device_name: device,
        date: today.toISOString().split("T")[0],
        start_time: parsed.start,
        end_time: parsed.end,
        status: "READY"
      })

    if (error) {
      return res.status(500).json(error)
    }

    return res.json({
      success: true,
      booking_id: bookingId,
      start: parsed.start,
      end: parsed.end
    })

  } catch (err) {

    return res.status(400).json({
      error: err.message
    })

  }

}