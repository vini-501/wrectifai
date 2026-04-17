import { createApp } from './app';

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
