import express from "express";
import { json, urlencoded } from "body-parser";
import { DrugControllers } from "../controllers/drugControllers";

export default class AppExpress {
    public express: any;

    constructor() {
        this.express = express();
        this.express.use(json());
        this.mountRoutes();
        this.errorHandle();
        this.chunkDataHandle();
    }

    public async mountRoutes() {
        const router = express.Router();
        router.get("/", (req, res) => {
            res.json({
                message: "Hello World! Website Applications"
            });
        });
        this.express.use("/", router);

        let drugControllers = new DrugControllers();
        this.express.use("/api/drugs", await drugControllers.getRouter());
    }

    private chunkDataHandle(): void {
        this.express.all("*", (req: any, res: express.Response, next: any) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
            res.setHeader("Access-Control-Allow-Headers", "accept, Content-Type, Authorization");
            res.setHeader('Access-Control-Allow-Credentials', "true");
            if (req.headers["content-type"] && req.headers["content-type"].indexOf("application/x-www-form-urlencoded") > -1) {
                this.parsePost(req, (data: any) => {
                    if (data && data != "") {
                        req.body = data;
                    }
                    // this.addSessionInfo(req);
                    next();
                    console.log("=================parse nest=======================================")
                });

                // this.addSessionInfo(req);
                console.log("================== next 1 ===================")
                // next();
            } else {
                // this.addSessionInfo(req);
                console.log("================== next 2 ===================")
                next();
            }
        });
    }

    // private addSessionInfo = (req: any) => {
    //     let sessionInfo: any = App.DecodeJWT(req.headers["authorization"]);

    //     log.info("sessionInfo: ");
    //     log.info(sessionInfo);
    //     log.info("-----------------------------------------------------");
    //     if (!req.body) {
    //         req.body = {};
    //     }
    //     if (sessionInfo) {
    //         req.body.sessionInfo = sessionInfo.identity;
    //     }
    // };

    private parsePost(req: express.Request, callback: any) {
        var data = "";
        req.on("data", chunk => {
            data += chunk;
        });
        req.on("end", () => {
            if (data != "") {
                data = JSON.parse(data);
            }
            callback(data);
        });
    }

    private errorHandle(): void {
        this.express.use(
            (err: Error & { status: number }, request: express.Request, response: express.Response, next: express.NextFunction): void => {
                //response.status(err.status || 500);
                response.json({
                    status: 0,
                    error: {
                        code: err.status,
                        message: "Server side error"
                    }
                });
            }
        );
    }
}
