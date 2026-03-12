export function parseCommand(command: string) {

  const now = new Date()

  let start: Date
  let end: Date

  command = command.toLowerCase().trim()

  // extract target after "in"
  const targetMatch = command.match(/in\s(.+)$/)

  if (!targetMatch) {
    throw new Error("Target (ID or keyword) missing")
  }

  const target = targetMatch[1].trim()

  // CASE 1: time range
  // supports: "10 to 2", "10:30 to 3", "9:15 to 11:45"
  const rangeMatch = command.match(/(\d{1,2})(?::(\d{2}))?\s*to\s*(\d{1,2})(?::(\d{2}))?/)

  if (rangeMatch) {

    const startHour = Number(rangeMatch[1])
    const startMinute = Number(rangeMatch[2] || 0)

    const endHour = Number(rangeMatch[3])
    const endMinute = Number(rangeMatch[4] || 0)

    start = new Date(now)
    start.setHours(startHour, startMinute, 0, 0)

    end = new Date(now)
    end.setHours(endHour, endMinute, 0, 0)

    return { start, end, target }
  }

  // CASE 2: past time
  // supports: "past 1 hour", "past 25 minutes"
  const pastMatch = command.match(/past\s(\d+)\s(hour|hours|minute|minutes)/)

  if (pastMatch) {

    const value = Number(pastMatch[1])
    const unit = pastMatch[2]

    end = new Date(now)
    start = new Date(now)

    if (unit.includes("hour")) {
      start.setHours(start.getHours() - value)
    } else {
      start.setMinutes(start.getMinutes() - value)
    }

    return { start, end, target }
  }

  // CASE 3: future time
  // supports: "next 20 minutes", "next 1 hour"
  const nextMatch = command.match(/next\s(\d+)\s(hour|hours|minute|minutes)/)

  if (nextMatch) {

    const value = Number(nextMatch[1])
    const unit = nextMatch[2]

    start = new Date(now)
    end = new Date(now)

    if (unit.includes("hour")) {
      end.setHours(end.getHours() + value)
    } else {
      end.setMinutes(end.getMinutes() + value)
    }

    return { start, end, target }
  }

  throw new Error("Unsupported command format")
}