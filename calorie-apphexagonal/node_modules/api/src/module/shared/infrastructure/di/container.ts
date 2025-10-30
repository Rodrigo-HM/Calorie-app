// src/module/shared/infrastructure/di/container.ts
import { JwtTokenService } from "../token/jwt-token.service";
import { config } from "../config/config";
import { AuthService } from "src/module/auth/services/auth.service";
import { BcryptHasher } from "src/module/auth/crypto/bcrypt-hasher";
import type { StringValue } from "ms";

// Repos infra
import { EntriesRepositoryLowdb } from "../../../entries/infrastructure/repository/EntriesRepositoryLowdb";
import { FoodsReadRepositoryLowdb } from "../../../entries/infrastructure/repository/FoodsReadRepositoryLowdb";
import { GoalsRepositoryLowdb } from "../../../goals/infrastructure/repository/GoalsRepositoryLowdb";
import { ProfileRepositoryLowdb } from "../../../profile/infrastructure/repository/ProfileRepositoryLowdb";
import { WeightLogsRepositoryLowdb } from "../../../weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb";
import { FoodsReadRepository } from "../../../foods/infrastructure/repository/FoodsReadRepository";
import { UserRepositoryLowdb } from "src/module/auth/infrastructure/repository/UserRepositoryLowdb";

// Controllers
import { FoodsController } from "../../../foods/infrastructure/http/express/FoodsController";
import { EntriesController } from "../../../entries/infrastructure/http/express/EntriesController";
import { GoalsController } from "../../../goals/infrastructure/http/express/GoalsController";
import { ProfileController } from "../../../profile/infrastructure/http/express/ProfileController";
import { WeightLogsController } from "../../../weightLogs/infrastructure/http/express/WeightLogsController";
import { AuthController } from "../../../auth/infrastructure/http/express/AuthController";

// Application (services/use-cases)
import { GoalsService } from "../../../goals/aplication/GoalsService";
import { UpdateProfile } from "src/module/profile/aplication/UpdateProfile";
import { RecalculateAndSaveGoals } from "src/module/profile/aplication/RecalculateAndSaveGoals";
import { ListWeightLogs } from "src/module/weightLogs/aplication/ListWeightLogs";
import { CreateWeightLog } from "src/module/weightLogs/aplication/CreateWeightLog";

// Entries use-cases
import { CreateEntry } from "../../../entries/aplication/use-cases/CreateEntry";
import { ListEntriesByDay } from "../../../entries/aplication/use-cases/ListEntriesByDay";
import { UpdateEntryGrams } from "../../../entries/aplication/use-cases/UpdateEntryGrams";
import { RemoveEntry } from "../../../entries/aplication/use-cases/RemoveEntry";

export const container = {
  authModule() {
    const users = new UserRepositoryLowdb();
    const hasher = new BcryptHasher(10);
    const tokens = new JwtTokenService();
    const exp = config.jwtExpiresIn as unknown as StringValue | number;

    const authSvc = new AuthService(users, hasher, tokens, exp);
    const authController = new AuthController(authSvc);

    return { authController };
  },

  foodsModule() {
    // Módulo Foods independiente (si lo mantienes): OK
    const foodsRepo = new FoodsReadRepository();
    const foodsController = new FoodsController({
      listAll: () => foodsRepo.listAll(),
      getById: (id: string) => foodsRepo.getById(id),
    });

    return { foodsController };
  },

  goalsModule() {
    const goalsRepo = new GoalsRepositoryLowdb();
    const service = new GoalsService(goalsRepo);
    const goalsController = new GoalsController(service);

    return { goalsController };
  },

  profileModule() {
    // Infra
    const profileRepo = new ProfileRepositoryLowdb();
    const goalsRepo = new GoalsRepositoryLowdb();

    // Application
    const updateProfile = new UpdateProfile(profileRepo);
    const recalcGoals = new RecalculateAndSaveGoals(goalsRepo);

    // Controller
    const profileController = new ProfileController(
      updateProfile,
      recalcGoals,
      profileRepo
    );

    return { profileController };
  },

  entriesModule() {
    // Infra
    const entriesRepo = new EntriesRepositoryLowdb();
    const foodsRepo = new FoodsReadRepositoryLowdb();

    // Application (use-cases)
    const createEntry = new CreateEntry(entriesRepo, foodsRepo);
    const listByDay = new ListEntriesByDay(entriesRepo, foodsRepo);
    const updateGrams = new UpdateEntryGrams(entriesRepo);
    const removeEntry = new RemoveEntry(entriesRepo);

    // Controller
    const entriesController = new EntriesController(
      createEntry,
      listByDay,
      updateGrams,
      removeEntry
    );
    return { entriesController };
  },

  weightLogsModule() {
    const repo = new WeightLogsRepositoryLowdb();
    const listLogs = new ListWeightLogs(repo);
    const createLog = new CreateWeightLog(repo);
    const weightLogsController = new WeightLogsController(listLogs, createLog);

    return { weightLogsController };
  },
};