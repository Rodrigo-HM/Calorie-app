import "express";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      sub: string;
      email: string;
    };
  }
}
//de esta manera en entries.controller.ts la req puede ser  un Request y no any

//Para máxima precisión: deja user?: … y usa AuthedRequest en controladores protegidos.