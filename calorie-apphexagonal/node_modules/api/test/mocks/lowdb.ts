// Mock “core” de lowdb (ESM), para evitar cargar el paquete real en Jest CJS
export class LowSync<T = any> {
  data: T | any;
  constructor(_adapter: any, _defaults?: any) {
    // Precarga mínima para tests de integración “happy”
    this.data = {
      foods: [
        { id: "food_chicken", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
        { id: "food_rice", name: "Rice", kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 }
      ],
      entries: [],
      goals: [],
      users: [],
      weightLogs: [],
    };
  }
  read() {}
  write() {}
}
