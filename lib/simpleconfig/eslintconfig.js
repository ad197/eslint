/**
 * @fileoverview The @eslint/config utility
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { ObjectSchema } = require("@humanwhocodes/object-schema");
const { normalizePackageName } = require("../util/naming");
const ConfigCache = require("../config/config-cache");
const ConfigFile = require("../config/config-file");
const Linter = require("../linter");
const Plugins = require("../config/plugins");
const environments = require("../../conf/environments");

const debug = require("debug")("eslint:@eslint/config");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

// stub config context
class ConfigContext {
    constructor() {
        this.configCache = new ConfigCache();
        this.linterContext = new Linter();
        this.plugins = new Plugins(
            this.linterContext.environments,
            this.linterContext.defineRule.bind(this.linterContext)
        );
    }
}

const configContext = new ConfigContext();

function hydrateESLintRC(eslintRC, relativeTo) {

    // special case for eslint:recommended and eslint:all
    if (typeof eslintRC === "string") {
        return eslintRC;
    }

    const hydrated = Object.assign({}, eslintRC);

    // convert parser into object
    if (eslintRC.parser) {
        hydrated.parser = require(eslintRC.parser);
    }

    return hydrated;
}

function *flatTraverseESLintRC(eslintRC) {
    yield eslintRC;

    if (eslintRC.overrides) {
        for (const item of eslintRC.overrides) {
            yield item;
        }
    }
}

function translateESLintRC(config) {

    const translatedConfig = {};
    const configs = [translatedConfig];
    const keysToCopy = ["files", "globals", "settings", "parser", "parserOptions", "rules"];

    // copy over simple translations
    for (const key of keysToCopy) {
        if (key in config) {
            translatedConfig[key] = config[key];
        }
    }

    // translate env
    if (config.env) {
        for (const envName of Object.keys(config.env)) {
            configs.unshift(translateESLintRC(environments[envName]));
        }
    }

    // translate excludedFiles
    if (config.excludedFiles) {

        // can be array or string
        if (Array.isArray(config.excludedFiles)) {
            translatedConfig.ignores = config.excludedFiles;
        } else {
            translatedConfig.ignores = [config.excludedFiles];
        }
    }

    // translate plugins
    if (config.plugins) {
        const ruleNamespaces = {};
        translatedConfig.defs = {
            ruleNamespaces
        };

        for (const pluginName of config.plugins) {

            // assign rules from plugin
            const plugin = configContext.plugins.get(pluginName);
            ruleNamespaces[pluginName] = plugin.rules;

            // create a config for any processors
            if (plugin.processors) {
                for (const processorName of Object.keys(plugin.processors)) {
                    if (processorName.startsWith(".")) {
                        configs.unshift({
                            files: [ `**/*${processorName}`],
                            processor: plugin.processors[processorName]
                        });
                    }
                }
            }
        }
    }

    return configs;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function importESLintRC(configName, basePath) {
    const originalConfig = ConfigFile.load(configName, configContext, basePath);
    const hydratedConfig = hydrateESLintRC(originalConfig, basePath);
    const flattenedConfigs = [...flatTraverseESLintRC(hydratedConfig)];
    const translatedConfigs = flattenedConfigs.map(config => translateESLintRC(config));
    return translatedConfigs;
}

function importEnvGlobals(envName) {
    return environments[envName].globals;
}


module.exports = {
    importESLintRC,
    importEnvGlobals
};