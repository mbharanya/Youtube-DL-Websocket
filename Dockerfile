FROM node:17-buster

WORKDIR /app
COPY . /app

RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip3 install youtube-dl
RUN npm install 

CMD [ "npm", "run", "prod" ]