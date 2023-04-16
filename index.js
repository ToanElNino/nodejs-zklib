var express = require("express");
const http = require("http");
const ZKLib = require("./node_modules/node-zklib");

var app = express();
const server = http.createServer(app);

const socketIo = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

socketIo.on("connection", (socket) => {
  ///Handle khi có connect từ client tới
  console.log("New client connected" + socket.id);

  socket.on("sendDataClient", function (data) {
    console.log('send');
    // Handle khi có sự kiện tên là sendDataClient từ phía client
    socketIo.emit("sendDataServer", { data }); // phát sự kiện  có tên sendDataServer cùng với dữ liệu tin nhắn từ phía server
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected"); // Khi client disconnect thì log ra terminal.
  });
});

server.listen(3000, () => {
  console.log("Server đang chay tren cong 3000");
});

const test = async () => {
  let zkInstance = new ZKLib("192.168.1.201", 4370, 5000, null);
  try {
    // Create socket to machine
    await zkInstance.createSocket();

    // Get general info like logCapacity, user counts, logs count
    // It's really useful to check the status of device
    console.log('41: ', await zkInstance.getInfo());
    const logs = await zkInstance.getAttendances();
    console.log('55: ', logs);
  } catch (e) {
    console.log(e);
    if (e.code === "EADDRINUSE") {
    }
  }

  // Get users in machine
  const users = await zkInstance.getUsers();
  console.log('50: ', users);

  // Get all logs in the machine
  // Currently, there is no filter to take data, it just takes all !!
  const logs = await zkInstance.getAttendances();
  console.log('55: ', logs);

  const attendances = await zkInstance.getAttendances((percent, total) => {
    // this callbacks take params is the percent of data downloaded and total data need to download
  });

  // YOu can also read realtime log by getRealTimelogs function

  console.log('check users', users)

  zkInstance.getRealTimeLogs((data) => {
    // do something when some checkin
    console.log('67: ',data);
  });

  // delete the data in machine
  // You should do this when there are too many data in the machine, this issue can slow down machine
  zkInstance.clearAttendanceLog();

  // Get the device time
  // const getTime = await zkInstance.getTime();
  // console.log(getTime.toString());

  // Disconnect the machine ( don't do this when you need realtime update :)))
  await zkInstance.disconnect();
};
test();
