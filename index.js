#!/usr/bin/env node

const program = require('commander');
const fs = require('fs')
const handlebars = require("handlebars")
const inquirer = require("inquirer")
const ora = require('ora');
const chalk = require('chalk')

const logSymbols = require('log-symbols');

const download = require('download');

let zipUrl = "https://ooszy.cco.vin/font/theme-cli-template.zip"
let zipName = "theme-cli-template.zip"

function downloadTemplate(name,answers) {
    let waitInfo = chalk.blue("please wait a moment, the theme template file is downloading from "+ zipUrl +" \n");
    const spinner = ora({
        text: waitInfo,
        prefixText: chalk.green("[") + chalk.white("1") + chalk.green("]"),
        spinner: {
            "interval": 80,
            "frames": [
                "⣾",
                "⣽",
                "⣻",
                "⢿",
                "⡿",
                "⣟",
                "⣯",
                "⣷"
            ]
        },
        color: 'green'
    }).start();

    let configInfo = {
        name: name,
        description: answers.description,
        logoTitle: answers.logoTitle
    }

    download(zipUrl, name).then(() => {
        spinner.stop()
        console.log(chalk.green("\nplease wait a moment, the theme template file is downloading from "+ zipUrl +" \n"))
        //从url中下载成功
        //将zip进行解压
        new Promise((resolve,reject) => {
            const AdmZip = require('adm-zip');
            const file = new AdmZip("./" + name +'/' + zipName);
            file.extractAllTo('./' + name);
            resolve()
        }).then(() => {
            spinner.stop()
            console.log(chalk.green("\n[") + chalk.white("1") + chalk.green("] ") + chalk.green("template file is downloaded successfully\n"));
            spinner.prefixText = logSymbols.success

            spinner.prefixText = chalk.green("[") + chalk.white("2") + chalk.green("]")
            spinner.text = chalk.green("editing package.json ")
            spinner.start()

            try {
                const packageFile = `${name}/package.json`;
                const packageContent = fs.readFileSync(packageFile).toString();
                const packageResult = handlebars.compile(packageContent)(configInfo);
                fs.writeFileSync(packageFile, packageResult);
                spinner.stop()
                console.log(chalk.green("[") + chalk.white("2") + chalk.green("] ") + chalk.green("package.json file successfully modified\n"));
            }catch (e) {
                spinner.stop()
                console.log(chalk.red("[") + chalk.white("2") + chalk.red("] ") + chalk.green("The package.json file failed to be modified successfully\n"));
                process.exit(1)
            }

            spinner.prefixText = chalk.green("[") + chalk.white("3") + chalk.green("]")
            spinner.text = chalk.green("editing config.js ")
            spinner.start()

            try {
                const configFile = `${name}/docs/.vuepress/config.js`;
                const configContent = fs.readFileSync(configFile).toString();
                const configResult = handlebars.compile(configContent)(configInfo);
                fs.writeFileSync(configFile, configResult);
                spinner.stop()
                console.log(chalk.green("[") + chalk.white("3") + chalk.green("] ") + chalk.green("config.js file successfully modified\n"));
            }catch (e) {
                spinner.stop()
                console.log(chalk.red("[") + chalk.white("3") + chalk.red("] ") + chalk.green("The config.js file failed to be modified successfully\n"));
                process.exit(1)
            }

            spinner.stop()
            console.log(chalk.green("please run the command: ") + chalk.white("cd " + name + " | ") + chalk.white("npm install or yarn install | npm run dev or yarn dev"))

            process.exit(1)
        })
    }).catch((e) => {
        //从url中下载失败
        spinner.prefixText = logSymbols.error
        spinner.fail(chalk.yellow("template file download failed\n"));

        inquirer.prompt([
            {
                name: 'type',
                message: chalk.red('restart download template' + chalk.blue(" true ") + chalk.red("or") + chalk.blue(" false ") + "?")
            }
        ]).then((reAnswer) => {
            if (reAnswer.type === "true") {
                spinner.text = chalk.blue("please wait a moment, the theme template file is downloading from "+ zipUrl +" \n");
                downloadTemplate(name,answers)
            }else {
                console.log(chalk.blue("you can rerun") + chalk.white(" aurora blogName ") + chalk.blue("to download template\n"))
                process.exit(1)
            }
        })
    });
}

program
    .version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        inquirer.prompt([
            {
                name: 'description',
                message: chalk.blue('what is the description ?')
            },
            {
                name: 'logoTitle',
                message: chalk.blue("what is the logoText ?")
            }
        ]).then((answers) => {
            if (answers.description === "") {
                answers.description = "aurora blog"
            }

            if (answers.logoTitle === "") {
                answers.logoTitle = "Aurora"
            }

            console.log(chalk.yellow("\nyour description: " + answers.description));
            console.log(chalk.yellow("your logoTitle: " + answers.logoTitle + "\n"));

            downloadTemplate(name,answers)
        })
    })
    .parse(process.argv);

