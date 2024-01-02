type PredictionApiResponse = {
    id: string;
    predictions: [Prediction],
}

type Prediction = {
    probability: number,
    tagId: string,
    tagName: string,
}

type Label = "dog" | "cat" | "hedgehog" | "owl" | "chinchilla";
type Emoji = "dog2" | "cat2" | "hedgehog" | "owl" | "mouse2" | "question";

export class Animal {
    private readonly db: D1Database;
    private readonly slackBotToken: string;
    private readonly predictionApi: string;
    private readonly predictionApiKey: string;

    constructor(DB: D1Database, slackBotToken: string, predictionApi: string, predictionApiKey: string) {
        this.db = DB;
        this.slackBotToken = slackBotToken;
        this.predictionApi = predictionApi;
        this.predictionApiKey = predictionApiKey;
    }

    public async predict(url: string): Promise<Label> {
        const imageRes = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.slackBotToken}`
            }
        })
        if(!imageRes.ok){
            throw new Error();
        }
        const image = imageRes.body;

        const res = await fetch(this.predictionApi, {
            method: "POST",
            headers: {
                "Prediction-Key": this.predictionApiKey,
                "Content-Type": "application/octet-stream",
            },
            body: image,
        })
        if (!res.ok) {
            throw new Error();
        }

        const json: PredictionApiResponse = await res.json()
        if(!json.predictions.length) {
            throw new Error();
        }
        const prediction = json.predictions[0];
        const label = this.getLabel(prediction.tagName);
        if(!label){
            throw new Error();
        }

        return label;
    }

    public getEmoji(label: Label): Emoji {
        switch (label) {
            case "dog":
                return "dog2";
            case "cat":
                return "cat2";
            case "hedgehog":
                return "hedgehog";
            case "owl":
                return "owl";
            case "chinchilla":
                return "mouse2";
            default:
                return "question";
        }
    }

    private getLabel(s: string): Label{
        switch (s) {
            case "dog":
                return "dog";
            case "cat":
                return "cat";
            case "hedgehog":
                return "hedgehog";
            case "owl":
                return "owl";
            case "chinchilla":
                return "chinchilla";
            default:
                throw new Error();
        }
    }

    public async getByAnimal(label: Label): Promise<string> {
        const { results, success } = await this.db.prepare(
          "SELECT url FROM files WHERE animal = ? ORDER BY RANDOM() limit 1"
        )
          .bind(label)
          .all();

        if(!success) {
            throw new Error();
        }
        return String(results[0]["url"]);
    }

    public async getByRandom(): Promise<string> {
        const { results, success } = await this.db.prepare(
          "SELECT url FROM files ORDER BY RANDOM() limit 1"
        )
          .all();

        if(!success) {
            throw new Error();
        }
        return String(results[0]["url"]);
    }

    public async AddAnimal(url: string, label: Label): Promise<void> {
        const { success } = await this.db.prepare(
          "INSERT INTO files (url, animal) VALUES (?, ?)"
        )
          .bind(url, label)
          .run()

        if(!success) {
            throw new Error();
        }
    }
}
