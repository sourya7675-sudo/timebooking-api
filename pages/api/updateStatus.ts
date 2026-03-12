import supabase from "../../lib/supabase"

export default async function handler(req,res){

 const { id } = req.body

 await supabase
 .from("bookings")
 .update({status:"DONE"})
 .eq("id",id)

 res.json({success:true})

}