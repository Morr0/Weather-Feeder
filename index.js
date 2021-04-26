const {
    WEATHER_API_KEY,
    LATITUDE,
    LONGITUDE,
    SNS_TOPIC_ARN
} = process.env;

const handler = async function (event){
    console.log(JSON.stringify(
        {
            latitude: LATITUDE,
            longitude: LONGITUDE
        }
    ));

    const text = await getWeatherNow();
    await publishToClient(text);
}

const getWeatherNow = async () => {
    const responseStr = await fetch();
    console.log(`Received data:\n${responseStr}`);
    const data = JSON.parse(responseStr);

    console.log("\Logging current weather");
    const now = `Now:\n-Temperature: ${data.current.temp}C\n-Feels Like: ${data.current.feels_like}C\n-Humidity: ${data.current.humidity}%\n-Cloudness: ${data.current.clouds}%`;
    console.log(now);
    return now;
}

const fetch = () => {
    const httpRequest = require("http").request;

    const options = {
        host: "api.openweathermap.org",
        path: `/data/2.5/onecall?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${WEATHER_API_KEY}&units=metric&exclude=minutely,hourly`
    };

    let responseStr = "";
    return new Promise((resolve, reject) => {
        httpRequest(options, (response) => {
            response.on("error", (e) => reject(e));
    
            response.on("data", (chunk) => {
                responseStr += chunk;
            });
    
            response.on("end", () => resolve(responseStr));
        }).end();
    });
}

const publishToClient = async (text) => {
    const aws = require("aws-sdk");
    const snsClient = new aws.SNS();

    console.log("Publishing to SNS");
    await snsClient.publish({
        TopicArn: SNS_TOPIC_ARN,
        Message: text
    }).promise();
    console.log("Published to SNS");
};

exports.handler = handler;