var express = require("express");
const User = require("../model/User");
const Post = require("../model/Post");
const { post } = require("./users");
const Comment = require("../model/Comments");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Post.aggregate([
    {
      $project: {
        title: 1,
        image: 1,
        author: 1,
        content: 1,
        like: 1,
        length: { $size: "$like" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField:"_id",
        as: "author",
      },
    },
    { $sort: {length: -1} },
    { $limit: 6 },
  ]).exec((err,rtn) => {
    if (err) throw err;
    Comment.aggregate([
      {
        $group: {
          _id: "$post",
          count: { $sum: 1 },
        },
      },
      {$sort: { count: -1 } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "_id",
          as: "post",
        },
      },
    ]).exec((err2,rtn2) => {
      if (err2) throw err2;
      console.log(rtn2[0])
      res.render("index", {title: "Welcome", morelike: rtn, morecomment: rtn2 } );
    });
});
});
router.get("/register", function (req, res) {
  res.render("register");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) throw err;
    res.redirect("/");
  });
});

router.post("/login", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, rtn) {
    if (err) throw err;
    if (rtn != null && User.compare(req.body.password, rtn.password)) {
      req.session.user = {
        name: rtn.name,
        id: rtn._id,
        email: rtn.email,
      };
      res.redirect("/users");
    } else {
      res.redirect("/login");
    }
  });
});

router.post("/register", function (req, res) {
  var user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.save(function (err, rtn) {
    if (err) throw err;
    console.log(rtn);
    res.redirect("/");
  });
});

router.post("/duemailcheck", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, rtn) {
    if (err) throw err;
    res.json({
      status: rtn != null ? true : false,
    });
  });
});

router.get("/allposts", function (req, res) {
  Post.find({})
    .populate("author", "name")
    .exec((err, rtn) => {
      if (err) throw err;
      console.log(rtn);
      res.render("allposts", { posts: rtn });
    });
});

router.get("/postdetail/:id", function (req, res) {
  Post.findById(req.params.id)
    .populate("author", "_id name")
    .exec((err, rtn) => {
      if (err) throw err;
      Comment.find({ post: req.params.id })
        .populate("commenter", "name")
        .populate("author", "name")
        .select("created comment reply commenter")
        .exec((err2, rtn2) => {
          if (err2) throw err2;
        let reactStatus;
        let favStatus;
        if (req.session.user) {
          reactStatus = rtn.like.filter(function (data) {
            return data.user == req.session.user.id;
          });
          User.findById(req.session.user.id,(err3,rtn3) => {
           if (err3) throw err3;
           favStatus = rtn3.favouriteB.filter(function (data) {
            return data.blogger == rtn.author._id.toString();
           });
           console.log(favStatus);
          res.render("postdetail", {
            post: rtn,
            comments: rtn2,
            reactStatus: reactStatus,
            favStatus: favStatus,
          });
        });
        } else {
          reactStatus = [];
          console.log(rtn2)
          res.render("postdetail", {
            post: rtn,
            comments: rtn2,
            reactStatus: reactStatus,
            favStatus: favStatus,
          });
        }
        });
    });
});

module.exports = router;
