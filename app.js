const express = require('express');
const app = express();
const port =process.env.PORT || 9900;

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const bodyParser= require('body-parser');
const cors= require('cors')
const mongourl = "mongodb+srv://Bubby:Bubby@99@cluster0.ycmei.mongodb.net/bubbyDB?retryWrites=true&w=majority";
let db;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


//default route
app.get("/",(req,res)=>{
    res.send("i'm runnig at default page");
})

//resaurent on the basis of query string
app.get("/restaurent",(req,res)=>{
    //condition for different purpose
    let condition={};
    //sortCondition for sorting the data on the basis of cost
    let sortCond = {cost:1};
    //for meal and cost as default
    if(req.query.mealtype && req.query.sort){
        condition = {"type.mealtype":req.query.mealtype};
        sortCond = {cost:Number(req.query.sort)};
    }
    //on the basis of meal and cost
    else if(req.query.mealtype && req.query.lcost && req.query.hcost){
        condition = {$and:[{"type.mealtype":req.query.mealtype},{cost:{$lt:Number(req.query.hcost),$gt:Number(req.query.lcost)}}]}
    }
    //meal and city based
    else if(req.query.mealtype && req.query.city){
        condition = {$and:[{"type.mealtype":req.query.mealtype},{city:req.query.city}]};
    }
    //meal and cuisine
    else if(req.query.mealtype && req.query.cuisine){
        condition = {$and:[{"type.mealtype":req.query.mealtype},{"Cuisine.cuisine":req.query.cuisine}]};
    }
    //meal
    else if(req.query.mealtype){
        condition = {"type.mealtype":req.query.mealtype};
    }
    //on the basis of city
    else if(req.query.city){
        condition={city:req.query.city}
    }
    db.collection('restaurent').find(condition).sort(sortCond).toArray((err,result)=>{
        if (err) throw err;
        res.send(result);
    });
})

//city
app.get("/city",(req,res)=>{
    //for the sorting of data
    let sortCond={city_name:1};
    //to get some number of city let initialize the limit 
    let limit = 10
    if(req.query.sort && req.query.limit){
        //to sort on the basis of their name with some limit means some fixed number
        sortCond = {city_name:Number(req.query.sort)};
        limit = Number(req.query.limit);
    }else if(req.query.sort){
        sortCond = {city_name:Number(req.query.sort)};
    }else if(req.query.limit){
        limit= Number(req.query.limit);
    }
    //to make these sorting and limit on the collection we have to use them while calling the collection
    db.collection('city').find().sort(sortCond).limit(limit).toArray((err,result)=>{
        if (err) throw err;
        res.send(result);
    });
})

//reataurent aray with some condition for this purpose we will use params and query params
//by using params
app.get('/restaurent/:id',(req,res)=>{
    var id = req.params.id;
    db.collection('restaurent').find({_id:id}).toArray((err,result)=>{
        if (err) throw err;
        res.status(200).send(result);
    });
})

//mealtype
app.get("/mealtype",(req,res)=>{
    db.collection('mealType').find().toArray((err,result)=>{
        if (err) throw err;
        res.status(200).send(result);
    });
})

//cuisine route
app.get("/cuisine",(req,res)=>{
    db.collection("cuisine").find().toArray((err,result)=>{
        if(err) throw error;
        res.status(200).send(result);
    });
})

//for placing order route
app.post("/bookOrder",(req,res)=>{
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.status(200).send("Order Placed");
    });
});

//show all orders
app.get("/orders",(req,res)=>{
    db.collection('orders').find().toArray((err,result)=>{
        if(err) throw err;
        res.status(200).send(result);
    });
})

//delete order
app.delete("/deleteOrder",(req,res)=>{
    let id = mongodb.ObjectID(req.body._id);
    db.collection('orders').remove({_id:id},(err,result)=>{
        if(err) throw error;
        res.status(200).send("Order Deleted Successfully");
    })
})

//connect mongodb and node js
MongoClient.connect(mongourl,(error,connection)=>{
    if (error) console.log(error);
    db =connection.db('bubbyDB');

    app.listen(port,(err)=>{
        if (err) throw err;
        console.log(`i m at ${port}`)
    })
})

// MongoClient.connect(mongourl,(err,connection) => {
//     if(err) console.log(err);
//     db = connection.db('edurekinternship');
  
//     app.listen(port,(err) => {
//       if(err) throw err;
//       console.log(`Server is running on port ${port}`)
//     })
//   })