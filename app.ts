import { readFile, writeFile } from "fs/promises";
import { EOL } from "os";

interface IWritable {
  write(menuStr: string): Promise<void>;
}

interface MealDetail {
    mealName: string;
    mealQuantity: string;
    mealPrice: string;
}

interface MealTypeObj {
    [key: string]: MealDetail[];
    
}

class HtmlWriter implements IWritable {
  async write(menuStr: string) {
    let fileContent = '<!DOCTYPE html><html><body>';
    const data = JSON.parse(menuStr);
    const keys = Object.keys(data);
    keys.forEach((key) => {

      fileContent += `<h2>${key} Items</h2><table><tr><th>Meal Name</th><th>Quantity</th><th>Price</th></tr>`;
      if (Array.isArray(data[key])) {
        data[key].forEach((item: MealDetail) => {
          fileContent += (`<tr><td>${item.mealName}</td><td>${item.mealQuantity}</td><td>${item.mealPrice}</td></tr>`);
        })
      }
      fileContent += '</table>';
    })
    fileContent += '</body></html>';
    await writeFile("menu.html", fileContent);
  }
}

class TextWriter implements IWritable {
  async write(menuStr: string) {
    let fileContent = '';
    const data = JSON.parse(menuStr);
    const keys = Object.keys(data);
    keys.forEach((key) => {

      fileContent += (EOL + `* ${key} Items *` + EOL);
      if (Array.isArray(data[key])) {
        data[key].forEach((item: MealDetail) => {
          fileContent += (`- ${item.mealName} - ${item.mealQuantity} - ${item.mealPrice} ${EOL}`);
        })
      }
    })

    
    await writeFile("menu.txt", fileContent);
  }
}

class CsvMenuParser {
  public csvData: string[] = [];
  private constructor(data: string[]) {
    this.csvData = data;
  }

  static async buildMenu(filename: string) {
    const data = await readFile(filename, "utf-8");
    return new CsvMenuParser(data.split(EOL));
  }

  async writeMenu(writer: IWritable) {
    let data = this.csvData;
    const mealTypeObj: MealTypeObj = {};

    data.forEach((line) =>{
        const eachLine = line.split(',');
        const mealType = eachLine[0];
        const mealDetail: MealDetail = {
            mealName: eachLine[1],
            mealQuantity: eachLine[2],
            mealPrice: eachLine[3]
        } 
        if (!mealTypeObj[mealType]) {
            mealTypeObj[mealType] = [];
        }
        mealTypeObj[mealType].push(mealDetail);

        
     })

     writer.write(JSON.stringify(mealTypeObj));
  }
}

async function main() {
  const menu = await CsvMenuParser.buildMenu("menu.csv");
  menu.writeMenu(new TextWriter());
  menu.writeMenu(new HtmlWriter());
}
main();
