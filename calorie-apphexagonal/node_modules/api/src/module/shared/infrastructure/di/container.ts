import { v4 as uuid } from 'uuid';
import { JwtTokenService } from '../token/jwt-token.service';
import { config } from '../config/config';
import { AuthService } from 'src/module/auth/services/auth.service';
import { BcryptHasher } from 'src/module/auth/crypto/bcrypt-hasher';
import type { StringValue } from 'ms';

import { EntriesRepository } from '../../../entries/infrastructure/repository/EntriesRepository';
import { GoalsRepository } from '../../../goals/infrastructure/repository/GoalsRepository';
import { ProfileRepository as ProfileInfraRepo } from '../../../profile/infrastructure/repository/ProfileRepository';
import { WeightLogsRepository as WeightLogsInfraRepo } from "../../../weightLogs/infrastructure/repository/WeightLogsRepository";
import { FoodsReadRepository } from '../../../foods/infrastructure/repository/FoodsReadRepository';
import { UserRepositoryLowdb } from 'src/module/auth/infrastructure/repository/UserRepositoryLowdb';

import { FoodsController } from '../../../foods/infrastructure/http/express/FoodsController';
import { EntriesController } from '../../../entries/infrastructure/http/express/EntriesController';
import { GoalsController } from '../../../goals/infrastructure/http/express/GoalsController';
import { ProfileController } from '../../../profile/infrastructure/http/express/ProfileController';
import { WeightLogsController } from '../../../weightLogs/infrastructure/http/express/WeightLogsController';
import { AuthController } from '../../../auth/infrastructure/http/express/AuthController';

import { GoalsService } from "../../../goals/aplication/GoalsService";
import { UpdateProfile } from 'src/module/profile/aplication/UpdateProfile';
import { RecalculateAndSaveGoals } from 'src/module/profile/aplication/RecalculateAndSaveGoals';
import { ListWeightLogs } from 'src/module/weightLogs/aplication/ListWeightLogs';
import { CreateWeightLog } from 'src/module/weightLogs/aplication/CreateWeightLog';


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
    const foodsRepo = new FoodsReadRepository();
    const foodsController = new FoodsController({
      listAll: () => foodsRepo.listAll(),
      getById: (id: string) => foodsRepo.getById(id),
    });

    return { foodsController };
  },

    goalsModule() {
    const repo = new GoalsRepository();
    const service = new GoalsService(repo);
    const goalsController = new GoalsController(service);

    return { goalsController };
  },

   profileModule() {
    // 🔹 Capa de infraestructura → acceso a datos (DB, archivos, API, etc.)
    const profileRepo = new ProfileInfraRepo();
    const goalsRepo = new GoalsRepository();

    // 🔹 Capa de aplicación → casos de uso
    const updateProfile = new UpdateProfile(profileRepo);
    const recalcGoals = new RecalculateAndSaveGoals(goalsRepo);

    // 🔹 Capa de interfaz → controlador HTTP que orquesta todo
    const profileController = new ProfileController(
      updateProfile,
      recalcGoals,
      profileRepo
    );

    // ✅ Exportamos solo lo necesario
    return { profileController };
  },

  entriesModule() {
    const entriesRepo = new EntriesRepository();
    const foodsRepo = new FoodsReadRepository();

    const addEntry = {
      run: async (p: { userId: string; foodId: string; grams: number; date?: string }) => {
        const food = await foodsRepo.getById(p.foodId);
        if (!food) throw new Error('FOOD_NOT_FOUND');

        const now = new Date().toISOString();
        const entry = {
          id: uuid(),
          userId: p.userId,
          foodId: p.foodId,
          grams: p.grams,
          date: p.date ? new Date(p.date).toISOString() : now,
          createdAt: now,
        };
        await entriesRepo.save(entry);
        return entry;
      },
    };

    const listByDay = {
      run: async (userId: string, dayISO: string) => {
        return await entriesRepo.findByDay(userId, dayISO);
      },
    };

    const updateGrams = {
      run: async (userId: string, id: string, grams: number) => {
        const updated = await entriesRepo.updateGramsForUser(id, userId, grams);
        if (!updated) throw new Error('NOT_FOUND');
        return updated;
      },
    };

    const removeEntry = {
      run: async (userId: string, id: string) => {
        const removed = await entriesRepo.deleteByIdForUser(id, userId);
        if (!removed) throw new Error('NOT_FOUND');
        return { ok: true };
      },
    };

    const entriesController = new EntriesController(addEntry, listByDay, updateGrams, removeEntry);
    return { entriesController };
  },

   weightLogsModule() {
    const repo = new WeightLogsInfraRepo();
    const listLogs = new ListWeightLogs(repo);
    const createLog = new CreateWeightLog(repo);
    const weightLogsController = new WeightLogsController(listLogs, createLog);

    return { weightLogsController };
  },
};
