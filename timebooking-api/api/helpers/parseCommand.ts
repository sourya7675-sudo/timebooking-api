export function parseCommand(command: string) {
  const timeMatch = command.match(/(\d{1,2}:\d{2})\s*to\s*(\d{1,2})/);
  if (!timeMatch) {
    throw new Error("Invalid time format in command");
  }

  const startTime = timeMatch[1];
  const endTime = timeMatch[2];

  const targetMatch = command.match(/in\s+(\w+)/);
  if (!targetMatch) {
    throw new Error("No target found in command");
  }

  const target = targetMatch[1];

  return { startTime, endTime, target };
}