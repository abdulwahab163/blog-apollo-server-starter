const express = require("express");
const mongoose = require("mongoose");
const config = require("config");

const { ApolloServer, AuthenticationError } = require("apollo-server-express");

const { typeDefs } = require("./schema");
const { resolvers } = require("./resolvers");
const Post = require("./models/Post");
const User = require("./models/User");
const { decodeToken } = require("./utilHelpers");

const formatError = (err) => {
  // log all Apollo Server errors to console so AWS Cloudwatch can pick them up
  console.log("Apollo Server Error", err);
  return err;
};

// connect to Database
mongoose
  .connect(config.get("MONGO_URI"))
  .then(() => console.log("DB Connected"))
  .catch((e) => console.error(e));

//apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
  context: async ({ req }) => {
    try {
      const token = req.headers.authorization || "";
      let authUser;
      if (token) {
        authUser = await decodeToken(token, config.get("secret"));
      }
      return { Post, User, authUser };
    } catch (error) {
      throw new AuthenticationError("Catch Error", error);
    }
  },
});
const app = express();

app.use(
  express.json({
    extended: false,
  })
);

server.applyMiddleware({ app });

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
  console.log(`Server Listening on ${PORT}`);
});
