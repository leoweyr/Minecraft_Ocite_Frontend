import { Composable } from "../Composable";


export class Delimiter implements Composable {
    private readonly delimiter: string;

    public constructor(chat: string) {
        this.delimiter = chat.repeat(21);
    }

    public async print(): Promise<string> {
        return this.delimiter;
    }
}
