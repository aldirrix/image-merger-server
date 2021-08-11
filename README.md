# image-merger-server

REST server that merges images from two different API sources when requested.

## Getting Started

### Prerequisites:
* Docker & docker-compose `(able to run compose yaml version: '3.8')`
* Latest version of node + yarn `(only for local development)`


### Cloning the repository

Either clone the repository into your local machine using the webpage or `git cli`

```bash
$ git clone https://github.com/aldirrix/image-merger-server
```

## Running the server

To run the image merger server inside a docker container that exposes host's port `8080` and container port `8080` simply run:

```bash
$ docker-compose up --build
```

## Endpoints

Base url: `http://localhost:8080/api`

<table>
  <tr>
    <th>Method</th>
    <th>Route</th>
    <th>Description</th>
    <th>Query string params</th>
  <tr>
    <td>GET</td>
    <td><b>/cat-pokemon/${pokemonId}</b></td>
    <td>Gets random cat image from the internet and overlays a pokemon based on the <i>pokemonId</i> sent in request</td>
    <td>
      <i>maxWidth</i>?: number
      <i>maxHeight</i>?: number
    </td>
  </tr>
</table>


### Examples:

Return a random cat image with `pikachu` overlayed

GET - `http://localhost:8080/api/cat-pokemon/25`

Return a random cat image with `pikachu` overlayed, with a max width of `250 pixels`

GET - `http://localhost:8080/api/cat-pokemon/25?maxWidth=250`

Return a random cat image with `pikachu` overlayed, with a max width of `250 pixels` and a max height of `500 pixels`

GET - `http://localhost:8080/api/cat-pokemon/25?maxWidth=250&maxHeight=500`

## Local development

To start developing run the following commands in the terminal:

```bash
$ yarn install
$ yarn serve
```

While in local development mode, debug logs are enabled in the terminal.

Nodemon is installed as a dev dependency to make local development faster without the need to rebuild when a change is introduced into the codebase.
