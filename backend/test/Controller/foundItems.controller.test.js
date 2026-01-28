"use strict";

/* =========================
 Imports
========================= */
const {
  addFoundItem,
  getFoundItems,
} = require("../../controllers/foundItems.controller");

/* =========================
 Mock db models
========================= */
jest.mock("../../models", () => ({
  FoundItem: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {},
  Claim: {
    findAll: jest.fn(),
  },
}));

/* =========================
 Mock utils
========================= */
jest.mock("../../utils/userStatus", () => ({
  getAccountNotice: jest.fn(),
}));

const db = require("../../models");
const { getAccountNotice } = require("../../utils/userStatus");

/* =========================
 Mock Express req/res
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
  user: data.user || { id: 1 },
  file: data.file || null,
});

/* =========================
 Tests
========================= */
describe("FoundItems Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     addFoundItem
  ========================= */
  test("should create a found item successfully", async () => {
    getAccountNotice.mockReturnValue(null);

    db.FoundItem.create.mockResolvedValue({
      id: 1,
      item_name: "Wallet",
    });

    const req = mockRequest({
      user: { id: 1 },
      body: {
        item_name: "Wallet",
        category: "Personal",
        area: "Campus",
        exact_location: "Library",
        date_found: "2024-01-01",
        time_found: "10:30",
        public_description: "Brown wallet with student ID card inside",
        admin_verification_details:
          "This item was verified by checking official student identification documents",
      },
    });

    const res = mockResponse();

    await addFoundItem(req, res);

    expect(db.FoundItem.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Found item reported successfully",
      })
    );
  });

  test("should block suspended user", async () => {
    getAccountNotice.mockReturnValue({
      status: "suspended",
      message: "Account suspended",
      note: "Violation of rules",
    });

    const req = mockRequest({
      user: { id: 1 },
      body: {},
    });

    const res = mockResponse();

    await addFoundItem(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "suspended",
      })
    );
  });

  /* =========================
     getFoundItems
  ========================= */
  test("should return all found items", async () => {
    db.FoundItem.findAll.mockResolvedValue([
      {
        id: 1,
        item_name: "Phone",
        setDataValue: jest.fn(),
      },
    ]);

    db.Claim.findAll.mockResolvedValue([]);

    const req = mockRequest();
    const res = mockResponse();

    await getFoundItems(req, res);

    expect(db.FoundItem.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });
});
