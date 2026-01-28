"use strict";

const SequelizeMock = require("sequelize-mock");

/* =========================
   Mock Sequelize Instance
========================= */
const DBMock = new SequelizeMock();

/* =========================
   Mock Claim Model
========================= */
const Claim = DBMock.define("Claim", {
  id: 1,
  found_item_id: 10,
  lost_item_id: null,
  claimant_user_id: 5,
  verification_text: "Black wallet",
  verification_type: "description",
  additional_context: "Near library",
  proof_image_url: null,
  status: "pending",
  admin_note: null,
  created_at: new Date(),
  updated_at: new Date(),
});

/* =========================
   Jest Tests
========================= */
describe("Claim Model (sequelize-mock)", () => {
  test("should create a claim", async () => {
    const claim = await Claim.create({
      claimant_user_id: 3,
      verification_text: "Blue backpack",
    });

    expect(claim).toBeDefined();
    expect(claim.claimant_user_id).toBe(3);
    expect(claim.verification_text).toBe("Blue backpack");
  });

  test("should default status to pending", async () => {
    const claim = await Claim.create({
      claimant_user_id: 2,
      verification_text: "Silver ring",
    });

    expect(claim.status).toBe("pending");
  });

  test("should update claim status", async () => {
    const claim = await Claim.create({
      claimant_user_id: 9,
      verification_text: "Student ID",
    });

    await claim.update({ status: "verified" });

    expect(claim.status).toBe("verified");
  });
});
