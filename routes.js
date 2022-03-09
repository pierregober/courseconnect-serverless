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

router.post("/users/", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const id = uuid.v4();

  const params = {
    TableName: TABLE_USER,
    Item: {
      id,
      firstName,
      lastName,
      email,
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
  const name = req.body.name;

  const params = {
    TableName: TABLE_USER,
    Key: {
      id,
    },
    UpdateExpression: "set #name = :name",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":name": name },
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

/* END - CLASS TABLE */

module.exports = router;
