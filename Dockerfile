FROM node:17-buster

WORKDIR /app

RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN python3 -m pip install -U yt-dlp

COPY . /app

RUN npm install

CMD [ "npm", "run", "prod" ]