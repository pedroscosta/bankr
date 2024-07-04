import Koa from "koa";
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = "Hello Worlds";
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export const viteNodeApp = app;
