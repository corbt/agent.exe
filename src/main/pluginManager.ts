import fs from 'fs';
import path from 'path';
import { app } from 'electron';

interface Plugin {
  name: string;
  initialize: () => void;
}

class PluginManager {
  private plugins: Plugin[] = [];
  private pluginsDir: string;

  constructor() {
    this.pluginsDir = path.join(app.getPath('userData'), 'plugins');
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  loadPlugins() {
    console.log(`Attempting to load plugins from: ${this.pluginsDir}`);
    this.plugins = []; // Clear existing plugins before loading

    const pluginFiles = fs.readdirSync(this.pluginsDir);

    for (const file of pluginFiles) {
      if (file.endsWith('.js')) {
        const pluginPath = path.join(this.pluginsDir, file);
        try {
          const pluginContent = fs.readFileSync(pluginPath, 'utf-8');
          const PluginModule = eval(`(function(module, exports) { ${pluginContent} \n return module.exports; })(Object.create(null), {})`);
          const plugin: Plugin = new PluginModule();
          this.plugins.push(plugin);
          if (typeof plugin.initialize === 'function') {
            plugin.initialize();
          }
          console.log(`Loaded plugin: ${file}`);
        } catch (error) {
          console.error(`Error loading plugin ${file}:`, error);
        }
      }
    }
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }

  installPlugin(sourcePath: string) {
    const fileName = path.basename(sourcePath);
    const destPath = path.join(this.pluginsDir, fileName);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Installed plugin: ${fileName}`);
    // Reload plugins after installation
    this.loadPlugins();
  }
}

export const pluginManager = new PluginManager();
