const ProjectConfigManager = require('../../lib/services/ProjectConfigManager');
const logging = require('../../lib/logging');
const logger = logging.getLogger();

const { settingsFile1 } = require('../test-utils/data/settingsFiles');

let projectConfigManager;
let globalConfig = {
  settingsFile: settingsFile1,
  logger
};

beforeEach(() => {
  projectConfigManager = new ProjectConfigManager(globalConfig);
});

describe('Service ProjectConfigManager', () => {
  describe('contructor', () => {
    it('should set default values to keys of settingsFile if somwhow not provided', () => {
      const config = {
        settingsFile: {}
      };

      projectConfigManager = new ProjectConfigManager(config);

      expect(config.settingsFile.campaigns).toBeDefined();
      expect(config.settingsFile.campaigns.length).toBe(0);
    });
  });

  describe('method: isSettingsFileValid', () => {
    it('should return false if config is not defined', () => {
      const config = undefined;

      projectConfigManager = new ProjectConfigManager(config);
      expect(projectConfigManager.isSettingsFileValid(config)).toBe(false);
    });

    it('should return false if config.settingsFile is not defined', () => {
      const config = {};

      projectConfigManager = new ProjectConfigManager(config);
      expect(projectConfigManager.isSettingsFileValid(config)).toBe(false);
    });

    it('should return false if settingsFile has bad campaign schema', () => {
      const config = {
        settingsFile: {
          campaigns: [
            {
              id: 'SHOULD_BE_NUMBER',
              variations: {
                oh: 'SHOULD_BE_ARRAY_OF_OBJECTS'
              }
            }
          ]
        },
        logger
      };
      const spyInvalidateSettingsFileLog = jest.spyOn(config.logger, 'log');

      projectConfigManager = new ProjectConfigManager(config);
      expect(projectConfigManager.isSettingsFileValid(config)).toBe(false);
      expect(spyInvalidateSettingsFileLog).toHaveBeenCalled();
    });

    it('should return false if settingsFile has bad campaign variation schema', () => {
      const config = {
        settingsFile: {
          campaigns: [
            {
              id: 1,
              variations: [
                {
                  id: 'SHOULD_BE_NUMBER',
                  name: 123 // should be string
                }
              ]
            }
          ]
        },
        logger
      };
      const spyInvalidateSettingsFileLog = jest.spyOn(config.logger, 'log');

      projectConfigManager = new ProjectConfigManager(config);
      expect(projectConfigManager.isSettingsFileValid(config)).toBe(false);
      expect(spyInvalidateSettingsFileLog).toHaveBeenCalled();
    });

    it('should return false if settingsFile has bad campaign goal schema', () => {
      const config = {
        settingsFile: {
          campaigns: [
            {
              id: 'Hello',
              goals: {
                id: 'SHOULD_BE_NUMBER',
                identifier: 12 // should be a string
              }
            }
          ]
        },
        logger
      };
      const spyInvalidateSettingsFileLog = jest.spyOn(config.logger, 'log');

      projectConfigManager = new ProjectConfigManager(config);
      expect(projectConfigManager.isSettingsFileValid(config)).toBe(false);
      expect(spyInvalidateSettingsFileLog).toHaveBeenCalled();
    });

    it('should return true if config is valid', () => {
      const spyInvalidateSettingsFileMethod = jest.spyOn(projectConfigManager, 'validateSettingsFile');
      const isValid = projectConfigManager.isSettingsFileValid(globalConfig);

      expect(isValid).toBe(true);
      expect(spyInvalidateSettingsFileMethod).toHaveBeenCalledWith(globalConfig.settingsFile);
    });
  });

  describe('method: validateSettingsFile', () => {
    it('should validate the settingsFile schema', () => {
      const isValid = projectConfigManager.validateSettingsFile(globalConfig.settingsFile);

      expect(isValid).toBe(true);
    });
  });

  describe('metho: processsettingsFile', () => {
    it('should call _setVariationBucketing for each campaign in settingsFile', () => {
      const spySetVariationBucketingMethod = jest.spyOn(projectConfigManager, '_setVariationBucketing');
      const spyLog = jest.spyOn(globalConfig.logger, 'log');

      projectConfigManager.processsettingsFile(globalConfig);
      expect(spySetVariationBucketingMethod).toHaveBeenCalled();
      expect(spyLog).toHaveBeenCalled();
    });
  });

  describe('method: getConfig', () => {
    it('should return config', () => {
      expect(projectConfigManager.getConfig()).toEqual(globalConfig);
    });
  });

  describe('method: getSettingsFile', () => {
    it('should return settingsFile', () => {
      expect(projectConfigManager.getSettingsFile()).toEqual(globalConfig.settingsFile);
    });
  });
});
