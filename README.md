# Fundamentals in Developer Tools - Day 3 Homework

The app has been deployed at https://encoreamtodo.herokuapp.com/

## Using the same code base.

This refers to the code contained in the repository https://github.com/stanleynguyen/amongus-todo.  In order
not to run into unnecessary confusions, I copied the code and create this separate repository instead of performing a fork. 
You may refer to the original repository for original `README.me` and other documentation.
   
## Create a Dockerfile for the code base

`Dockerfile` was created.  It starts with an image of `alpine`. It continues to install `nodejs` and `npm`.  
After that, application folders and files are copied into a docker working directory by the name `app`, followed by `npm install`.
Port `3000` is then exposed.  Finally, to make the docker image executable, entry point was created to run `npm start` on
start up.

Creation of `Dockerfile` does not create a docker imgae.  It only defines the parameters related to its creation. 
Normally, the command `docker image ...` has to be used to create it.  In this exercise, the creation will be 
automated.  See next step.
   
This <a href="https://www.youtube.com/watch?v=EIHY_CY5J0k">YouTube clip</a> gives a very easy to understand and follow 
account of the process, and was the reference for this step of the exercise.


## CI/CD

`.github/workflows/docker-containers.yml` was created and it begins with these lines:

```
01 name: build-push-docker-image
02 
03 on:
04   push:
05     branches:
06       - "main"
07
08 jobs:

```

Name of this action is `build-push-docjer-image', and it has a few jobs that follow.

This specifies that jobs defined in this file will be triggered whenever there is a `push` at branch `main`.

Reference was made to https://github.com/marketplace/actions/build-and-push-docker-images for this step of the exercise.

   
## Run a Docker build

`.github/workflows/docker-containers.yml` has as its first job `build` defined to build a docker image.

```
09   build:
10     runs-on: ubuntu-latest
11     steps:
...
19         name: Build and export
20         uses: docker/build-push-action@v2
21         with:
22           context: .
23           tags: encore428/amtodo:latest
24           outputs: type=docker,dest=/tmp/myimage.tar
25       -
26         name: Upload artifact
27         uses: actions/upload-artifact@v2
28         with:
29           name: myimage
30           path: /tmp/myimage.tar     
```   

- Line 23 defines the name and version of the image to be built as `encore428/amtodos:latest`.  Note that `encore428` is my
  personal docker id.  It is necessary to name the image with one's id as the pefix, so that when the image is pushed to
  docker hub, it will be stored in your own library.
  
- Line 24 specifies that the output is to be written to `/tmp/myimage.tar`.  This serves to keep the image for the next job.

- Reference was made to https://github.com/marketplace/actions/build-and-push-docker-images for this part of the exercise.

- https://github.com/docker/build-push-action/blob/master/docs/advanced/share-image-jobs.md was referenced on how images can be
  shared between jobs.

## Run a security check against the docker image

`.github/workflows/docker-containers.yml` was modified to add the following lines to perform code inspection:

```
32   inspect:
33     runs-on: ubuntu-latest
34     needs: build
...
40         name: Download artifact
41         uses: actions/download-artifact@v2
42         with:
43           name: myimage
44           path: /tmp
45       -
46         name: Load image
47         run: |
48           docker load --input /tmp/myimage.tar
49           docker image ls -a
50       -
51         name: Run Snyk to check Docker image for vulnerabilities
52         uses: snyk/actions/docker@master
53         env:
54           SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
55         with:
56           image: encore428/amtodo:latest
```

- `secrets.SNYK_TOKEN` has to be set-up as one of the secrets in this repository.  The value of the secret is to be obtained
as `Auth Token` from https://app.snyk.io/account.

- Line 34 specifies that this step can be executed only after the preious step `build`.

- Lines 40 to 49 downloads the tar file created during the previous step, and loads the built image.

- Lines 51 to 56 performs the scan.

- Line 56 specifies that the docker image to be scanned is `encore428/amtodo` under the heading `image`.

- Reference was made to https://github.com/marketplace/actions/build-and-push-docker-images for this step of the exercise.

## If the security check passes...

```
58    rollout:
59     runs-on: ubuntu-latest
60     needs: inspect
```

Line 60 specifies that the rollout job should follow the completion of the previous job `inspect`.


## ...push the image into Docker hub

```
61     steps:
...
73       -
74         name: Login to Docker Hub
75         uses: docker/login-action@v1
76         with:
77           username: encore428
78           password: ${{ secrets.DOCKERHUB_TOKEN }}
79       -
80         name: docker push
81         run: docker push encore428/amtodo:latest
```

- In the repository, create `secret.DOCKERHUB_TOKEN`.  This stores my personal docker password.  MY docker id is `encore428`.

- Lines 62 to 72 again downloads the tar file created during the `build` step, and loads the built image.

- Lines 74 to 78 logs in to docker using personal id.

- Line 81 executes the docker command push to publish the image to personal library.

## Run a deployment to Heroku

The following segment is added to the end of `.github/workflows/docker-containers.yml`, base on instructions found
in https://github.com/marketplace/actions/deploy-to-heroku#deploy-with-docker.  It should be noted that instructions
make no reference to the docker image encore428/amtodo.  This job rebuild the docker image independently.
```
82   heroku:
83     runs-on: ubuntu-latest
84     needs: rollout
85     steps:
86       - uses: actions/checkout@v2
87       - uses: akhileshns/heroku-deploy@v3.12.12
88         with:
89           heroku_api_key: ${{secrets.HEROKU_API_KEY}}
90           heroku_app_name: encoreamtodo
91           heroku_email: encore428@gmail.com
92           usedocker: true
```

- Go to https://dashboard.heroku.com/apps and create an app.  App `encoreamtodo` was created.

- Go to https://dashboard.heroku.com/account to reveal the API Key.

- In the repository, create `secret.HEROKU_API_KEY` using the key revealed above.

Now proceed to push all these changes to Github.  Github action will take over and perform all the above jobs. 
All the end, 

## What about port mapping

According to https://devcenter.heroku.com/articles/container-registry-and-runtime#dockerfile-commands-and-runtime, 
Heroku ignores `EXPOSE` in `Dockerfile`.  It instead assigns a port at time of application start up, and the port is
placed into environment variable PORT which the app should read and make use of.

In this app, the program `index.js` has the following lines:
```js
const server = require('./server');

const port = process.env.PORT || 3000;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('UP AND RUNNING @', port);
});
```

It reads `PORT` from `.env`, and uses `3000` as default.  In the case of Heroku deployment, the port was provided for, and
the Application log has these lines:

```
2021-10-17T09:31:04.444454+00:00 app[web.1]: UP AND RUNNING @ 37654
2021-10-17T09:31:04.774583+00:00 heroku[web.1]: State changed from starting to up
```
## Run Snyk check
(./snyk.png)

## Github Action
(./action.png)

## Docker image push
(./docker.png)

## Heroku Deployment
(./heroku.png)

## App on Heroku
(./encoremotodo.png)


## Original PDF page on the homework

![Homework pdf](./CI_CD.pdf)
