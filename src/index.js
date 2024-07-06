'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // make self request
    const preventServerSleep = require("./preventServerSleep")
    preventServerSleep();

    const { Server } = require("socket.io");
    let io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("socker connected");
      socket.on("sending", (msg) => {
        console.log(msg)
        const newMessage = {
          id: new Date().getTime(),
          uid: socket.id,
          text: msg.text,
          user: "server",
        };
        io.emit("recvMsg", newMessage); // Send the message to all clients, including the sender
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    strapi.io = io;
  },
};
