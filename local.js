require("dotenv").config();

const region = process.argv[2];
if (region){
    const aws = require("aws-sdk");
    aws.config.region = region;
    require("./index")();
} else console.log("Please provide a region for AWS as argument");