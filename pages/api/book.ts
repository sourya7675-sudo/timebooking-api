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

    // ✅ USE PARSED DATE
    const bookingDate = parsed.date
      ? parsed.date.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    // ✅ FETCH EXISTING BOOKINGS
    const { data: existingBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("booking_id", bookingId)
      .eq("date", bookingDate)

    if (fetchError) {
      return res.status(500).json(fetchError)
    }

    // ✅ FIND OVERLAPS
    const conflicts = (existingBookings || []).filter(entry => {
      const existingStart = new Date(entry.start_time)
      const existingEnd = new Date(entry.end_time)

      return parsed.start < existingEnd && parsed.end > existingStart
    })

    // ✅ IF OVERLAP → RETURN LIST
    if (conflicts.length > 0) {
      return res.json({
        status: "overlap",
        conflicts: conflicts.map(c => ({
          start: new Date(c.start_time).toTimeString().slice(0,5),
          end: new Date(c.end_time).toTimeString().slice(0,5)
        }))
      })
    }

    // ✅ INSERT IF NO OVERLAP
    const { error: insertError } = await supabase
      .from("bookings")
      .insert({
        booking_id: bookingId,
        device_name: device || "unknown",
        date: bookingDate,
        start_time: parsed.start,
        end_time: parsed.end,
        status: "READY"
      })

    if (insertError) {
      console.error("Insert error:", insertError)
      return res.status(500).json(insertError)
    }

    // ✅ SUCCESS RESPONSE
    return res.json({
      status: "success",
      start: parsed.start.toTimeString().slice(0,5),
      end: parsed.end.toTimeString().slice(0,5)
    })

  } catch (err) {

    console.error(err)

    return res.status(400).json({
      status: "error",
      message: err.message
    })

  }
}