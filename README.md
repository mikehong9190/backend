# Backend Documentation

# This documentation provides an overview of the serverless Node.js backend and its services.

# Table of Contents

1. auth-service

   - addSchoolDetails
   - login
   - sendOTP
   - signup
   - validateEmail
   - verifyOTP

2. initiative-service

   - createInitiative
   - getInitiativeTypes
   - getPresignedUrl
   - getUserInitiatives
   - update

3. profile-service

   - getUser
   - resetPassword
   - updateProfile

4. school-service
   - getDetails
   - search
   - update

# Auth Service

The Auth Service handles user authentication and authorization and more

# Endpoints
## PUT /update-school-details (Creating School)
### Description : Create a School instant and add it to google user.
### Request Body:
   | Fields       | Data type          |
| ------------- |:-------------:|
| id     | String |
| createSchool      | String ("true" OR "false")     |
| districtName | String      |   
| schoolName | String      |  

## POST /auth/signup
 ### Description: Register a new user.
### Request Body:
{
  "firstname":"",
  "lastname":"",
  "emailId":"",
  "createSchool":"",
  "districtName":"",
  "schoolName":"",
  "password":""
}

# Response:

## POST /auth/login
### Description: User login.
### Request Body:
{
    "emailId": "andrew@example.com",
    "password": "Password@12345"
}

# Response:


