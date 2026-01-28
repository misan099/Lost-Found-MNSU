"use strict";

const SequelizeMock = require("sequelize-mock");

/* =========================
   Mock Sequelize Instance
========================= */
const DBMock = new SequelizeMock();

/* =========================
   Mock LostItem Model
========================= */
const LostItem = DBMock.define("LostItem", {
  id: 1,
  user_id: 4,
  item_name: "Backpack",
  category: "Bags",
  area: "Bus Stop",
  exact_location: "Near bench",
  public_description: "Black backpack",
  description: "Black Nike backpack with white logo",
  location: "Downtown",
  date_lost: new Date("2024-01-05"),
  image_url: "http://example.com/backpack.jpg",
  image_path: "/uploads/backpack.jpg",
  admin_verification_details: "Reported by owner",
  hidden_marks: "Small tear on strap",
  verification_notes: "Matches description",
  status: "pending",
  created_at: new Date(),
  updated_at: new Date(),
});

/* =========================
   Jest Tests
========================= */
describe("LostItem Model (sequelize-mock)", () => {
  test("should create a lost item", async () => {
    const item = await LostItem.create({
      user_id: 1,
      item_name: "Phone",
      category: "Electronics",
      description: "Black iPhone 13",
      location: "Library",
      date_lost: new Date(),
    });

    expect(item).toBeDefined();
    expect(item.user_id).toBe(1);
    expect(item.item_name).toBe("Phone");
  });

  test("should default status to pending", async () => {
    const item = await LostItem.create({
      user_id: 2,
      item_name: "Keys",
      category: "Accessories",
      description: "House keys with keyring",
      location: "Parking lot",
      date_lost: new Date(),
    });

    expect(item.status).toBe("pending");
  });

  test("should allow optional fields to be null", async () => {
    const item = await LostItem.create({
      user_id: 3,
      item_name: "Notebook",
      category: "Stationery",
      description: "Blue notebook",
      location: "Classroom",
      date_lost: new Date(),
      image_url: null,
      image_path: null,
    });

    expect(item.image_url).toBeNull();
    expect(item.image_path).toBeNull();
  });

  test("should update item status to matched", async () => {
    const item = await LostItem.create({
      user_id: 5,
      item_name: "Watch",
      category: "Accessories",
      description: "Silver wrist watch",
      location: "Gym",
      date_lost: new Date(),
    });

    await item.update({ status: "matched" });

    expect(item.status).toBe("matched");
  });

  test("should update item status to resolved", async () => {
    const item = await LostItem.create({
      user_id: 6,
      item_name: "Wallet",
      category: "Personal",
      description: "Brown leather wallet",
      location: "Cafeteria",
      date_lost: new Date(),
    });

    await item.update({ status: "resolved" });

    expect(item.status).toBe("resolved");
  });
});
