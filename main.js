import * as me from "https://esm.run/melonjs@17";
import PlayScreen from "./js/screens/play.js";

// Game data
window.gameData = {
  scrollsCollected: 0,
  totalScrolls: 6,
  scrollTexts: []
};

me.device.onReady(() => {
  if (!me.video.init(1280, 720, {
    parent: "screen",
    scale: "auto",
    renderer: me.video.CANVAS
  })) {
    alert("Your browser does not support HTML5 canvas.");
    return;
  }

  // Initialize audio
  me.audio.init("mp3,ogg");

  // Load images and sounds
  me.loader.preload([
    { name: "standing", type: "image", src: "./data/img/standing.png" },
    { name: "running", type: "image", src: "./data/img/running.png" },
    { name: "crouch", type: "image", src: "./data/img/crouch.png" },
    // Sounds
    { name: "cling", type: "audio", src: "./data/sfx/" },
    { name: "die", type: "audio", src: "./data/sfx/" },
    { name: "enemykill", type: "audio", src: "./data/sfx/" }
  ], () => {
    me.state.set(me.state.PLAY, new PlayScreen());
    me.state.change(me.state.PLAY);
  });
});
