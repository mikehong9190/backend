CREATE DATABASE IF NOT EXISTS swiirl_db_dev;
USE swiirl_db_dev;
-- changeset punit: 1
CREATE TABLE IF NOT EXISTS school(
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200),
    district VARCHAR(100),
    imageKey VARCHAR(200),
    description VARCHAR(1000),
    status ENUM('active', 'archived'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user(
    id VARCHAR(100) PRIMARY KEY,
    schoolId VARCHAR(100),
    firstName VARCHAR(200),
    lastName VARCHAR(200),
    emailId VARCHAR(200),
    password VARCHAR(200) NULL,
    loginType ENUM('google', 'default'),
    profilePictureKey VARCHAR(200),
    status ENUM('active', 'archived'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schoolId) REFERENCES school(id)
);
CREATE TABLE IF NOT EXISTS initiativeType(
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200),
    status ENUM('active', 'archived'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS initiative(
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(100),
    initiativeTypeId VARCHAR(100),
    target INT,
    actual INT,
    name VARCHAR(200),
    numberOfStudents INT,
    grade VARCHAR(100),
    status ENUM('active', 'archived'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE table IF NOT EXISTS image(
    id VARCHAR(100) PRIMARY KEY,
    initiativeId VARCHAR(100),
    imageKey VARCHAR(200),
    status ENUM('active', 'archived'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (initiativeId) REFERENCES initiative(id)
);
-- changeset punit: 2
ALTER TABLE user
ADD COLUMN bio VARCHAR(1000);
-- changeset punit: 3
ALTER TABLE user
MODIFY COLUMN status ENUM('active', 'archive', 'pending');
-- changeset punit: 4
CREATE TABLE IF NOT EXISTS otp(
    id VARCHAR(100) PRIMARY KEY,
    otp VARCHAR(10),
    emailId VARCHAR(200),
    type ENUM('verify-email', 'reset-password'),
    status ENUM('pending', 'verified'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- changeset punit: 5
ALTER TABLE school
ADD COLUMN createdBy VARCHAR(100);
ALTER TABLE school
ADD COLUMN updatedBy VARCHAR(100);
ADD CONSTRAINT FK_updatedBy FOREIGN KEY (updatedBy) REFERENCES user(id);