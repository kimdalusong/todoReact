const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect('mongodb+srv://admin-jasper:kimjasper05@cluster0-caozn.mongodb.net/todoDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});     

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Schema
const itemSchema = mongoose.Schema({name: String});

//Model
const Item = mongoose.model("Item", itemSchema);
 
//Collection
const item1 = new Item({name: "Welcome to the Todo-List!"});
const item2 = new Item({name: "Hit the plus button to add new item."});
const item3 = new Item({name: "<--- Hit this check box to delete an Item."});

const defaultItems = [item1, item2, item3];

const customItemSchema = mongoose.Schema({
    name: String, 
    items: [itemSchema]
});

const List = mongoose.model("List", customItemSchema);


    
// Get
app.get("/", function (req, res) {

    Item.find({}, function (err, result) {

        if (result.length == 0) {
            Item.insertMany(defaultItems);
            console.log("Default Items has been added.");
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newItems: result
            });
        }
    });

});

app.get("/:customList", function(req, res){
    const customList = _.capitalize(req.params.customList);

    List.findOne({name: customList}, function (err, foundItem) {
    if (!err){
        if (!foundItem) {
            const listItem = new List({
                name: customList,
                items: defaultItems
            });
            listItem.save();
            res.redirect("/" + customList);
        } else {
            res.render("list", {listTitle: customList ,newItems: foundItem.items});
        }
    } else {
        console.log(err);
    }
    });

});

app.get("/about", function (req, res) {
    res.render("about");
})

// APP POST

app.post("/", function (req, res) {
    const itemList = req.body.addItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemList
    });


    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});


app.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundItem){
            if (!err){
                res.redirect("/" + listName);
            } else{
                console.log(err);
            }
        })
    }

});

const port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
    console.log("Server started on Port 3000");
});