import { InMemoryEventBus } from '../events/InMemoryEventBus';

// Controllers
import { AuthController } from '../../../auth/infrastructure/http/express/AuthController';
import { FoodsController } from '../../../foods/infrastructure/http/express/FoodsController';
import { GoalsController } from '../../../goals/infrastructure/http/express/GoalsController';
import { EntriesController } from '../../../entries/infrastructure/http/express/EntriesController';
import { ProfileController } from '../../../profile/infrastructure/http/express/ProfileController';
import { WeightLogsController } from '../../../weightLogs/infrastructure/http/express/WeightLogsController';

// Adapters reales (AJUSTA LAS RUTAS)
import { GoalsAdapter } from 'src/repositories/impl/goals.adapter';
import { EntriesModelAdapter } from 'src/repositories/impl/entries-model.adapter';
import { ProfileAdapter } from 'src/repositories/impl/profile.adapter';
import { WeightLogsAdapter } from 'src/repositories/impl/weightLogs.adapter';
import { FoodsReadAdapter } from 'src/repositories/impl/foods-read.adapter';
// Bridge entries
import { EntriesRepositoryBridge } from '../../../entries/infrastructure/persistence/EntriesRepositoryBridge';
import { GoalsRepositoryBridge } from 'src/module/goals/infrastructure/persistence/GoalsRepositoryBridge';
import { ProfileRepositoryBridge } from 'src/module/profile/infrastructure/http/express/persistence/ProfileRepositoryBridge';



const clock = { now: () => new Date() };
const ids = { nextId: () => Math.random().toString(36).slice(2, 10) };

export interface Container {
  authModule(): { authController: AuthController };
  foodsModule(): { foodsController: FoodsController };
  goalsModule(): { goalsController: GoalsController };
  entriesModule(): { entriesController: EntriesController };
  profileModule(): { profileController: ProfileController };
  weightLogsModule(): { weightLogsController: WeightLogsController };
}

export const container: Container = {
  authModule() {
    console.log('[DI] authModule wiring');
    const authController = new AuthController();
    return { authController };
  },

  foodsModule() {
    console.log('[DI] foodsModule wiring');
    const foodsRepo = new FoodsReadAdapter(); // <- ahora tu adapter real
    const foodsController = new FoodsController(foodsRepo);
    return { foodsController };
  },

    goalsModule() {
    console.log('[DI] goalsModule wiring');
    // Adapter legacy → Bridge (cumple el contrato moderno)
    const goalsRepo = new GoalsRepositoryBridge(new GoalsAdapter());
    // Controller que usa el repositorio bridged
    const goalsController = new GoalsController({
      get: (userId: string) => goalsRepo.get(userId),
      set: (userId: string, data: any) => goalsRepo.set(userId, data),
    });

    return { goalsController };
  },

  entriesModule() {
    console.log('[DI] entriesModule wiring');

    const eventBus = new InMemoryEventBus();

    // Legacy + bridge
    const legacyEntries = new EntriesModelAdapter(); // adaptador legacy
    const entriesRepo = new EntriesRepositoryBridge(legacyEntries); // cumple EntriesRepository
    const foodsRepo = new FoodsReadAdapter(); // para validar foodId y totales

    const addEntry = {
      run: async (input: { userId: string; foodId: string; grams: number; date?: string }) => {
        const food = await foodsRepo.getById(input.foodId);
        if (!food) throw Object.assign(new Error('FOOD_NOT_FOUND'), { name: 'DomainError' });

        const dateISO = input.date
          ? new Date(input.date).toISOString()
          : clock.now().toISOString();

        const entry = {
          id: ids.nextId(),
          userId: input.userId,
          foodId: input.foodId,
          grams: input.grams,
          date: dateISO,
          createdAt: clock.now().toISOString(),
        };

        await entriesRepo.save(entry);

        await eventBus.publish([
          {
            eventName: 'entry.added',
            aggregateId: entry.id,
            occurredOn: new Date(),
            payload: {
              userId: entry.userId,
              foodId: entry.foodId,
              grams: entry.grams,
              date: entry.date,
            },
          },
        ]);

        return { id: entry.id };
      },
    };

    const listByDay = {
      run: async (userId: string, dayISO: string) => {
        const items = await entriesRepo.findByDay(userId, dayISO);
        const foods = await foodsRepo.listAll();

        const totals = items.reduce(
          (acc: any, e: any) => {
            const f = foods.find((x: any) => x.id === e.foodId);
            if (!f) return acc;
            const factor = e.grams / 100;
            acc.kcal += Math.round(f.kcal * factor);
            acc.protein += f.protein * factor;
            acc.carbs += f.carbs * factor;
            acc.fat += f.fat * factor;
            return acc;
          },
          { kcal: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return { items, totals };
      },
    };

    const updateGrams = {
      run: async (userId: string, id: string, grams: number) => {
        const it = await entriesRepo.updateGramsForUser(id, userId, grams);
        if (!it) throw Object.assign(new Error('NOT_FOUND'), { name: 'DomainError' });
        return it;
      },
    };

    const removeEntry = {
      run: async (userId: string, id: string) => {
        const it = await entriesRepo.deleteByIdForUser(id, userId);
        if (!it) throw Object.assign(new Error('NOT_FOUND'), { name: 'DomainError' });
        return { ok: true };
      },
    };

    const entriesController = new EntriesController(
      addEntry,
      listByDay,
      updateGrams,
      removeEntry
    );

    return { entriesController };
  },

   profileModule() {
    console.log('[DI] profileModule wiring');

    const profileRepo = new ProfileRepositoryBridge(new ProfileAdapter());
    const goalsRepo = new GoalsRepositoryBridge(new GoalsAdapter());

    // ProfileController acepta { get, update } y goalsRepo con { get }
    const profileController = new ProfileController(
      {
        get: (userId: string) => profileRepo.get(userId),
        update: (userId: string, patch: any) => profileRepo.update(userId, patch),
      },
      {
        get: (userId: string) => goalsRepo.get(userId),
      }
    );

    return { profileController };
  },


  weightLogsModule() {
    console.log('[DI] weightLogsModule wiring');
    const logsRepo = new WeightLogsAdapter(); // <- tu adapter real
    const weightLogsController = new WeightLogsController(logsRepo);
    return { weightLogsController };
  },
};
