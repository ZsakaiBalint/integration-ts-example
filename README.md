# integration-ts-example

## Introduction

This guide demonstrates the basic usage of the [Node.js API wrapper for the UC Integration API](https://github.com/unfoldedcircle/integration-node-library) to develop custom drivers for [Unfolded Circle Remote Devices](https://www.unfoldedcircle.com). In this example, we will create three sample entities: a light, a media player, and a button.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Basic Usage](#basic-usage)
4. [Advanced Features](#advanced-features)
5. [Error Handling](#error-handling)
6. [Examples and Use Cases](#examples-and-use-cases)
7. [Testing and Debugging](#testing-and-debugging)
8. [Best Practices](#best-practices)
9. [Additional Resources](#additional-resources)
10. [FAQ](#faq)

## Getting Started

Prerequisites:

- **Node.js (version 20.16.0 or higher)**: Ensure Node.js is installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

- **UC Integration API**: This example includes the UC Integration API as a dependency. If you plan to develop a driver in a separate project, you can install the API with the following command: ```npm install uc-integration-api```

- **Docker Desktop**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop) from the official website. After downloading, install it and start the application. You should see something like this: <docker-desktop.png> Notice the "Engine Running" message in the bottom left corner.

- **Remote-Core Simulator** To test wether the developed driver works, we need to download the [Remote-Core Simulator](https://github.com/unfoldedcircle/core-simulator). After downloading, you need to navigate into the /docker folder ```cd path/to/core-simulator/docker```. In this folder, you need to call the following command: ```docker compose-up```. You should see the following messages in the terminal: <docker_compose-up.png> . After starting docker image, open localhost:8080 in your favourite browser (you can paste ```localhost:8080``` in the URL field). After that, you should see Remote Two Core Simulator. <remote-two.png> Click on the "Web-Configurator" link. You should see the following page: <configurator_1.png> Enter `1234` then click on the Unlock button (you might click on the leftmost empty square to start typing). You should see something like this: <integrations_n_docks.png>. Click on the topmost button `Integrations & docks`. Here, you can see the added integrations, which now only contains the Home Assistant Integration. <integrations_n_docks_2-png> Our goal is to have the Node.js example driver show up here!

- **Postman** We need to install [Postman](https://www.postman.com) from the official website. Download and install it. You also need to login/register a new account. You can download all REST requests of the Core-API  using this [Postman collection](https://github.com/unfoldedcircle/core-api/blob/main/core-api/rest/remote-core_rest-api.postman_collection.json) After downloading this file, you need to import it. Click on Collections > Import > then drag & drop the json file there. After this step, you should see the new collection, the Remote Two Core-API in your collections. This collection holds all necessary requests. 

## Authentication
You need to login as a web-configurator to get admin rights. This user account is allowed to do everything. Under /auth/login, change the credentials <login.png> "username" : "web-configurator", "password" : "1234"  You need to make one more adjustment. Under integrations, driver you should have a `registerIntegrationDriver` request: The payload needs to be changed to your driver and network setting. Best use an IP address to avoid name resolution issue within Docker. This needs to be an IP address which is reachable from within Docker. Usually the IP address of your network adapter which is connected to your network will work. Change the request body to:
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
Notice the hasmarks in the "driver_url" field. You need to change it to your IP address. You can get your IP address by calling ```ipconfig/all``` on Windows.

## Basic Usage
Now we should test if our driver is working. In this example, we start the /src/light.js file.
If everything is working correctly, you should see the following messages in the terminal window: <terminal_1.png>. Let this terminal window running. Open Postman, and open /integrations/driver/registerIntegrationDriver request <register_driver.png>. Click on send. 
If everything worked correctly in the terminal window, you should see a new message (written in pink color): <terminal_2.png>. You should also see a new driver called "My Driver" in the Web-Configurator: <my_driver.png>. Click on it, then click Next, Select all entities, then click next <add_entities.png>, finally click on done. That's it! In the terminal window, you should
see the new configured entities: <terminal_final.png>
