import supabase from "../../lib/supabase"
import { parseCommand } from "../../lib/parser"

export default async function handler(req,res){

 if(req.method !== "POST"){
  return res.status(405).send("Only POST allowed")
 }

 const { command, device } = req.body

 const parsed = parseCommand(command)

 let bookingId

 if(!isNaN(Number(parsed.target))){
   bookingId = Number(parsed.target)
}
else{

 const { data } = await supabase
 .from("id_mapping")
 .select("booking_id")
 .eq("keyword",parsed.target)
 .single()

 bookingId = data.booking_id
}

 const today = new Date()

 const [h,m] = parsed.start.split(":")

 const startTime = new Date(today)
 startTime.setHours(Number(h))
 startTime.setMinutes(Number(m))

 const endTime = new Date(today)
 endTime.setHours(Number(parsed.end))
 endTime.setMinutes(0)

 const { error } = await supabase
 .from("bookings")
 .insert({
   booking_id: bookingId,
   device_name: device,
   date: today.toISOString().split("T")[0],
   start_time: startTime,
   end_time: endTime,
   status: "READY"
 })

 if(error){
   return res.status(500).json(error)
 }

 res.json({success:true})

}