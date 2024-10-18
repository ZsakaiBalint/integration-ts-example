import uc, { CommandHandler } from "uc-integration-api";

uc.init("light-driver.json");

uc.on(uc.EVENTS.CONNECT, async () => {
  await uc.setDeviceState(uc.DEVICE_STATES.CONNECTED);
});

uc.on(uc.EVENTS.DISCONNECT, async () => {
  await uc.setDeviceState(uc.DEVICE_STATES.DISCONNECTED);
});

uc.on(uc.EVENTS.SUBSCRIBE_ENTITIES, async (entityIds) => {
  // the integration will configure entities and subscribe for entity update events
  // the UC library automatically adds the subscribed entities
  // from available to configured
  // you can act on this event if you need for your device handling
  entityIds.forEach((entityId: string) => {
    console.log(`Subscribed entity: ${entityId}`);
  });
});

uc.on(uc.EVENTS.UNSUBSCRIBE_ENTITIES, async (entityIds: string[]) => {
  // when the integration unsubscribed from certain entity updates,
  // the UC library automatically remove the unsubscribed entities
  // from configured
  // you can act on this event if you need for your device handling
  entityIds.forEach((entityId: string) => {
    console.log(`Unsubscribed entity: ${entityId}`);
  });
});

/**
 * Shared command handler for different entities.
 *
 * Called by the integration-API if a command is sent to a configured entity.
 *
 * @param {Entity} entity button entity
 * @param {string} cmdId command
 * @param {Object<string, *>} params optional command parameters
 * @return {Promise<string>} status of the command
 */
const sharedCmdHandler: CommandHandler = async function (
  entity,
  cmdId,
  params,
): Promise<string> {
  // let's add some hacky action to the button!
  if (entity.id === "my_button" && cmdId === uc.entities.Button.COMMANDS.PUSH) {
    console.log("Got %s push request: toggling light", entity.id);
    // trigger a light command
    const lightEntity = uc
      .getConfiguredEntities()
      .getEntity("my_unique_light_id");
    if (lightEntity) {
      await lightCmdHandler(lightEntity, uc.entities.Light.COMMANDS.TOGGLE);
    }
    return uc.api_definitions.STATUS_CODES.OK.toString();
  }

  if (entity.id === "test_mediaplayer") {
    console.log(
      "Got %s media-player command request: %s",
      entity.id,
      cmdId,
      params || "",
    );

    return uc.api_definitions.STATUS_CODES.OK.toString();
  }

  console.log("Got %s command request: %s", entity.id, cmdId);

  return uc.api_definitions.STATUS_CODES.OK.toString();
};

/**
 * Dedicated light entity command handler.
 *
 * Called by the integration-API if a command is sent to a configured light-entity.
 *
 * @param {Entity} entity light entity
 * @param {string} cmdId command
 * @param {?Object<string, *>} params optional command parameters
 * @return {Promise<string>} status of the command
 */
const lightCmdHandler: CommandHandler = async function (
  entity,
  cmdId,
  params,
): Promise<string> {
  console.log("Got %s command request: %s", entity.id, cmdId);

  // in this example we just update the entity, but in reality, you'd turn on the light with your integration
  // and handle the events separately for updating the configured entities
  switch (cmdId) {
    case uc.entities.Light.COMMANDS.TOGGLE:
      if (entity.attributes.state === uc.entities.Light.STATES.OFF) {
        uc.getConfiguredEntities().updateEntityAttributes(
          entity.id,
          new Map([
            [uc.entities.Light.ATTRIBUTES.STATE, uc.entities.Light.STATES.ON],
            [
              uc.entities.Light.ATTRIBUTES.BRIGHTNESS,
              params && params.brightness ? params.brightness : 255,
            ],
          ]),
        );
      } else if (entity.attributes.state === uc.entities.Light.STATES.ON) {
        uc.getConfiguredEntities().updateEntityAttributes(
          entity.id,
          new Map([
            [uc.entities.Light.ATTRIBUTES.STATE, uc.entities.Light.STATES.OFF],
            [
              uc.entities.Light.ATTRIBUTES.BRIGHTNESS,
              params && params.brightness ? params.brightness : 0,
            ],
          ]),
        );
      }
      break;
    case uc.entities.Light.COMMANDS.ON:
      // params is optional! Use a default if not provided.
      // A real lamp might store the last brightness value, otherwise the integration could also keep track of the last value.
      uc.getConfiguredEntities().updateEntityAttributes(
        entity.id,
        new Map([
          [uc.entities.Light.ATTRIBUTES.STATE, uc.entities.Light.STATES.ON],
          [
            uc.entities.Light.ATTRIBUTES.BRIGHTNESS,
            params && params.brightness ? params.brightness : 127,
          ],
        ]),
      );
      uc.getConfiguredEntities().updateEntityAttributes(
        "test_mediaplayer",
        new Map([[uc.entities.MediaPlayer.ATTRIBUTES.VOLUME, 24]]),
      );
      break;
    case uc.entities.Light.COMMANDS.OFF:
      uc.getConfiguredEntities().updateEntityAttributes(
        entity.id,
        new Map([
          [uc.entities.Light.ATTRIBUTES.STATE, uc.entities.Light.STATES.OFF],
          [
            uc.entities.Light.ATTRIBUTES.BRIGHTNESS,
            params && params.brightness ? params.brightness : 0,
          ],
        ]),
      );
      break;
    default:
      return uc.api_definitions.STATUS_CODES.NOT_IMPLEMENTED.toString();
  }

  return uc.api_definitions.STATUS_CODES.OK.toString();
};

// create a light entity
// normally you'd create this where your driver exposed the available entities
// The entity name can either be string (which will be mapped to english), or a Map with multiple language entries.
const name = new Map([
  ["de", "Mein Lieblingslicht"],
  ["en", "My favorite light"],
]);

const attributes: Partial<Record<string, string>> = {
  [uc.entities.Light.ATTRIBUTES.STATE]: uc.entities.Light.STATES.OFF,
  [uc.entities.Light.ATTRIBUTES.BRIGHTNESS]: "0",
};

const lightEntity = new uc.entities.Light.Light("my_unique_light_id", name, {
  features: [uc.entities.Light.FEATURES.ON_OFF, uc.entities.Light.FEATURES.DIM],
  attributes,
});
lightEntity.setCmdHandler(lightCmdHandler ?? null);

// add entity as available
// this is important, so the core knows what entities are available
uc.getAvailableEntities().addEntity(lightEntity);

const buttonEntity = new uc.entities.Button.Button(
  "my_button",
  "Push the button!",
  {
    area: "test lab",
    cmdHandler: sharedCmdHandler,
  },
);
uc.getAvailableEntities().addEntity(buttonEntity);

const defaultAttributes: Partial<Record<string, string | string[]>> = {
  [uc.entities.MediaPlayer.ATTRIBUTES.STATE]: uc.entities.MediaPlayer.STATES.ON,
  [uc.entities.MediaPlayer.ATTRIBUTES.SOURCE_LIST]: [
    "Radio",
    "Streaming",
    "Favorite 1",
    "Favorite 2",
    "Favorite 3",
  ],
};

// add a media-player entity
const mediaPlayerEntity = new uc.entities.MediaPlayer.MediaPlayer(
  "test_mediaplayer",
  new Map([["en", "Foobar MediaPlayer"]]),
  {
    features: [
      uc.entities.MediaPlayer.FEATURES.ON_OFF,
      uc.entities.MediaPlayer.FEATURES.DPAD,
      uc.entities.MediaPlayer.FEATURES.HOME,
      uc.entities.MediaPlayer.FEATURES.MENU,
      uc.entities.MediaPlayer.FEATURES.CHANNEL_SWITCHER,
      uc.entities.MediaPlayer.FEATURES.SELECT_SOURCE,
      uc.entities.MediaPlayer.FEATURES.COLOR_BUTTONS,
      uc.entities.MediaPlayer.FEATURES.PLAY_PAUSE,
    ],
    attributes: defaultAttributes,
    deviceClass: uc.entities.MediaPlayer.DEVICECLASSES.STREAMING_BOX,
  },
);
mediaPlayerEntity.setCmdHandler(sharedCmdHandler);
uc.getAvailableEntities().addEntity(mediaPlayerEntity);
