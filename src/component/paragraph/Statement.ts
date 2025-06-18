import { Composable } from "../Composable";

export class Statement implements Composable {
    private readonly statement: string;

    public constructor(statement: string) {
        this.statement = statement;
    }

    public async print(): Promise<string> {
        return this.statement;
    }
}
