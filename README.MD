# Weather Feeder

Here I am using the [Open Weather](https://openweathermap.org/) to run a cron job that sends an SMS message using AWS Lambda, EventBridge and SNS.

**`<SAMPLE>` is a substitute for what it says. This applies below**
 
First will create SNS topic:
```bash
aws sns create-topic --name <Name of SNS topic>
```

This will output the ARN of the topic. Then you can make a subscription to receive messages. I will verify using a phone like:
```bash
aws sns subscribe \
    --topic-arn <Arn of SNS> \
    --protocol sms \
    --notification-endpoint <Number starting in + then country code>
```
Will return a subscription Arn which we won't need in this case. Note you can subscribe to whatever you like.

Will now create the IAM role, note based on the AWS CLI, I have to create a role then in a separate call will add the permissions. The role and policy documents are in the source code.
```bash
aws iam create-role --role-name <Name of IAM role> \
--assume-role-policy-document file://aws.role.json

aws iam put-role-policy --role-name <Name of IAM role above> \
--policy-name <Name of policy> --policy-document file://aws.policy.json
```

Now will create the lambda function with 10 second timeout. Will use the zipped `zipped-code.zip` file in source code, it is basically the ZIP of `index.js` since that is the way to upload to Lambda. Create a new one if you modify the `index.js`.
```bash
aws lambda create-function --function-name weather-feeder-lambda --runtime nodejs14.x --zip-file fileb://zipped-code.zip --handler index.handler --role arn:aws:iam::472971161478:role/weather-feeder-lambda-role --publish 
--environment Variables="{WEATHER_API_KEY=<Api Key>,SNS_TOPIC_ARN=<Arn of SNS topic>,LATITUDE=<Your preffered Latitude>,LONGITUDE=<Your preffered Longitude>}" --timeout 10
```

Now the Lambda is up. I will make a cron job that will notify me. You can make your own cron expression here:
https://crontab.cronhub.io/

```bash
aws events put-rule --name <Name of cron job> --schedule-expression "cron(0 3 * * ? *)"
```
Above I made the cron expression to run at 3 AM GMT. The reason for GMT is because AWS uses it.

Now will attach the cron job to invoke the Lambda function once the time hits.
```bash
aws events put-targets --rule <Name of cron job above> --targets "Id"="1","Arn"="<Arn of Lambda function>"
```

That's it. Enjoy.