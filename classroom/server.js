const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
//import routes
const postRoutes=require("./routes/postRoutes");
const userRoutes=require("./routes/userRoutes");

//screate key is used to sign the cookie, which helps to prevent tampering of the cookie data. When a cookie is signed, a digital signature is generated using the secret key and appended to the cookie value. When the client sends the cookie back to the server, the server can verify the signature to ensure that the cookie has not been modified.
 //this middleware is used to parse the cookies attached to the client request object. It populates the req.cookies object with the cookies sent by the client.


app.use(cookieParser("secret-key"));


//middleware
//use:it is used to mount the specified middleware function(s) at the path which is being specified.
app.use("/posts", postRoutes);
app.use("/users", userRoutes);


//screate key is used to sign the cookie, which helps to prevent tampering of the cookie data. When a cookie is signed, a digital signature is generated using the secret key and appended to the cookie value. When the client sends the cookie back to the server, the server can verify the signature to ensure that the cookie has not been modified.
 //this middleware is used to parse the cookies attached to the client request object. It populates the req.cookies object with the cookies sent by the client.


app.get("/", (req, res) =>{
    res.send("Welcome to the Classroom Server!");   
});



//this route is used to send a signed cookie to the client. A signed cookie is a cookie that has been digitally signed to prevent tampering. The signature is generated using a secret key, which is known only to the server. When the client sends the cookie back to the server, the server can verify the signature to ensure that the cookie has not been modified.
app.get("/signedCookies", (req, res) =>{
    res.signedCookies("name", "value", { signed: true }); //we are sending a signed cookie to the client with the name "name" and value "value"
    res.send("Signed cookie sent!");
}   );

app.get("/verifySignedCookies", (req, res) =>{
    let {name} = req.signedCookies; 
    res.send(`Verified signed cookie: ${name}`); //we are sending the value of the signed cookie to the client
}   );



//using the cookie-parser middleware, we can access the cookies sent by the client in the req.cookies object. We can also send cookies to the client using the res.cookie() method.
app.get("/getCookies", (req, res) =>{
    let {name} = req.cookies; //we are destructuring the name property from the req.cookies object
    console.log(name);
    res.send(`i am ${name}`); //we are sending the value of the name cookie to the client

    //we are sending a cookie to the client with the name "name" and value "value"
    res.cookie("name", "value");
    console.dir(req.cookies) //when we use this the cookies cant be parsed 
    //we can see the cookie in the browser's developer tools under the "Application" tab, in the "Cookies" section.
    res.send("Cookie sent!");
})
                    



app.listen(3000, () => {
    console.log("Server is running on port 3000");
}   );
