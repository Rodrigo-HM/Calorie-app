import 'dotenv/config';
import { buildApp } from '../src/module/shared/infrastructure/http/express/AppBuilder';
import { initDb, seedFoodsIfEmpty } from 'src/module/shared/infrastructure/db/database';

initDb(); 
seedFoodsIfEmpty();
const app = buildApp();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}`);
});
