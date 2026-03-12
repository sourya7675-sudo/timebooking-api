export function parseCommand(command:string){

 const timeMatch = command.match(/(\d{1,2}:\d{2})\s*to\s*(\d{1,2})/)

 if(!timeMatch){
   throw new Error("Invalid time format")
 }

 const start = timeMatch[1]
 const end = timeMatch[2]

 const target = command.split("in ")[1]

 return {
   start,
   end,
   target
 }

}