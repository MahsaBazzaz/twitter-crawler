
## Description

Twitter Crwaler Project - This is part of the my bachelor project. The [backend implementation](https://github.com/MahsaBazzaz/twitter-dashboard-api-gateway) and the [frontend implementation](https://github.com/MahsaBazzaz/twitter-dashboard-application) can be found in my repositories.

## Installation
1. start NATS service. you can find the instructions at [installation documentaion](https://docs.nats.io/running-a-nats-service/introduction/installation)
2. install the project dependensies:
```bash
$ npm install
```
3. set up a .env file containing Twitter Developer Account API keys and database password in the following format:
```bash
consumer_key = ""
consumer_secret = ""
Access_Token = ""
Access_Token_Secret = ""
bearer_token = ""
API_Key = ""
API_Key_Secret = ""
host = "localhost"
port = ""
database = "twitter"
user = "postgres"
password = ""
```
## Running the app
First follow the instruction of [backend installation](https://github.com/MahsaBazzaz/twitter-dashboard-api-gateway/blob/master/README.md), then to run the app:
```bash
$ npm run start
```
=> if encountered with webpack error run:
```bash
$ npm link webpack
```




