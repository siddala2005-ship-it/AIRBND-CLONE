const express=require("express");
const router=express.Router();
//posts
//index-posts//posts is removed from the path because it is already defined in server.js

router.get("/", (req, res) =>{
    res.send("List of posts");
}   );

//show-post
router.get("/:id", (req, res) =>{
    const postId=req.params.id; 
    res.send(`Post details for ID: ${postId}`);
}   );

//create-post
router.post("/", (req, res) =>{
    res.send("New post created");
}   );

//delete-post
router.delete("/:id", (req, res) =>{
    const postId=req.params.id; 
    res.send(`Post with ID: ${postId} has been deleted`);
}   );    

module.exports=router;     