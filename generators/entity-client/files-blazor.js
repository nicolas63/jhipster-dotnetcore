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
const constants = require('../generator-dotnetcore-constants');

/* Constants use throughout */
const CLIENT_SRC_DIR = constants.CLIENT_SRC_DIR;
const BlazorNeedle = require('../client/needle-api/needle-client-blazor');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const files = {
    blazorAppModels: [
        {
            path: CLIENT_SRC_DIR,
            templates: [
                {
                    file: 'Project.Client/Models/Model.cs',
                    renameTo: generator => `${generator.mainClientDir}/Models/${generator.asModel(generator.entityClass)}.cs`,
                },
            ],
        },
        {
            path: CLIENT_SRC_DIR,
            templates: [
                {
                    file: 'Project.Client/Services/EntityServices/EntityService/EntityService.cs',
                    renameTo: generator =>
                        `${generator.mainClientDir}/Services/EntityServices/EntityService/${generator.entityClass}/${generator.entityClass}Service.cs`,
                },
            ],
        },
        {
            path: CLIENT_SRC_DIR,
            templates: [
                {
                    file: 'Project.Client/Services/EntityServices/EntityService/IEntityService.cs',
                    renameTo: generator =>
                        `${generator.mainClientDir}/Services/EntityServices/EntityService/${generator.entityClass}/I${generator.entityClass}Service.cs`,
                },
            ],
        },
    ],
};

module.exports = {
    writeFiles,
    files,
};

function writeFiles() {
    this.writeFilesToDisk(files, this, false, 'blazor');
    const blazorNeedle = new BlazorNeedle(this);
    blazorNeedle.addEntityToMenu(this.entityClass);
}
