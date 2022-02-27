const AWS = require("aws-sdk");
const express = require("express");
const uuid = require("uuid");

const IS_OFFLINE = process.env.NODE_ENV !== "production";
const STUDENTS_TABLE = process.env.TABLE;

const dynamoDb =
  IS_OFFLINE === true
    ? new AWS.DynamoDB.DocumentClient({
        region: "eu-west-2",
        endpoint: "http://127.0.0.1:8080",
      })
    : new AWS.DynamoDB.DocumentClient();

const router = express.Router();

router.get("/students", (req, res) => {
  const params = {
    TableName: STUDENTS_TABLE,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error fetching the students" });
    }
    res.json(result.Items);
  });
});

router.get("/students/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: STUDENTS_TABLE,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving Student" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `Student with id: ${id} not found` });
    }
  });
});

router.post("/students", (req, res) => {
  const name = req.body.name;
  const id = uuid.v4();

  const params = {
    TableName: STUDENTS_TABLE,
    Item: {
      id,
      name,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not create Student" });
    }
    res.json({
      id,
      name,
    });
  });
});

router.delete("/student/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: STUDENTS_TABLE,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not delete Student" });
    }
    res.json({ success: true });
  });
});

router.put("/students", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  const params = {
    TableName: STUDENTS_TABLE,
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
      res.status(400).json({ error: "Could not update Student" });
    }
    res.json(result.Attributes);
  });
});

module.exports = router;