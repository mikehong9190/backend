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
## Auth Service
### PUT /update-school-details (Creating School)
#### Description : Create a School instant and add it to google user.
#### Request Body:
   | Fields       | Data type          |
| ------------- |:-------------:|
| id     | String |
| createSchool      | String ("true" OR "false")     |
| districtName | String      |   
| schoolName | String      |  

### PUT /update-school-details (existing School)

### Description : Add existing school details to google user.
#### Request Body 
   | Fields       | Data type          |
| ------------- |:-------------:|
| id     | String |
| createSchool      | Value "false"     |
| schoolId | String      |   

### POST /auth/login
#### Description: User login.
#### Request Body:
   | Fields       | Data type          |
| ------------- |:-------------:|
| emailId      | String     |
| password | String      | 

### POST /auth/send-otp
#### Description : Send OTP to the email 
#### Request Body :
   | Fields       | Data type          |
| ------------- |:-------------:|
| emailId      | String     |
| requestType | String      | 

### POST /auth/signup
 #### Description: Register a new user.
#### Request Body:
   | Fields       | Data type          |
| ------------- |:-------------:|
| firstName     | String     |
| lastName | String      | 
| emailId      | String     |
| createSchool | String      | 
| districtName      | String     |
| schoolName | String      | 
| password      | String     |

### POST /auth/validate-email
#### Description : Valid the email 
#### Request Body :
   | Fields       | Data type          |
| ------------- |:-------------:|
| emailId     | String     |

### POST /auth/verify-otp
#### Description : Verifies the OTP
   | Fields       | Data type          |
| ------------- |:-------------:|
| emailId     | String     |
| otp     | String     |
| requestType     | String ("reset-password" OR "email")     |

## Initiative Service
### PUT /initiative/create
#### Description : Create Initiatives
   | Fields       | Data type          |
| ------------- |:-------------:|
| userId     | String     |
| imageKeys     | Array     |
| initiativeId     | String     |
| name     | String     |
| target     | Array     |
| grade     | String     |
|  initiativeTypeId   | String     |
| imageKeys     | Array     |
| numberOfStudents     | Number    |

### PUT /initiative/update
#### Description : Update Initiatives
   | Fields       | Data type          |
| ------------- |:-------------:|
| userId     | String     |
| imageKeys     | Array     |
| initiativeId     | String     |

### GET /initiative-types
#### Description : Gets all the initiatives
#### Request Body : Not required

### POST /initiative/get-presigned-urls
#### Description : Get all the presigned url
#### Request Body :
   | Fields       | Data type          |
| ------------- |:-------------:|
| userId     | String     |
| contentType     | Array     |
| initiative     | String     |

### GET /initiative/get-all
#### Description : Get all user initiatives 
#### Resquest Body : 
   | Fields       | Data type          |
| ------------- |:-------------:|
| id     | String     |

## User Service
### GET /user/get-all
#### Description : Get user details
#### Request Body : 
   | Fields       | Data type          |
| ------------- |:-------------:|
| id     | String     |

### POST /user/reset-password 
#### Description : Reset User password
#### Request Body :
   | Fields       | Data type          |
| ------------- |:-------------:|
| password    | String     |
| emailId | String     |
| userId    | String     |

### PUT /user/update
#### Description : Update user Profile 
#### Request Body :
   | Fields       | Data type          |
| ------------- |:-------------:|
| firstName    | String     |
| lastName | String     |
| picture    | File     |
| id    | String     |
| bio    | String     |


### GET /school
#### Description : Get school Details 
#### Request Body :
   | Fields       | Data type          |
| ------------- |:-------------:|
| schoolId    | String     |

### GET /school/search
#### Description : Search Schools
#### Query Parameter : 
   | Fields       |
| ------------- |
| text    |
| limit    |

## School Service
### PUT /school/update
#### Description : Update School Details
#### Request Body : 
   | Fields       | Data type          |
| ------------- |:-------------:|
| name    | String     |
| userId    | String     |
| district   | String     |
|description    | String     |
| file   | File     |
