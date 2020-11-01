/* eslint-disable consistent-return */
const chalk = require('chalk');
const LanguageGenerator = require('generator-jhipster/generators/languages');

// eslint-disable-next-line import/no-extraneous-dependencies
const constants = require('../generator-dotnetcore-constants');
const customizeDotnetPaths = require('../utils').customizeDotnetPaths;

const BLAZOR = constants.BLAZOR;

module.exports = class extends LanguageGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint dotnetcore')}`);
        }

        if (this.configOptions.baseName) {
            this.baseName = this.configOptions.baseName;
        }
    }

    get initializing() {
        return {
            ...super._initializing(),
            customizeDotnetPaths,
        };
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get default() {
        return super._default();
    }

    get composing() {
        return super._composing();
    }

    get loading() {
        return super._loading();
    }

    get preparing() {
        return {
            ...super._preparing(),
            preparingDotnet() {
                this.skipServer = true; // Skip server transalation for the dotnet
                if (this.clientFramework === BLAZOR) {
                    this.skipClient = true; // Skip client translation for the blazor framework
                }
            },
        };
    }

    get writing() {
        return super._writing();
    }

    /* get writing() {
        return {
            translateFile() {
                const from = 'src/main/webapp/';
                const to = `${constants.SERVER_SRC_DIR}${this.mainClientAppDir}/`;
                this.languagesToApply.forEach(language => {
                    if (!this.skipClient) {
                        this._installI18nClientFilesByLanguageDotNetCore(from, to, language);
                    }
                    // if (!this.skipServer) {
                    //     this.installI18nServerFilesByLanguage(this, constants.SERVER_MAIN_RES_DIR, language, constants.SERVER_TEST_RES_DIR);
                    // }
                    // statistics.sendSubGenEvent('languages/language', language);
                    this.replaceContent(
                        `${constants.SERVER_SRC_DIR}${this.mainClientAppDir}/i18n/${language}/home.json`,
                        'Java',
                        '.Net Core',
                        false
                    );
                });
            },
            write() {
                if (!this.skipClient) {
                    this.languages.forEach(
                        language => {
                            this._updateLanguagesInLanguagePipeDotNetCore(this.languages);
                            this._updateLanguagesInLanguageConstantNG2DotNetCore(this.languages);
                            this._updateLanguagesInWebpackDotNetCore(this.languages);
                            if (this.clientFramework === 'angularX') {
                                this._updateLanguagesInMomentWebpackNgxDotNetCore(this.languages);
                            }
                            // if (this.clientFramework === 'react') {
                            //     this.updateLanguagesInMomentWebpackReact(this.languages);
                            // }
                        }
                        // if (!this.skipServer) {
                        //     this.updateLanguagesInLanguageMailServiceIT(this.languages, this.packageFolder);
                        // }
                    );
                }
            },
        };
    } 

    get postWriting() {
        return super._postWriting();
    }

    _installI18nClientFilesByLanguageDotNetCore(from, to, lang) {
        const prefix = this.fetchFromInstalledJHipster('languages/templates');
        if (this.applicationType === 'gateway' && this.serviceDiscoveryType) {
            this._copyI18nFilesByNameDotNetCore(from, to, 'gateway.json', lang);
        }
        this._copyI18nFilesByNameDotNetCore(from, to, 'configuration.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'error.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'home.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'login.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'logs.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'metrics.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'password.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'register.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'sessions.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'settings.json', lang);
        this._copyI18nFilesByNameDotNetCore(from, to, 'user-management.json', lang);

        // tracker.json for Websocket
        if (this.websocket === 'spring-websocket') {
            this._copyI18nFilesByNameDotNetCore(from, to, 'tracker.json', lang);
        }

        // Templates
        this.template(`${prefix}/${from}i18n/${lang}/activate.json.ejs`, `${to}i18n/${lang}/activate.json`);
        this.template(`${prefix}/${from}i18n/${lang}/global.json.ejs`, `${to}i18n/${lang}/global.json`);
        this.template(`${prefix}/${from}i18n/${lang}/health.json.ejs`, `${to}i18n/${lang}/health.json`);
        this.template(`${prefix}/${from}i18n/${lang}/reset.json.ejs`, `${to}i18n/${lang}/reset.json`);
    }

    _copyI18nFilesByNameDotNetCore(from, to, fileToCopy, lang) {
        const prefix = this.fetchFromInstalledJHipster('languages/templates');
        this.copy(`${prefix}/${from}i18n/${lang}/${fileToCopy}`, `${to}i18n/${lang}/${fileToCopy}`);
    }

    _updateLanguagesInLanguagePipeDotNetCore(languages) {
        const fullPath =
            this.clientFramework === 'angularX'
                ? `${constants.SERVER_SRC_DIR}${this.mainClientAppDir}/app/shared/language/find-language-from-key.pipe.ts`
                : `${constants.SERVER_SRC_DIR}${this.mainClientDir}/app/config/translation.ts`;
        try {
            let content = '{\n';
            this.generateLanguageOptions(languages, this.clientFramework).forEach((ln, i) => {
                content += `        ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content += '        // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n    };';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /{\s*('[a-z-]*':)?([^=]*jhipster-needle-i18n-language-key-pipe[^;]*)\};/g,
                    content,
                },
                this
            );
        } catch (e) {
            this.log(
                chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
                    languages +
                    chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
            );
            this.debug('Error:', e);
        }
    }

    _updateLanguagesInLanguageConstantNG2DotNetCore(languages) {
        if (this.clientFramework !== 'angularX') {
            return;
        }
        const fullPath = `${constants.SERVER_SRC_DIR}${this.mainClientAppDir}/app/core/language/language.constants.ts`;
        try {
            let content = 'export const LANGUAGES: string[] = [\n';
            languages.forEach((language, i) => {
                content += `    '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content += '    // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n];';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /export.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\];/g,
                    content,
                },
                this
            );
        } catch (e) {
            this.log(
                chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') +
                    languages +
                    chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
            );
            this.debug('Error:', e);
        }
    }

    _updateLanguagesInWebpackDotNetCore(languages) {
        const fullPath = `${constants.SERVER_SRC_DIR}${this.mainClientDir}/webpack/webpack.common.js`;
        try {
            let content = 'groupBy: [\n';
            languages.forEach((language, i) => {
                content += `                    { pattern: "./src/i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
            content +=
                '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
                '                ]';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
                    content,
                },
                this
            );
        } catch (e) {
            this.log(
                chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
                    languages +
                    chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
            );
            this.debug('Error:', e);
        }
    }

    _updateLanguagesInMomentWebpackNgxDotNetCore(languages) {
        const fullPath = `${constants.SERVER_SRC_DIR}${this.mainClientDir}/webpack/webpack.prod.js`;
        try {
            let content = 'localesToKeep: [\n';
            languages.forEach((language, i) => {
                content += `                    '${this.getMomentLocaleId(language)}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '                    // jhipster-needle-i18n-language-moment-webpack - JHipster will add/remove languages in this array\n' +
                '                ]';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /localesToKeep:.*\[([^\]]*jhipster-needle-i18n-language-moment-webpack[^\]]*)\]/g,
                    content,
                },
                this
            );
        } catch (e) {
            this.log(
                chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
                    languages +
                    chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
            );
            this.debug('Error:', e);
        }
    } */
};
