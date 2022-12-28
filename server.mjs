import express from 'express';
import mongoose from 'mongoose';
import cors from "cors"

const app = express()
const port = process.env.PORT || 5000
const mongodbURI = process.env.mongodbURI || "mongodb+srv://abuser:abuser@cluster0.3psj2vc.mongodb.net/dataofproducts?retryWrites=true&w=majority"

app.use(cors());
app.use(express.json())


let productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  description: String,
  createdOn: { type: Date, default: Date.now }
});
const productModel = mongoose.model('products', productSchema);



// let products = [] // connect with mongodb

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
          message: "product added successfully"
        })
      } else {
        res.status(500).send({
          message: "server error"
        })
      }
    })

})


app.get('/products', (req, res) => {

  productModel.find({}, (err, data) => {
    if (!err) {
      res.send({
        message: "all products get successfully ",
        data: data
      })
    } else {
      res.status(500).send({
        message: "server error"
      })
    }
  });





})


app.get('/product/:id', (req, res) => {

  const id = req.params.id;

  productModel.findOne({ _id: id }, (err, data) => {
    if (!err) {

      if (data) {
        res.send({
          message: `Got product by id: ${data._id} successfully`,
          data: data
        });
      } else {
        res.status(404).send({
          message: "product not found",
        })
      }

    } else {
      res.status(500).send({
        message: "server error"
      })
    }
  });
})


app.delete('/product/:id', (req, res) => {
  const id = req.params.id;

  productModel.deleteOne({ _id: id }, (err, deletedData) => {
    console.log("deleted: ", deletedData);
    if (!err) {

      if (deletedData.deletedCount !== 0) {
        res.send({
          message: "Product has been deleted successfully",
        })
      } else {
        res.status(404);
        res.send({
          message: "No Product found with this id: " + id,
        })
      }

    } else {
      res.status(500).send({
        message: "server error"
      })
    }
  });
})


app.put('/product/:id', async (req, res) => {

  const body = req.body;
  const id = req.params.id;

    if (
        !body.name ||
        !body.price ||
        !body.description
    ) {
        res.status(400).send(` required parameter missing. example request body:
        {
            "name": "value",
            "price": "value",
            "description": "value"
        }`)
        return;
    }

    try {
        let data = await productModel.findByIdAndUpdate(id,
            {
                name: body.name,
                price: body.price,
                description: body.description
            },
            { new: true }
        ).exec();

        console.log('updated: ', data);

        res.send({
          message: "product updated successfully"
        });

    } catch (error) {
        res.status(500).send({
            message: "server error"
        })
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