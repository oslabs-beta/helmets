# Contributing

<p align="center" class="toc">
<strong><a href="#setup">Setup</a></strong>
|
<strong><a href="#file-structure">File Structure</a></strong>
|
<strong><a href="#iteration-roadmap">Iteration Roadmap</a></strong>
</p>

If you're reading this document, we're really excited that you want to contribute to the project! All work on Helmets happens directly on GitHub. If you would like to contribute, please send a pull request to the dev branch. The following guide has some useful information, so we highly recommend you take a look at it before getting started!

## Code of Conduct

We expect contributors to adhere to our code of conduct. Please read the full text so that you can understand what actions are expected of contributors to the project.

## Not sure where to start?

- You'll most likely need to read up on a few tools and libraries

  - [React Flow](https://reactflow.dev/)
    - Used to display and connect custom components
  - [Multer](https://github.com/expressjs/multer/blob/master/README.md)
    - Used to upload files from client to server
  - [Redis](https://redis.io/)
    - Provided for server-side caching
  - [Mongoose](https://www.mongodb.com/developer/languages/javascript/getting-started-with-mongodb-and-mongoose/)
    - Provided for server-side caching
    <hr/>

### Setup

If you want to contribute to Helmets, the first step is to fork and clone the repository to your local machine. Once you've cloned it, navigate to the root folder and run "npm start" to spin up the server, if desired then "npm run dev" to start up the application after installing the dependencies. This will allow you to begin making changes and testing your code.

```sh
git clone https://github.com/oslabs-beta/helmets.git
```

Then you can run:

```sh
npm start
npm run dev
```

Which will spin up a server and start the application on your local machine. Helmets uses WebPack for an enhanced development experience with really fast HMR. Any changes you make to the codebase on your local machine will be quickly reflected on your running instance of Helmets!

## Component Structure

- App
  - Main Container (wrapper component)
    - Header (main component for user input)
    - Flow (main component for application output)

## Iteration Roadmap

Not sure what contribution you want to make? Here are a few starting points:

1. Add unit tests. We are in need of unit tests for components in order to enhance the quality and reliability of the codebase.

   - If you make a pull request with a new component, consider adding an accompanying test file

2. Investigating and adding solutions for more edge cases in the file parser
3. add functionality to capture values from helper functions and provide tracing in React Flow
4. Adding support for components written in TypeScript

## License

By contributing to Helmets, you agree that your contributions will be licensed under its MIT license.
