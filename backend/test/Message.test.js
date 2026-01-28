"use strict";

const SequelizeMock = require("sequelize-mock");

/* =========================
   Mock Sequelize Instance
========================= */
const DBMock = new SequelizeMock();

/* =========================
   Mock Message Model
========================= */
const Message = DBMock.define("Message", {
  id: 1,
  thread_id: 10,
  claim_id: null,
  sender_id: 5,
  sender_role: "user",
  type: "user",
  message_text: "Hello, I think this item is mine.",
  created_at: new Date(),
});

/* =========================
   Jest Tests
========================= */
describe("Message Model (sequelize-mock)", () => {
  test("should create a message", async () => {
    const message = await Message.create({
      thread_id: 1,
      sender_id: 2,
      message_text: "Is this item still available?",
    });

    expect(message).toBeDefined();
    expect(message.thread_id).toBe(1);
    expect(message.sender_id).toBe(2);
    expect(message.message_text).toBe("Is this item still available?");
  });

  test("should default type to user", async () => {
    const message = await Message.create({
      thread_id: 2,
      sender_id: 3,
      message_text: "I lost this yesterday.",
    });

    expect(message.type).toBe("user");
  });

  test("should allow system message type", async () => {
    const message = await Message.create({
      thread_id: 3,
      sender_id: 0,
      type: "system",
      message_text: "Claim has been verified.",
    });

    expect(message.type).toBe("system");
  });

  test("should allow claim_id to be null", async () => {
    const message = await Message.create({
      thread_id: 4,
      sender_id: 6,
      message_text: "Thanks for confirming.",
      claim_id: null,
    });

    expect(message.claim_id).toBeNull();
  });

  test("should have created_at timestamp", async () => {
    const message = await Message.create({
      thread_id: 5,
      sender_id: 7,
      message_text: "Please check the details.",
    });

    expect(message.created_at).toBeDefined();
  });
});
