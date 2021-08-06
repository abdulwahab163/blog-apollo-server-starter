const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Post {
    _id: ID
    title: String!
    description: String!
    createdAt: String
    author: User
  }
  type User {
    _id: ID
    username: String!
    password: String!
    email: String!
    joinDate: String!
    favourites: [Post]
  }
  type Token {
    token: String
  }
  type Query {
    getAllPosts: [Post]
    getPost(_id: ID!): Post
    getCurrentUser: User
    searchPosts(searchValue: String): [Post]
  }
  type Mutation {
    signup(username: String!, email: String!, password: String!): Token
    login(email: String!, password: String!): Token
    addPost(title: String!, description: String!, createdAt: String): Post
    updatePost(
      _id: ID!
      title: String
      description: String
      createdAt: String
    ): Post
    deletePost(_id: ID!): Post
  }
`;

module.exports = { typeDefs };
