import { Composable } from "../Composable";
import { Delimiter } from "./Delimiter";


export class TextBlock implements Composable {
    private readonly paragraphs: Array<Composable> = new Array<Composable>();

    public addLine(paragraph: Composable): TextBlock {
        this.paragraphs.push(paragraph);

        return this;
    }

    public async print(): Promise<string> {
        let textBlockString: string = "";

        for (let lineIndex: number = 0; lineIndex < this.paragraphs.length; lineIndex++) {
            textBlockString += `${await this.paragraphs[lineIndex].print()}§r`;

            if (lineIndex < this.paragraphs.length - 1) {
                textBlockString += "\n";
            } else {
                textBlockString += "\n" + await new Delimiter("─").print();
            }
        }

        return textBlockString;
    }
}
