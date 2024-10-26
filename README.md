# integration-ts-example

## Introduction

This guide demonstrates the basic usage of the [Node.js API wrapper for the UC Integration API](https://github.com/unfoldedcircle/integration-node-library) to develop custom drivers for [Unfolded Circle Remote Devices](https://www.unfoldedcircle.com). In this example, we will create three sample entities: a light, a media player, and a button.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Authentication](#authentication)
3. [Basic Usage](#basic-usage)

## Prerequisites

Ensure the following are installed:

- **Node.js (version 20.16.0 or higher)**: Ensure Node.js is installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

- **UC Integration API**: This example includes the UC Integration API as a dependency. If you plan to develop a driver in a separate project,
you can install the API with the following command:

```
npm install uc-integration-api
```

- **Docker Desktop**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop) and install it. Start Docker, and you should see "Engine Running" in the bottom left
corner of the window.

![docker-desktop](https://github.com/user-attachments/assets/e7d8ecb6-dfc4-47f8-8a75-f0d6f7d22484)

- **Remote-Core Simulator**: Download the [Remote-Core Simulator](https://github.com/unfoldedcircle/core-simulator). Navigate to `/docker`:

```
cd path/to/core-simulator/docker
```

Run:

```
docker compose-up
```

You should see messages similar to this in the terminal:

![docker_compose-up](https://github.com/user-attachments/assets/5e3dc24f-dbe2-4347-bd57-ab78e23bc50b)


Open `localhost:8080` in a browser to see the Remote Two Core Simulator:

![remote-two](https://github.com/user-attachments/assets/c433a11f-7f23-4e55-963e-1f10f28808dd)

Select "Web-Configurator". Enter `1234` then click "Unlock":

![configurator_1](https://github.com/user-attachments/assets/710e90fc-8ade-4b89-804e-2810167986ee)

After unlocking the Web-Configurator, you are greeted with the following page:

![integrations_n_docks](https://github.com/user-attachments/assets/be867bcd-2736-4c08-a4a3-b12d53cfbb8c)

Go to "Integrations & docks" to see added integrations. Initially, only the "Home Assistant" integration should appear:

![integrations_n_docks_2](https://github.com/user-attachments/assets/efa91927-9b14-41c0-9086-6526380adb0a)

- **Postman** Download [Postman](https://www.postman.com) and import the [Remote Two Core-API Postman collection](https://github.com/unfoldedcircle/core-api/blob/main/core-api/rest/remote-core_rest-api.postman_collection.json) to access all necessary requests. 

## Authentication
To log in with admin rights, use `/auth/login` with these credentials:

```
{
  "username" : "web-configurator", 
  "password" : "1234"
}
```

![login](https://github.com/user-attachments/assets/33e97187-8a28-4286-b6c3-d8c5afd793bd)


Adjust the `/integrations/driver/registerIntegrationDriver` request to fit your driver and network settings. Use a reachable IP address in "driver_url":

```
{
  "driver_id": "simulated_light",
  "version": "1.0.0",
  "min_core_api": "1.0.0",
  "name": { "fr": "Mon driveur", "en": "My Driver", "de": "Mein Treiber", "de-CH": "Min Triber" },
  "icon": "custom:my_driver_icon",
  "description": { "en": "A simple demo integration with a simulated light entity." },
  "driver_url": "ws://192.168.#.###:9988",
  "developer": {
    "name": "John Doe",
    "email": "john@doe.com",
    "url": "https://www.unfoldedcircle.com"
  },
  "home_page": "https://www.unfoldedcircle.com",
  "release_date": "2023-03-03"
}
```

Replace `#.###` in the "driver_url" with your IP, which you can find by running:

```
ipconfig /all
```

## Basic Usage

Start the driver with `/src/light.js`. The terminal should show messages similar to:

![terminal_1](https://github.com/user-attachments/assets/bd43948f-1b98-4131-adfc-d97e4b37ea03)


Leave this terminal running. In Postman, send the `/integrations/driver/registerIntegrationDriver` request:

![register_driver](https://github.com/user-attachments/assets/de75dba2-c1a9-4bb5-a8b0-4264319738f8)

If successful, you’ll see a new message in the terminal (in pink): 

![terminal_2](https://github.com/user-attachments/assets/c6ab58d7-d422-47c4-8307-e3df02f9a998)


"My Driver" should now appear in the Web-Configurator:

![my_driver](https://github.com/user-attachments/assets/c6d291df-4dd3-439c-be9a-becefaab8d41)


Click on it, select all entities, and finish setup.

![add_entities](https://github.com/user-attachments/assets/4e62819d-7fe1-47ad-86e5-9bfa534b30af)


The configured entities should appear in the terminal:

![terminal_final](https://github.com/user-attachments/assets/f11fb73a-eb0f-4164-a4d5-08a353e16024)

