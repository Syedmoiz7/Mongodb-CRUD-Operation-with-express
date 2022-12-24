import express from 'express';
import mongoose from 'mongoose';
import cors from "cors"

const SECRET = process.env.SECRET || "topsecret";


const app = express()
const port = process.env.PORT || 5000
const mongodbURI = process.env.mongodbURI || "mongodb+srv://abuser:abuser@cluster0.3psj2vc.mongodb.net/?retryWrites=true&w=majority"

app.use(cors());
app.use(express.json())
app.use(cookieParser());


// app.use(cors({
//     origin: ['http://localhost:3000', "*"],
//     credentials: true
// }));

let products = [] // connect with mongodb


let productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  description: String,
  createdOn: { type: Date, default: Date.now }
});
const productModel = mongoose.model('products', productSchema);

const userSchema = new mongoose.Schema({

    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },

    
    createdOn: { type: Date, default: Date.now },
});
const userModel = mongoose.model('Users', userSchema);

app.post("/signup", (req, res) => {

  let body = req.body;

  if (!body.firstName
      || !body.lastName
      || !body.email
      || !body.password
  ) {
      res.status(400).send(
          `required fields missing, request example: 
              {
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "abc@abc.com",
                  "password": "12345"
              }`
      );
      return;
  }

  // check if user already exist // query email user
  userModel.findOne({ email: body.email }, (err, data) => {
      if (!err) {
          console.log("data: ", data);

          if (data) { // user already exist
              console.log("user already exist: ", data);
              res.status(400).send({ message: "user already exist,, please try a different email" });
              return;

          } else { // user not already exist

              stringToHash(body.password).then(hashString => {

                  userModel.create({
                      firstName: body.firstName,
                      lastName: body.lastName,
                      email: body.email.toLowerCase(),
                      password: hashString
                  },
                      (err, result) => {
                          if (!err) {
                              console.log("data saved: ", result);
                              res.status(201).send({ message: "user is created" });
                          } else {
                              console.log("db error: ", err);
                              res.status(500).send({ message: "internal server error" });
                          }
                      });
              })

          }
      } else {
          console.log("db error: ", err);
          res.status(500).send({ message: "db error in query" });
          return;
      }
  })
});


app.post("/login", (req, res) => {

    let body = req.body;

    if (!body.email || !body.password) { // null check - undefined, "", 0 , false, null , NaN
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    // check if user already exist // query email user
    userModel.findOne(
        { email: body.email },
        // { email:1, firstName:1, lastName:1, age:1, password:0 },
        "email firstName lastName age password",
        (err, data) => {
            if (!err) {
                console.log("data: ", data);

                if (data) { // user found
                    varifyHash(body.password, data.password).then(isMatched => {

                        console.log("isMatched: ", isMatched);

                        if (isMatched) {

                            var token = jwt.sign({
                                _id: data._id,
                                email: data.email,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                            }, SECRET);

                            console.log("token: ", token);

                            res.cookie('Token', token, {
                                maxAge: 86_400_000,
                                httpOnly: true
                            });

                            res.send({
                                message: "login successful",
                                profile: {
                                    email: data.email,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    age: data.age,
                                    _id: data._id
                                }
                            });
                            return;
                        } else {
                            console.log("user not found");
                            res.status(401).send({ message: "Incorrect email or password" });
                            return;
                        }
                    })

                } else { // user not already exist
                    console.log("user not found");
                    res.status(401).send({ message: "Incorrect email or password" });
                    return;
                }
            } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "login failed, please try later" });
                return;
            }
        })



})




app.post('/product', (req, res) => {
  const body = req.body;

  if (
    !body.name
    || !body.price
    || !body.description
  ) {
    res.status(400).send({
      message: "require parameters missing",
    });
    return
  }
  console.log(body.name);
  console.log(body.price);
  console.log(body.description);

  // products.push({
  //   id: `${new Date().getTime()}`,
  //   name: body.name,
  //   price: body.price,
  //   description: body.description
  // })

  productModel.create({
    name: body.name,
    price: body.price,
    description: body.description,
  },
    (err, saved) => {
      if (!err) {
        console.log(saved);

        res.send({
          message: "your product is saved"
        })
      } else {
        res.status(500).send({
          message: "server error"
        })
      }
    })

  // res.send({
  //   message: "product added successfully"
  // });

})


app.get('/products', (req, res) => {
  res.send({
    message: "all products get successfully ",
    data: products
  })
})


app.get('/product/:id', (req, res) => {
  const id = req.params.id;

  let isFound = false
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) {
      res.send({
        message: `Got product by id: ${products[i]} successfully`,
        data: products[i]
      });
      isFound = true
      break;
    }
  }

  if (isFound === false) {
    res.status(404);
    res.send({
      message: "product not found"
    });
  }
})


app.delete('/product/:id', (req, res) => {
  const id = req.params.id;

  let isFound = false
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) {

      products.splice(i, 1)
      res.send({
        message: "product deleted successfully"
      });
      isFound = true
      break;
    }
  }

  if (isFound === false) {
    res.status(404);
    res.send({
      message: "Delete fail: product not found"
    });
  }
})


app.put('/product/:id', (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (
    !body.name
    || !body.price
    || !body.description
  ) {
    res.status(400).send({
      message: "require parameters missing"
    });
    return
  }

  console.log(body.name);
  console.log(body.price);
  console.log(body.description);

  let isFound = false
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) {

      products[i].name = body.name;
      products[i].price = body.price;
      products[i].description = body.description;

      res.send({
        message: "product updated successfully"
      });
      isFound = true
      break;
    }
  }

  if (!isFound) {
    res.status(404);
    res.send({
      message: "Edit fail: product not found"
    });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


/////////////////////////////////////////////////////////////////////////////////////////////////
mongoose.connect(mongodbURI);


////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
  console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {//disconnected
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
  console.log('Mongoose connection error: ', err);
  process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log('Mongoose default connection closed');
    process.exit(0);
  });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////