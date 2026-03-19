export function parseCommand(command: string) {

  const now = new Date()

  let start: Date
  let end: Date
  let date = new Date()

  command = command.toLowerCase().trim()

  // ✅ DATE LOGIC
  if (command.startsWith("yesterday")) {
    date.setDate(date.getDate() - 1)
    command = command.replace("yesterday", "").trim()
  } 
  else if (command.startsWith("tomorrow")) {
    date.setDate(date.getDate() + 1)
    command = command.replace("tomorrow", "").trim()
  }

  // convert number words to numbers
  const numberWords: Record<string, number> = {
    one:1,
    two:2,
    three:3,
    four:4,
    five:5,
    six:6,
    seven:7,
    eight:8,
    nine:9,
    ten:10
  }

  Object.keys(numberWords).forEach(word => {
    command = command.replace(new RegExp(`\\b${word}\\b`, "g"), String(numberWords[word]))
  })

  // extract target
  const targetMatch = command.match(/in\s(.+)$/)

  if (!targetMatch) {
    throw new Error("Target (ID or keyword) missing")
  }

  const target = targetMatch[1].trim()

  // TIME RANGE
  const rangeMatch = command.match(/(\d{1,2})(?::(\d{2}))?\s*to\s*(\d{1,2})(?::(\d{2}))?/)

  if (rangeMatch) {

    let startHour = Number(rangeMatch[1])
    const startMinute = Number(rangeMatch[2] || 0)

    let endHour = Number(rangeMatch[3])
    const endMinute = Number(rangeMatch[4] || 0)

    // ✅ FIX: assume PM if needed
    if (endHour <= startHour) {
      endHour += 12
    }

    start = new Date(date)
    start.setHours(startHour, startMinute, 0, 0)

    end = new Date(date)
    end.setHours(endHour, endMinute, 0, 0)

    return { start, end, target, date }
  }

  // PAST TIME
  const pastMatch = command.match(/past\s(\d+)\s(hour|hours|minute|minutes)/)

  if (pastMatch) {

    const value = Number(pastMatch[1])
    const unit = pastMatch[2]

    end = new Date(date)
    start = new Date(date)

    if (unit.includes("hour")) {
      start.setHours(start.getHours() - value)
    } else {
      start.setMinutes(start.getMinutes() - value)
    }

    return { start, end, target, date }
  }

  // FUTURE TIME
  const nextMatch = command.match(/next\s(\d+)\s(hour|hours|minute|minutes)/)

  if (nextMatch) {

    const value = Number(nextMatch[1])
    const unit = nextMatch[2]

    start = new Date(date)
    end = new Date(date)

    if (unit.includes("hour")) {
      end.setHours(end.getHours() + value)
    } else {
      end.setMinutes(end.getMinutes() + value)
    }

    return { start, end, target, date }
  }

  throw new Error("Unsupported command format")
}