import supabase from "../../lib/supabase"

export default async function handler(req,res){

 const { device } = req.query

 const { data } = await supabase
 .from("bookings")
 .select("*")
 .eq("status","READY")

 res.json(data)

}