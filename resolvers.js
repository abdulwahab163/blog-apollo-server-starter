const { ApolloError } = require("apollo-server-express");
const config = require("config");
const path = require("path");

const { getToken, getHashPassword, comparePassword } = require("./utilHelpers");

const resolvers = {
  Query: {
    getCurrentUser: async (parent, args, context) => {
      const { authUser, User } = context;
      if (!authUser) return null;
      const currentUser = await User.findById(authUser._id);
      return currentUser;
    },
    getAllPosts: async (parent, args, context) => {
      const { Post } = context;
      const posts = await Post.find().populate("author");
      return posts;
    },
    getPost: async (parent, args, context) => {
      const { Post } = context;
      const post = await Post.findById(args._id).populate("author");
      return post;
    },
    searchPosts: async (parent, args, context) => {
      const { Post } = context;
      const { searchValue } = args;

      const regexQuery = {
        title: new RegExp(searchValue, "i"),
      };
      const posts = await Post.find(regexQuery);
      return posts;
    },
  },
  Mutation: {
    signup: async (parent, args, context) => {
      const { username, email, password } = args;
      const { User } = context;

      let user;

      user = await User.findOne({ $or: [{ email }] });
      if (user) {
        throw new ApolloError("User Already Exist");
      } else {
        const hashPassword = await getHashPassword(password);
        user = new User({
          username,
          email,
          password: hashPassword,
        });

        const result = await user.save();

        const token = await getToken(
          result,
          config.get("accessTokenSecret"),
          config.get("accessTokenExpiry")
        );
        return { token };
      }
    },
    login: async (parent, args, context) => {
      const { email, password } = args;
      const { User } = context;

      const user = await User.findOne({ email });
      if (!user) {
        throw new ApolloError("Invalid Email");
      } else {
        const isCorrectPassword = await comparePassword(
          password,
          user.password
        );
        if (!isCorrectPassword) {
          throw new ApolloError("Invalid Password");
        }
        const token = getToken(
          user,
          config.get("accessTokenSecret"),
          config.get("accessTokenExpiry")
        );
        return { token };
      }
    },
    addPost: async (parent, args, context) => {
      const { title, description } = args;
      const { Post, authUser } = context;

      const post = new Post({
        title,
        description,
        author: authUser._id,
      });

      const result = await post.save();
      return result;
    },

    updatePost: async (parent, args, context) => {
      const { title, description, _id } = args;
      const { Post } = context;

      const post = new Post({
        title,
        description,
      });

      const result = await Post.findByIdAndUpdate(
        { _id },
        { title, description },
        {
          new: true,
        }
      );
      return result;
    },
    deletePost: async (parent, args, context) => {
      const { _id } = args;
      const { Post } = context;
      const result = await Post.findOneAndDelete({ _id });
      return result;
    },
  },
};

module.exports = { resolvers };
