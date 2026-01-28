"use strict";

const SequelizeMock = require("sequelize-mock");

/* =========================
   Mock Sequelize Instance
========================= */
const DBMock = new SequelizeMock();

/* =========================
   Mock FoundItem Model
========================= */
const FoundItem = DBMock.define("FoundItem", {
  id: 1,
  user_id: 5,
  item_name: "Wallet",
  category: "Personal",
  area: "Library",
  exact_location: "Second floor table",
  public_description: "Brown leather wallet",
  location: "MSU Campus",
  date_found: new Date("2024-01-10"),
  image_url: "http://example.com/wallet.jpg",
  image_path: "/uploads/wallet.jpg",
  admin_only_identifiers: "ID card inside",
  admin_verification_details: "Verified with student ID",
  hidden_marks: "Small scratch on back",
  verification_notes: "Looks genuine",
  status: "available",
  created_at: new Date(),
  updated_at: new Date(),
});

/* =========================
   Jest Tests
========================= */
describe("FoundItem Model (sequelize-mock)", () => {
  test("should create a found item", async () => {
    const item = await FoundItem.create({
      user_id: 1,
      item_name: "Phone",
      category: "Electronics",
      public_description: "Black Samsung phone",
      location: "Cafeteria",
      date_found: new Date(),
    });

    expect(item).toBeDefined();
    expect(item.user_id).toBe(1);
    expect(item.item_name).toBe("Phone");
  });

  test("should default status to available", async () => {
    const item = await FoundItem.create({
      user_id: 2,
      item_name: "Keys",
      category: "Accessories",
      public_description: "House keys with keychain",
      location: "Parking lot",
      date_found: new Date(),
    });

    expect(item.status).toBe("available");
  });

  test("should allow optional fields to be null", async () => {
    const item = await FoundItem.create({
      user_id: 3,
      item_name: "Notebook",
      category: "Stationery",
      public_description: "Blue notebook",
      location: "Classroom",
      date_found: new Date(),
      image_url: null,
      image_path: null,
    });

    expect(item.image_url).toBeNull();
    expect(item.image_path).toBeNull();
  });

  test("should update item status", async () => {
    const item = await FoundItem.create({
      user_id: 4,
      item_name: "Backpack",
      category: "Bags",
      public_description: "Black backpack",
      location: "Bus stop",
      date_found: new Date(),
    });

    await item.update({ status: "claim_requested" });

    expect(item.status).toBe("claim_requested");
  });

  test("should move item to resolved status", async () => {
    const item = await FoundItem.create({
      user_id: 6,
      item_name: "Watch",
      category: "Accessories",
      public_description: "Silver wrist watch",
      location: "Gym",
      date_found: new Date(),
    });

    await item.update({ status: "resolved" });

    expect(item.status).toBe("resolved");
  });
});
