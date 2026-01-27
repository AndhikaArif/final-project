import "dotenv/config";

import express, {
  type Application,
  type Request,
  type Response,
} from "express";

class App {
  public app: Application;
  private readonly PORT: number;

  constructor(port: number) {
    this.app = express();
    this.PORT = port;

    this.initializeMiddlewares();
    this.initializeStatus();
    this.initializeRoutes();
    this.initializeErrorHandler();
  }

  private initializeMiddlewares(): void {
    const corsOptions = {
      origin: "http://localhost:3000",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
      optionsSuccessStatus: 204,
    };

    this.app.use(express.json());
  }

  private initializeStatus(): void {
    this.app.get("/status", (req: Request, res: Response) => {
      res
        .status(200)
        .json({ message: "API Running", uptime: Math.round(process.uptime()) });
    });
  }

  private initializeRoutes(): void {}

  private initializeErrorHandler(): void {}

  public listen(): void {
    this.app.listen(this.PORT, () =>
      console.info(`Server is listening on port ${this.PORT}`),
    );
  }
}

export default App;
