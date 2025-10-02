"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const foods_routes_1 = __importDefault(require("./foods.routes"));
const entries_routes_1 = __importDefault(require("./entries.routes"));
const goals_routes_1 = __importDefault(require("./goals.routes"));
const r = (0, express_1.Router)();
r.get("/", (_req, res) => res.json({ api: "ok" }));
r.use("/auth", auth_routes_1.default);
r.use("/foods", foods_routes_1.default);
r.use("/entries", entries_routes_1.default);
r.use("/users/me/goals", goals_routes_1.default);
exports.default = r;
