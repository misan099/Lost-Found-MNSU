"use strict";

/* =========================
 IMPORT CONTROLLER FUNCTIONS
========================= */
const {
  createClaim,
  getUserClaimsWithMessages,
} = require("../../controllers/claimController");

/* =========================
 MOCK DATABASE MODELS
========================= */
jest.mock("../../models", () => ({
  Claim: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
    describe: jest.fn(), 
  },
  FoundItem: {
    findByPk: jest.fn(),
  },
  LostItem: {
    findByPk: jest.fn(),
  },
  MessageThread: {},
  Confirmation: {},
  Message: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
  User: {},
  Sequelize: {
    fn: jest.fn(),
    col: jest.fn(),
  },
}));

/* =========================
 MOCK SEQUELIZE OP
========================= */
jest.mock("sequelize", () => ({
  Op: {
    or: Symbol("or"),
    in: Symbol("in"),
  },
}));

/* =========================
 MOCK CHAT HELPERS
========================= */
jest.mock("../../utils/chatHelpers", () => ({
  fetchClaimForChat: jest.fn(),
  getChatStatus: jest.fn(() => ({
    status: "verified",
    ownerConfirmed: false,
    finderConfirmed: false,
    canSend: true,
    isVerified: true,
    isRejected: false,
    isResolved: false,
    bothConfirmed: false,
  })),
  getSenderRole: jest.fn(() => "owner"),
  getSenderRoleById: jest.fn(() => "owner"),
  isParticipant: jest.fn(() => true),
  ensureThreadForClaim: jest.fn(() => ({
    thread: { id: 1 },
    confirmation: { owner_confirmed: false, finder_confirmed: false },
  })),
}));

/* =========================
 MOCK USER STATUS
========================= */
jest.mock("../../utils/userStatus", () => ({
  getAccountNotice: jest.fn(() => null),
  getUserStatusPayload: jest.fn(() => ({ status: "active" })),
  resolveUserStatus: jest.fn(), // ✅ REQUIRED
}));

const db = require("../../models");

/* =========================
 MOCK EXPRESS REQ / RES
========================= */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  user: data.user || { id: 1, role: "user" },
  file: data.file || null,
  protocol: "http",
  get: () => "localhost:5000",
});

/* =========================
 TESTS
========================= */
describe("Claim Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     CREATE CLAIM
  ========================= */
  test("should create a claim successfully", async () => {
    db.Claim.describe.mockResolvedValue({
      id: {},
      found_item_id: {},
      verification_text: {},
      status: {},
      created_at: {},
      updated_at: {},
    });

    db.FoundItem.findByPk.mockResolvedValue({
      id: 10,
      status: "available",
      user_id: 2,
    });

    db.Claim.findOne.mockResolvedValue(null);

    db.Claim.create.mockResolvedValue({
      id: 100,
      status: "pending",
    });

    const req = mockRequest({
      body: {
        found_item_id: 10,
        verification_text:
          "This phone belongs to me and contains my SIM card.",
      },
    });

    const res = mockResponse();

    await createClaim(req, res);

    expect(db.Claim.create).toHaveBeenCalled(); // ✅ NOW PASSES
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Claim request submitted successfully",
      })
    );
  });

  /* =========================
     GET USER CLAIMS
  ========================= */
  test("should return user claims with messages", async () => {
    db.Claim.describe.mockResolvedValue({
      id: {},
      found_item_id: {},
      claimant_user_id: {},
      status: {},
      created_at: {},
      updated_at: {},
    });

    db.Claim.findAll.mockResolvedValue([
      {
        id: 1,
        status: "verified",
        claimant_user_id: 1,
        foundItem: {
          id: 10,
          item_name: "Phone",
          location: "Library",
          image_url: "/uploads/item.jpg",
          user: { id: 2, name: "Finder" },
        },
        claimant: { id: 1, name: "Owner" },
        thread: { id: 1 },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    db.Message.findAll.mockResolvedValue([]);

    const req = mockRequest();
    const res = mockResponse();

    await getUserClaimsWithMessages(req, res);

    expect(db.Claim.findAll).toHaveBeenCalled(); // ✅ NOW PASSES
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        claims: expect.any(Array),
      })
    );
  });
});
