const AWS = require("aws-sdk");
const express = require("express");
const uuid = require("uuid");

const IS_OFFLINE = process.env.NODE_ENV !== "production";
const TABLE_USER = process.env.TABLE_USER;
const TABLE_CLASS = process.env.TABLE_CLASS;
const TABLE_SEATS = process.env.TABLE_SEATS;

const dynamoDb =
  IS_OFFLINE === true
    ? new AWS.DynamoDB.DocumentClient({
        region: "eu-west-2",
        endpoint: "http://127.0.0.1:8080",
      })
    : new AWS.DynamoDB.DocumentClient();

const router = express.Router();

/* START - USER TABLE */
router.get("/users", (req, res) => {
  const params = {
    TableName: TABLE_USER,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error fetching the users" });
    }
    res.json(result.Items);
  });
});

router.get("/users/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: TABLE_USER,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving User" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `User with id: ${id} not found` });
    }
  });
});

router.get("/users/:email", (req, res) => {
  const email = req.params.email;

  const params = {
    TableName: TABLE_USER,
    Key: {
      email,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving User" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `User with id: ${email} not found` });
    }
  });
});

router.post("/users/", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const id = uuid.v4();

  const params = {
    TableName: TABLE_USER,
    Item: {
      id,
      firstName,
      lastName,
      email,
      password,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not create User" });
    }
    res.json({
      id,
    });
  });
});

router.delete("/user/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: TABLE_USER,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not delete User" });
    }
    res.json({ success: true });
  });
});

router.put("/users", (req, res) => {
  const id = req.body.id;
  const classes = req.body.classes;

  const params = {
    TableName: TABLE_USER,
    Key: {
      id,
    },
    UpdateExpression: "set #classes = :classes",
    ExpressionAttributeNames: { "#classes": "classes" },
    ExpressionAttributeValues: { ":classes": classes },
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not update User" });
    }
    res.json(result.Attributes);
  });
});

/* END - USER TABLE */

/* START - CLASS TABLE */

router.get("/classes", (req, res) => {
  const params = {
    TableName: TABLE_CLASS,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error fetching the classes" });
    }
    res.json(result.Items);
  });
});

router.get("/classes/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: TABLE_CLASS,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving classes" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `classes with id: ${id} not found` });
    }
  });
});

router.post("/classes/", (req, res) => {
  const content = req.body.content;
  const dateOffer = req.body.deteOffer;
  const name = req.body.name;
  const professor = req.body.professor;
  const id = uuid.v4();

  const params = {
    TableName: TABLE_CLASS,
    Item: {
      id,
      content,
      dateOffer,
      name,
      professor,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not create classes" });
    }
    res.json({
      id,
    });
  });
});

router.delete("/classes/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: TABLE_CLASS,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not delete classes" });
    }
    res.json({ success: true });
  });
});

router.put("/classes", (req, res) => {
  const id = req.body.id;
  const content = req.body.content;
  const dateOffer = req.body.deteOffer;
  const name = req.body.name;
  const professor = req.body.professor;

  const params = {
    TableName: TABLE_CLASS,
    Key: {
      id,
    },

    ExpressionAttributeNames: {
      "#name": "name",
      "#content": "content",
      "#dateOffer": "dateOffer",
      "#professor": "professor",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":content": content,
      ":dateOffer": dateOffer,
      ":professor": professor,
    },

    UpdateExpression:
      "SET #name = :name, #content = :content, #dateOffer = :dateOffer, #professor = :professor",
  };

  console.log("updating the item");

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not update class" });
    }
    res.json(result.Attributes);
  });
});

/* END - CLASS TABLE */

/* START - SEATS TABLE */

router.get("/seats", (req, res) => {
  const params = {
    TableName: TABLE_SEATS,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error fetching the seats" });
    }
    res.json(result.Items);
  });
});

router.get("/seats/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: TABLE_SEATS,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving seats" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `seats with id: ${id} not found` });
    }
  });
});

router.put("/seats/totalSeats", (req, res) => {
  const id = req.body.id;
  const totalSeats = req.body.totalSeats;

  const params = {
    TableName: TABLE_SEATS,
    Key: {
      id,
    },
    UpdateExpression: "set #totalSeats = :totalSeats",
    ExpressionAttributeNames: { "#totalSeats": "totalSeats" },
    ExpressionAttributeValues: { ":totalSeats": totalSeats },
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not update totalSeats" });
    }
    res.json(result.Attributes);
  });
});

router.put("/seats/seatsTaken", (req, res) => {
  const id = req.body.id;
  const seatsTaken = req.body.seatsTaken;

  const params = {
    TableName: TABLE_SEATS,
    Key: {
      id,
    },
    UpdateExpression: "set #seatsTaken = :seatsTaken",
    ExpressionAttributeNames: { "#seatsTaken": "seatsTaken" },
    ExpressionAttributeValues: { ":seatsTaken": seatsTaken },
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not update seatsTaken" });
    }
    res.json(result.Attributes);
  });
});

router.delete("/seats/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: TABLE_SEATS,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not delete seats" });
    }
    res.json({ success: true });
  });
});

/* END - SEATS TABLE */
module.exports = router;
