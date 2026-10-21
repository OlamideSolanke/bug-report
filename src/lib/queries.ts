import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
    }
  }
`;

export const GET_BUGS = gql`
  query GetBugs($status: Status, $priority: Priority) {
    bugs(status: $status, priority: $priority) {
      id
      title
      priority
      status
      createdAt
      createdBy {
        id
        name
      }
      assignedTo {
        id
        name
      }
    }
  }
`;

export const GET_BUG = gql`
  query GetBug($id: ID!) {
    bug(id: $id) {
      id
      title
      description
      priority
      status
      createdAt
      createdBy {
        id
        name
      }
      assignedTo {
        id
        name
      }
      comments {
        id
        text
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_BUG = gql`
  mutation CreateBug($input: CreateBugInput!) {
    createBug(input: $input) {
      id
    }
  }
`;

export const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: Status!) {
    updateBugStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const ASSIGN_BUG = gql`
  mutation AssignBug($bugId: ID!, $userId: ID) {
    assignBug(bugId: $bugId, userId: $userId) {
      id
      assignedTo {
        id
        name
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const DELETE_BUG = gql`
  mutation DeleteBug($id: ID!) {
    deleteBug(id: $id)
  }
`;
