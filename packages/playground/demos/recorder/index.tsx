import { RecorderApp, recorderSettings } from '../../src/apps/RecorderApp';
import { mountDemo } from '../../src/player/mount';

mountDemo(<RecorderApp />, { settingsLayer: recorderSettings });
