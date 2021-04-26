const aws = require("aws-sdk");

const {
    WEATHER_API_KEY,
    LATITUDE,
    LONGITUDE,
    SNS_TOPIC
} = process.env;

// const snsClient = new aws.SNS({
//     region: "ap-southeast-2"
// });

const handler = async function (event){
    console.log(JSON.stringify(
        {
            latitude: LATITUDE,
            longitude: LONGITUDE
        }
    ));

    const weatherOfNowAndTheDay = await getWeatherNow();

    // return snsClient.publish({
    //     TopicArn: SNS_TOPIC,
    //     Message: weatherOfNowAndTheDay
    // }).promise();
}

const getWeatherNow = async () => {
    const responseStr = await fetch();
    console.log(`Received data:\n${responseStr}`);
    const data = JSON.parse(responseStr);

    console.log("\nWriting current weather");
    let now = `Now:\n-Temperature: ${data.current.temp}C\n-Feels Like: ${data.current.feels_like}C\n-Humidity: ${data.current.humidity}%\n-Cloudness: ${data.current.clouds}%`;
    console.log(now);

}

const fetch = () => {
    const httpRequest = require("http").request;

    const options = {
        host: "api.openweathermap.org",
        path: `/data/2.5/onecall?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${WEATHER_API_KEY}&units=metric&exclude=minutely,hourly`
    };

    let responseStr = "";
    return new Promise((resolve, reject) => {
        const request = httpRequest(options, (response) => {
            response.on("error", (e) => reject(e));
    
            response.on("data", (chunk) => {
                responseStr += chunk;
            });
    
            response.on("end", () => resolve(responseStr));
        }).end();
    });
}



// exports.handler = handler;
module.exports = handler;