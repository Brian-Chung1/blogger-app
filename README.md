<br />
<p align="center">
  
  <img src="https://imgur.com/a/86epSTI" alt="Logo" width="80" height="80">

  <h2 align="center">Blogger</h1>

  <p align="center">
    A Social Media / Blogging Application
    <br />
      <a href="https://www.bloggers.codes/">
        <strong>View Live Site »</strong>
      </a>
    <br />
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

![gif](https://imgur.com/a/7psrsjk)

Blog Application where users can create, like, and comment on blog posts. Developed a RESTful API and user authentication system using JWT. The site is hosted on AWS Elastic Beanstalk in a Multi-Container Configuration. NGINX web server serves client / static content and reverse proxies requests to server.

### Built With

Project is built with MERN (MongoDB, Express, React, Node)
User Authentication System is using JWT
Other libraries used

- [Material UI](https://github.com/mui-org/material-ui)
- [Formik](https://github.com/formium/formik) & [Yup](https://github.com/jquense/yup)
- [mongoose](https://github.com/Automattic/mongoose)

<!-- GETTING STARTED -->

## Cloning the Repo

### Prerequisites

To install and run the website locally, a MongoDB Atlas Connection URI and JWT Secrets are required

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/Brian-Chung1/blogger-app.git
    ```
2.  Go to Server directory & Install NPM packages for Server
    ```sh
    cd server
    npm install
    ```
3.  Go to Client directory & Install NPM packages for Client
    ```sh
    cd client
    npm install
    ```
4.  Create an .env file in Server directory and must provide MongoDB URI and JWT Secrets
    ```sh
    MONGODB_URI = YOUR_MONGODB_URI_HERE
    ACCESS_TOKEN_SECRET = YOUR_SECRET_HERE
    REFRESH_TOKEN_SECRET = YOUR_SECRET_HERE
    ```
5.  To run locally

    ```sh
    cd server
    npm run dev

    cd client
    npm start

    or with Docker
    docker-compose up -d
    ```

    <!-- CONTACT -->

## Contact

Brian Chung - brian.chung.cs@gmail.com
Project Link: https://www.bloggers.codes
