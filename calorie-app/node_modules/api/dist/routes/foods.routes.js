"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const foods_controller_1 = require("../controllers/foods.controller");
const r = (0, express_1.Router)();
r.get("/", foods_controller_1.FoodsController.list);
r.get("/:id", foods_controller_1.FoodsController.getById);
exports.default = r;
