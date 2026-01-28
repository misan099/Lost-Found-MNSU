"use strict";

const SequelizeMock = require("sequelize-mock");

/* =========================
   Mock Sequelize Instance
========================= */
const DBMock = new SequelizeMock();

/* =========================
   Mock Confirmation Model
========================= */
const Confirmation = DBMock.define("Confirmation", {
  id: 1,
  thread_id: 100,
  owner_confirmed: false,
  finder_confirmed: false,
  created_at: new Date(),
  updated_at: new Date(),
});

/* =========================
   Jest Tests
========================= */
describe("Confirmation Model (sequelize-mock)", () => {
  test("should create a confirmation record", async () => {
    const confirmation = await Confirmation.create({
      thread_id: 200,
    });

    expect(confirmation).toBeDefined();
    expect(confirmation.thread_id).toBe(200);
  });

  test("should default owner_confirmed to false", async () => {
    const confirmation = await Confirmation.create({
      thread_id: 201,
    });

    expect(confirmation.owner_confirmed).toBe(false);
  });

  test("should default finder_confirmed to false", async () => {
    const confirmation = await Confirmation.create({
      thread_id: 202,
    });

    expect(confirmation.finder_confirmed).toBe(false);
  });

  test("should update owner_confirmed", async () => {
    const confirmation = await Confirmation.create({
      thread_id: 203,
    });

    await confirmation.update({ owner_confirmed: true });

    expect(confirmation.owner_confirmed).toBe(true);
  });

  test("should update finder_confirmed", async () => {
    const confirmation = await Confirmation.create({
      thread_id: 204,
    });

    await confirmation.update({ finder_confirmed: true });

    expect(confirmation.finder_confirmed).toBe(true);
  });

  test("should allow both parties to confirm", async () => {
    const confirmation = await Confirmation.create({
      thread_id: 205,
    });

    await confirmation.update({
      owner_confirmed: true,
      finder_confirmed: true,
    });

    expect(confirmation.owner_confirmed).toBe(true);
    expect(confirmation.finder_confirmed).toBe(true);
  });
});
