// src/module/shared/infrastructure/di/container.ts
import { v4 as uuid } from "uuid";

// Config / tokens
import { JwtTokenService } from "../token/jwt-token.service";
import { config } from "../config/config";

// Auth
import { AuthService } from "src/module/auth/application/auth.service";
import { BcryptHasher } from "src/module/auth/infrastructure/crypto/bcrypt-hasher";
import { UserRepositoryLowdb } from "src/module/auth/infrastructure/repository/UserRepositoryLowdb";
import { AuthController } from "src/module/auth/infrastructure/http/express/AuthController";

// Foods
import { FoodsReadRepository } from "src/module/foods/infrastructure/repository/FoodsReadRepository";
import { FoodsService } from "src/module/foods/application/FoodsService";
import { FoodsController } from "src/module/foods/infrastructure/http/express/FoodsController";

// Goals
import { GoalsRepositoryLowdb } from "src/module/goals/infrastructure/repository/GoalsRepositoryLowdb";
import { GoalsService } from "src/module/goals/application/GoalsService";
import type { Goals, GoalsInput } from "src/module/goals/domain/Goals";
import { GoalsController } from "src/module/goals/infrastructure/http/express/GoalsController";

// Profile
import { ProfileRepositoryLowdb } from "src/module/profile/infrastructure/repository/ProfileRepositoryLowdb";
import { UpdateProfile } from "src/module/profile/application/UpdateProfile";
import { RecalculateAndSaveGoals } from "src/module/profile/application/RecalculateAndSaveGoals";
import { ProfileController } from "src/module/profile/infrastructure/http/express/ProfileController";

// Entries
import { EntriesRepositoryLowdb } from "src/module/entries/infrastructure/repository/EntriesRepositoryLowdb";
import { FoodsReadRepositoryLowdb } from "src/module/entries/infrastructure/repository/FoodsReadRepositoryLowdb";
import { CreateEntry } from "src/module/entries/application/use-cases/CreateEntry";
import { ListEntriesByDay } from "src/module/entries/application/use-cases/ListEntriesByDay";
import { UpdateEntryGrams } from "src/module/entries/application/use-cases/UpdateEntryGrams";
import { RemoveEntry } from "src/module/entries/application/use-cases/RemoveEntry";
import type { IdGenerator as EntriesIdGenerator } from "src/module/entries/domain/IdGenerator";
import type { Clock as EntriesClock } from "src/module/entries/domain/Clock";
import { EntriesController } from "src/module/entries/infrastructure/http/express/EntriesController";

// WeightLogs
import { WeightLogsRepositoryLowdb } from "src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb";
import { ListWeightLogs } from "src/module/weightLogs/application/ListWeightLogs";
import { CreateWeightLog } from "src/module/weightLogs/application/CreateWeightLog";
import type { IdGenerator as WLIdGenerator } from "src/module/weightLogs/domain/IdGenerator";
import type { Clock as WLClock } from "src/module/weightLogs/domain/Clock";
import { WeightLogsController } from "src/module/weightLogs/infrastructure/http/express/WeightLogsController";

// Auth middleware builder
import { buildAuthMiddleware } from "../di/authMiddleware";

export const container = {
  // Exponer el middleware de autorización (para rutas protegidas)
  authz() {
    const tokens = new JwtTokenService(config.jwtSecret);
    const authMiddleware = buildAuthMiddleware(tokens);
    return { authMiddleware };
  },

  // Auth (endpoints públicos /auth)
  authModule() {
    const users = new UserRepositoryLowdb();
    const hasher = new BcryptHasher();
    const tokens = new JwtTokenService(config.jwtSecret);
    const authService = new AuthService(users, hasher, tokens, uuid);
    const authController = new AuthController(authService);
    return { authController };
  },

  // Foods
  foodsModule() {
    const foodsRepo = new FoodsReadRepository();
    const foodsService = new FoodsService(foodsRepo);
    const foodsController = new FoodsController(foodsService);
    return { foodsController };
  },

  // Goals
  goalsModule() {
    const goalsRepo = new GoalsRepositoryLowdb();
    const service = new GoalsService(goalsRepo);
    const goalsController = new GoalsController(service);
    return { goalsController };
  },

  // Profile
  profileModule() {
    // Repo de perfil
    const profileRepo = new ProfileRepositoryLowdb();

    // Goals service (normaliza parciales y guarda)
    const goalsRepo = new GoalsRepositoryLowdb();
    const goalsService = new GoalsService(goalsRepo);

    // Facade para RecalculateAndSaveGoals (set con GoalsInput)
    const goalsPortForRecalc: { set: (userId: string, data: GoalsInput) => Promise<Goals> } = {
      set: (userId, data) => goalsService.set(userId, data),
    };

    const recalcGoals = new RecalculateAndSaveGoals(goalsPortForRecalc);
    const updateProfile = new UpdateProfile(profileRepo);

    // Puerto de lectura para el controller (get profile)
    const profilePortForController = {
      get: (userId: string) => profileRepo.get(userId),
    };

    const profileController = new ProfileController(updateProfile, recalcGoals, profilePortForController);
    return { profileController };
  },

  // Entries
  entriesModule() {
    const entriesRepo = new EntriesRepositoryLowdb();
    const foodsRepo = new FoodsReadRepositoryLowdb();

    const ids: EntriesIdGenerator = { nextId: uuid };
    const clock: EntriesClock = { now: () => new Date() };

    const createEntry = new CreateEntry(entriesRepo, foodsRepo, ids, clock);
    const listByDay = new ListEntriesByDay(entriesRepo, foodsRepo);
    const updateGrams = new UpdateEntryGrams(entriesRepo);
    const removeEntry = new RemoveEntry(entriesRepo);

    const entriesController = new EntriesController(createEntry, listByDay, updateGrams, removeEntry);
    return { entriesController };
  },

  // WeightLogs
  weightLogsModule() {
    const repo = new WeightLogsRepositoryLowdb();

    const clock: WLClock = { now: () => new Date() };
    const ids: WLIdGenerator = { nextId: uuid };

    const listLogs = new ListWeightLogs(repo);
    const createLog = new CreateWeightLog(repo, ids, clock);

    const weightLogsController = new WeightLogsController(listLogs, createLog);
    return { weightLogsController };
  },
};