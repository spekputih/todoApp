const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

// to clear the warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);



app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

//conection to database
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true})

//Schema creation
const itemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "name information is undefined"]
	}
})
//Model creation
const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
	name: "Study Javascript"
})

const item2 = new Item({
	name: "Study Node.js"
})

const item3 = new Item({
	name: "Study mongoose"
})

const itemsArray = [item1, item2, item3]

app.get("/", function (req, res){
	Item.find({}, (err, result)=>{
		if (result.length === 0) {
			Item.insertMany(itemsArray, (err)=>{
				if (err) {
					console.log(err)
				}else{
					console.log("Successful inserting items")
				}
			})
		res.redirect("/");
		} else {
		res.render("index", {listTitle: "Today", listItem: result});
	}
})

});


//Custom routes
const listSchema = new mongoose.Schema({
	name: String,
	itemLists: [itemSchema]
});

const List = mongoose.model("List", listSchema)


app.get("/:customListName", function(req,res){
	let customListName = _.capitalize(req.params.customListName);
	List.findOne({name: customListName}, function(err, result){

		if(!err){
			if(!result){
				const list = new List({
					name: customListName,
					itemLists: itemsArray
				})
				list.save();
				res.redirect("/" + customListName)
			}else{

				res.render("index", {listTitle: customListName, listItem: result.itemLists});
			}

		}
	})
	
})

app.post("/", function(req, res) {

	let pageTitle = req.body.button

	let nameItem = req.body.nameItem
	let item = new Item({
		name: nameItem
	})
	if (pageTitle === "Today") {
		item.save()
		res.redirect("/")		
	} else {
		List.findOne({name: pageTitle}, function(err, result){
			result.itemLists.push(item)
			result.save()
			res.redirect("/"+pageTitle)
		})
	}


}) 

app.post("/delete", function(req, res){
	let pageTitleId = req.body.deleteMe
	let listName = req.body.listName
	console.log(req.body)
		if (listName === "Today") {	
            Item.deleteOne({_id: req.body.deleteMe}, function(err) {
                if (err) {
                    console.log(err)
                } else {
                   res.redirect("/")
                }
            })
        }else{
        	List.findOneAndUpdate({name: listName},{$pull: {itemLists: {_id: pageTitleId }}}, function(err, result){
        		console.log(result)
        		res.redirect("/"+listName)
        	})
        }
})


app.listen(3000, function(){
	console.log("the server is running on post 3000");
})



