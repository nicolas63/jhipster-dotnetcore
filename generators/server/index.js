/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const chalk = require('chalk');
const ServerGenerator = require('generator-jhipster/generators/server');
const constants = require('../generator-dotnetcore-constants');
const dotnet = require('../dotnet');
const writeFiles = require('./files').writeFiles;
const prompts = require('./prompts');
const packagejs = require('../../package.json');
const configureGlobalDotnetcore = require('../utils').configureGlobalDotnetcore;

module.exports = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint dotnetcore')}`);
        }

        dotnet.hasDotnet().catch(err => {
            this.warning(
                "The 'dotnet' command is not present in the PATH, use it at your own risk! If you encounter a bug, please install .Net Core first (https://dotnet.microsoft.com/download/dotnet-core)."
            );
        });
    }

    get initializing() {
        const phaseFromJHipster = super._initializing();
        const jhipsterNetPhaseSteps = {
            setupServerConsts() {
                this.packagejs = packagejs;
                this.jhipsterNetVersion = packagejs.version;
                this.SERVER_SRC_DIR = constants.SERVER_SRC_DIR;
                this.SERVER_TEST_DIR = constants.SERVER_TEST_DIR;
                this.namespace = this.jhipsterConfig.namespace;
                this.databaseType = this.jhipsterConfig.databaseType;
                this.authenticationType = this.jhipsterConfig.authenticationType;

                const serverConfigFound =
                    this.namespace !== undefined && this.databaseType !== undefined && this.authenticationType !== undefined;

                if (this.baseName !== undefined && serverConfigFound) {
                    this.log(
                        chalk.green(
                            'This is an existing project, using the configuration from your .yo-rc.json file \n' +
                                'to re-generate the project...\n'
                        )
                    );
                    this.existingProject = true;
                }
            },
        };
        return Object.assign(phaseFromJHipster, jhipsterNetPhaseSteps);
    }

    get prompting() {
        return {
            askForModuleName: prompts.askForModuleName,
            askForServerSideOpts: prompts.askForServerSideOpts,
        };
    }

    get configuring() {
        return {};
    }

    get default() {
        const phaseFromJHipster = super._default();

        const customPhaseSteps = {
            configureGlobalDotnetcore,
            fixConfig() {
                this.jhipsterConfig.serverPort = 5000;
                this.jhipsterConfig.prodDatabaseType = 'mysql'; // set only for jdl-importer compatibility
            },
        };

        return Object.assign(phaseFromJHipster, customPhaseSteps);
    }

    get writing() {
        return writeFiles.call(this);
    }

    get end() {
        return {
            end() {
                this.log(chalk.green.bold(`\nCreating ${this.solutionName} .Net Core solution.\n`));
                dotnet
                    .newSln(this.solutionName)
                    .then(() =>
                        dotnet.slnAdd(`${this.solutionName}.sln`, [
                            `${constants.SERVER_SRC_DIR}${this.mainProjectDir}/${this.pascalizedBaseName}.csproj`,
                            `${constants.SERVER_TEST_DIR}${this.testProjectDir}/${this.pascalizedBaseName}${constants.PROJECT_TEST_SUFFIX}.csproj`,
                            `${constants.SERVER_SRC_DIR}${this.pascalizedBaseName}${constants.PROJECT_CROSSCUTTING_SUFFIX}/${this.pascalizedBaseName}${constants.PROJECT_CROSSCUTTING_SUFFIX}.csproj`,
                            `${constants.SERVER_SRC_DIR}${this.pascalizedBaseName}${constants.PROJECT_DOMAIN_SUFFIX}/${this.pascalizedBaseName}${constants.PROJECT_DOMAIN_SUFFIX}.csproj`,
                            `${constants.SERVER_SRC_DIR}${this.pascalizedBaseName}${constants.PROJECT_DTO_SUFFIX}/${this.pascalizedBaseName}${constants.PROJECT_DTO_SUFFIX}.csproj`,
                            `${constants.SERVER_SRC_DIR}${this.pascalizedBaseName}${constants.PROJECT_SERVICE_SUFFIX}/${this.pascalizedBaseName}${constants.PROJECT_SERVICE_SUFFIX}.csproj`,
                            `${constants.SERVER_SRC_DIR}${this.pascalizedBaseName}${constants.PROJECT_INFRASTRUCTURE_SUFFIX}/${this.pascalizedBaseName}${constants.PROJECT_INFRASTRUCTURE_SUFFIX}.csproj`,
                        ])
                    )
                    .catch(err => {
                        this.warning(`Failed to create ${this.solutionName} .Net Core solution: ${err}`);
                    })
                    .finally(() => {
                        this.log(chalk.green.bold('\nServer application generated successfully.\n'));
                        this.log(
                            chalk.green(
                                `Run your .Net Core application:\n${chalk.yellow.bold(
                                    `dotnet run --verbosity normal --project ./${constants.SERVER_SRC_DIR}${this.mainProjectDir}/${this.pascalizedBaseName}.csproj`
                                )}`
                            )
                        );
                        this.log(
                            chalk.green(
                                `Test your .Net Core application:\n${chalk.yellow.bold('dotnet test --list-tests --verbosity normal')}`
                            )
                        );
                    });
            },
        };
    }
};
