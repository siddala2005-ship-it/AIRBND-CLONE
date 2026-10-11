const express=require("express");
const router=express.Router();
//users is removed from the path because it is already defined in server.js

router.get("/", (req, res) =>{
    res.send("List of users");
}   );
//show-user
router.get("/:id", (req, res) =>{
    const userId=req.params.id; 
    res.send(`User details for ID: ${userId}`);
});
//show-user-posts
router.get("/:id/posts", (req, res) =>{
    const userId=req.params.id;
    res.send(`Posts for User ID: ${userId}`);
}   );

//delete-user
router.delete("/:id", (req, res) =>{
    const userId=req.params.id; 
    res.send(`User with ID: ${userId} has been deleted`);
}   );

module.exports=router;
