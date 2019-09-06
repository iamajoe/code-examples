import { IConfig as ICoreConfig, init as getCoreConfig } from 'toolbox-api/dist/config';

// --------------------------------------------------
// variables

export interface IConfig extends ICoreConfig {
  hideLogs: boolean;
}

let config: IConfig|null = null;

// --------------------------------------------------
// methods

// sets config on the singleton with a bypass
export const setConfig = (bypassConfig: Partial<IConfig>|null|undefined = null) => {
  config = getCoreConfig<IConfig>(bypassConfig);
  return config;
};

// gets config on the singleton
export const getConfig = (bypassConfig: Partial<IConfig>|null|undefined = null) => {
  if (config == null) {
    config = setConfig(bypassConfig);
  }

  return config;
};
